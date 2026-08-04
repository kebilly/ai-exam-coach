import { NextResponse } from "next/server";
import { assertMemberUnlocked, ensureProfile, getAuthedUser } from "@/lib/api/auth";
import { assertUsageAllowed, logUsage } from "@/lib/api/usage";
import { createOpenAI } from "@/lib/api/openai";
import { assertServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;
    await ensureProfile(user);
    await assertMemberUnlocked(user.id);
    await assertUsageAllowed(user.id, "law_ocr");

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "請上傳圖片檔案。" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "只支援圖片檔案。" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "圖片大小不得超過 8MB。" }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;

    const openai = createOpenAI();
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "你是民法申論答案 OCR 助手。請忠實辨識圖片中的手寫或印刷文字，只輸出可讀文字。不要批改、不要補寫、不要猜測不存在的內容；無法辨識處請以「[無法辨識]」標記。",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "請辨識這張民法申論答案圖片中的文字，保留段落與標號。" },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    await logUsage(user.id, "law_ocr");

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "OCR failed" }, { status: 500 });
  }
}
