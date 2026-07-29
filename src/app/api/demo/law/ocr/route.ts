import { NextResponse } from "next/server";
import { createOpenAI } from "@/lib/api/openai";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "尚未設定 OPENAI_API_KEY，無法辨識圖片。" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "請上傳圖片檔。" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "目前只支援圖片檔。" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "圖片請小於 8MB。" }, { status: 400 });
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
            "你是考試答案 OCR 助手。請辨識圖片中的手寫或印刷中文作答內容，只輸出辨識後的答案文字。不要批改、不要補充說明、不要加入圖片中不存在的內容。若看不清楚，請保留可辨識內容並用「[不清楚]」標記。",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "請將這張圖片中的民法申論答案轉成可批改的純文字。",
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "圖片辨識失敗。" },
      { status: 500 },
    );
  }
}
