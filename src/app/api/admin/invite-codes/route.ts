import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getAuthedUser, getUserRole } from "@/lib/api/auth";
import { assertSupabaseEnv } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    assertSupabaseEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const count = clampInviteCount(Number(body.count ?? 1));
    const labelBase = String(body.label ?? "member invite").trim() || "member invite";

    const generated = Array.from({ length: count }, (_, index) => {
      const code = `LAW-${randomBytes(4).toString("hex").toUpperCase()}-${randomBytes(4).toString("hex").toUpperCase()}`;
      const codeHash = createHash("sha256").update(code).digest("hex");
      const label = count > 1 ? `${labelBase}-${String(index + 1).padStart(2, "0")}` : labelBase;
      return { code, codeHash, label };
    });

    const supabase = createSupabaseAdmin();
    const { error: insertError } = await supabase.from("member_invite_codes").insert(
      generated.map((item) => ({
        code_hash: item.codeHash,
        label: item.label,
        max_uses: 1,
      })),
    );
    if (insertError) throw insertError;

    return NextResponse.json({
      ok: true,
      codes: generated.map(({ code, label }) => ({ code, label })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invite code generation failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    assertSupabaseEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const id = String(body.id ?? "").trim();
    const active = Boolean(body.active);

    if (!id) {
      return NextResponse.json({ error: "Missing invite code id" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { error: updateError } = await supabase.from("member_invite_codes").update({ active }).eq("id", id);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invite code update failed" }, { status: 500 });
  }
}

function clampInviteCount(value: number) {
  if (!Number.isInteger(value) || value < 1) return 1;
  return Math.min(value, 50);
}
