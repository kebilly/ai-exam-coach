import { NextResponse } from "next/server";
import { getAuthedUser, ensureProfile } from "@/lib/api/auth";
import { assertServerEnv } from "@/lib/env";

export async function POST(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const body = await request.json().catch(() => ({}));
    await ensureProfile(user, body.display_name);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Profile failed" }, { status: 500 });
  }
}

