import { NextResponse } from "next/server";
import { ensureProfile, getAuthedUser, getUserProfile } from "@/lib/api/auth";
import { assertServerEnv, assertSupabaseEnv } from "@/lib/env";

export async function GET(request: Request) {
  try {
    assertSupabaseEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;
    await ensureProfile(user);

    const profile = await getUserProfile(user.id);
    return NextResponse.json({ profile });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Profile failed" }, { status: 500 });
  }
}

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
