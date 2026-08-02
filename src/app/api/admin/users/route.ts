import { NextResponse } from "next/server";
import { getAuthedUser, getUserRole } from "@/lib/api/auth";
import { assertServerEnv } from "@/lib/env";
import { createSupabaseAdmin } from "@/lib/supabase/admin";

const allowedRoles = new Set(["user", "admin"]);
const allowedPlans = new Set(["free", "member"]);

export async function PATCH(request: Request) {
  try {
    assertServerEnv();
    const { user, error } = await getAuthedUser(request);
    if (error) return error;

    const role = await getUserRole(user.id);
    if (role !== "admin") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const targetUserId = String(body.user_id ?? "").trim();
    const nextRole = body.role === undefined ? undefined : String(body.role);
    const nextPlan = body.plan === undefined ? undefined : String(body.plan);

    if (!targetUserId) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }
    if (nextRole !== undefined && !allowedRoles.has(nextRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (nextPlan !== undefined && !allowedPlans.has(nextPlan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (targetUserId === user.id && nextRole === "user") {
      return NextResponse.json({ error: "Cannot remove your own admin role" }, { status: 400 });
    }

    const patch: { role?: string; plan?: string } = {};
    if (nextRole !== undefined) patch.role = nextRole;
    if (nextPlan !== undefined) patch.plan = nextPlan;

    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: "No change" }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { error: updateError } = await supabase.from("user_profiles").update(patch).eq("id", targetUserId);
    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Admin user update failed" }, { status: 500 });
  }
}
