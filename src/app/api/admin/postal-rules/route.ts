import { NextResponse } from "next/server";
import { assertOpenAiEnv, assertSupabaseEnv } from "@/lib/env";
import { getAuthedUser, getUserRole } from "@/lib/api/auth";
import { createOpenAI, safeJsonParse } from "@/lib/api/openai";
import { createSupabaseAdmin } from "@/lib/supabase/admin";
import {
  buildPostalRulesPrompt,
  postalGeneratedQuestionsSchema,
  postalLawAreas,
  postalQuestionFormats,
  postalRuleQuestionSchema,
  seedPostalQuestions,
  validatePostalQuestion,
  type PostalCareerLevel,
  type PostalLawArea,
  type PostalQuestionFormat,
  type PostalRuleQuestion,
} from "@/lib/postal-regulations";

const unavailableTableCodes = ["42P01", "42501", "PGRST205"];

async function assertAdmin(request: Request) {
  assertSupabaseEnv();
  const { user, error } = await getAuthedUser(request);
  if (error) return { user: null, error };
  const role = await getUserRole(user.id);
  if (role !== "admin") return { user: null, error: NextResponse.json({ error: "Admin only" }, { status: 403 }) };
  return { user, error: null };
}

export async function GET(request: Request) {
  try {
    const { error } = await assertAdmin(request);
    if (error) return error;

    const supabase = createSupabaseAdmin();
    const { data, error: fetchError } = await supabase.from("postal_rule_questions").select("*").order("created_at", { ascending: false }).limit(150);

    if (fetchError) {
      if (unavailableTableCodes.includes(fetchError.code ?? "")) {
        return NextResponse.json({ questions: [], setupRequired: true });
      }
      throw fetchError;
    }
    return NextResponse.json({ questions: data ?? [], setupRequired: false });
  } catch (error) {
    return NextResponse.json({ error: formatApiError(error, "Postal rules admin failed") }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await assertAdmin(request);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const mode = String(body.mode ?? "ai");
    const count = Math.max(1, Math.min(Number(body.count ?? 5), 10));
    const careerLevel = String(body.career_level ?? "professional_2_to_1") as PostalCareerLevel;
    const questionFormat = String(body.question_format ?? "single_choice") as PostalQuestionFormat;
    const lawArea = String(body.law_area ?? "郵政法") as PostalLawArea;

    let questions: PostalRuleQuestion[];
    if (mode === "seed") {
      questions = seedPostalQuestions.slice(0, count).map((item) => ({ ...item, review_status: "approved" }));
    } else {
      assertOpenAiEnv();
      if (!postalLawAreas.includes(lawArea) || !postalQuestionFormats.some((item) => item.value === questionFormat)) {
        return NextResponse.json({ error: "Invalid postal rules generation settings" }, { status: 400 });
      }
      const openai = createOpenAI();
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.4,
        messages: [
          { role: "system", content: "You generate postal regulation exam questions as strict JSON only." },
          { role: "user", content: buildPostalRulesPrompt({ careerLevel, questionFormat, lawArea, count }) },
        ],
      });
      const raw = completion.choices[0]?.message?.content ?? "";
      const parsed = postalGeneratedQuestionsSchema.parse(safeJsonParse(raw));
      questions = parsed.questions.map((item) => ({
        ...postalRuleQuestionSchema.parse(item),
        source_type: "ai_generated_pending_review",
        review_status: "pending",
      }));
    }

    const validated = questions.map((question) => {
      const errors = validatePostalQuestion(question);
      return {
        ...question,
        review_status: errors.length ? "needs_edit" : question.review_status,
        tags: [...new Set([...(question.tags ?? []), ...(errors.length ? ["needs_review"] : [])])],
      };
    });

    const supabase = createSupabaseAdmin();
    const { data, error: insertError } = await supabase.from("postal_rule_questions").insert(validated).select("*");

    if (insertError) {
      if (unavailableTableCodes.includes(insertError.code ?? "")) {
        return NextResponse.json(
          { error: "郵政法規資料表尚未建立。請先到 Supabase SQL Editor 執行更新後的 supabase/schema.sql 與 supabase/security-hardening.sql。" },
          { status: 500 },
        );
      }
      throw insertError;
    }
    return NextResponse.json({ questions: data ?? [] });
  } catch (error) {
    return NextResponse.json({ error: formatApiError(error, "Postal rules generation failed") }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await assertAdmin(request);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    const reviewStatus = String(body.review_status ?? "").trim();

    if (!id || !["approved", "rejected", "needs_edit", "pending"].includes(reviewStatus)) {
      return NextResponse.json({ error: "Invalid review update" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const patch: Record<string, unknown> = {
      review_status: reviewStatus,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };
    if (reviewStatus === "approved") patch.source_type = "ai_generated_reviewed";

    const { error: updateError } = await supabase.from("postal_rule_questions").update(patch).eq("id", id);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: formatApiError(error, "Postal rules review failed") }, { status: 500 });
  }
}

function formatApiError(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const item = error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown };
    const parts = [
      typeof item.code === "string" ? `[${item.code}]` : "",
      typeof item.message === "string" ? item.message : "",
      typeof item.details === "string" ? item.details : "",
      typeof item.hint === "string" ? item.hint : "",
    ].filter(Boolean);
    if (parts.length) return parts.join(" ");
  }
  return fallback;
}
