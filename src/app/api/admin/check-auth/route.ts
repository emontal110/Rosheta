import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!sessionToken || !verifyAdminSessionToken(sessionToken)) {
    return NextResponse.json(
      { authenticated: false, redirect: "/admin/login" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email: "emontal.33@gmail.com",
      role: "ADMIN",
    },
  });
}
