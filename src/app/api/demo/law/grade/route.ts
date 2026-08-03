import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Demo grading API is disabled. Please sign in and use the formal member practice page." },
    { status: 403 },
  );
}
