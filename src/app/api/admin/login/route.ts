import { NextResponse } from "next/server";
import { hashPassword, verifyPassword, createAdminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

const ADMIN_EMAIL = "emontal.33@gmail.com";
const ADMIN_PASSWORD_RAW = "EMOmoro30630";
const ADMIN_PASSWORD_HASH = hashPassword(ADMIN_PASSWORD_RAW);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال البريد الإلكتروني وكلمة المرور." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check credentials match configured admin
    if (trimmedEmail !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني." },
        { status: 401 }
      );
    }

    // Verify password hash
    const isPasswordValid = verifyPassword(password, ADMIN_PASSWORD_HASH);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "كلمة المرور غير صحيحة." },
        { status: 401 }
      );
    }

    // Create session token
    const token = createAdminSessionToken(ADMIN_EMAIL);

    // Create Response with HttpOnly Cookie
    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      redirect: "/admin/subscriptions",
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 Hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء تسجيل الدخول." },
      { status: 500 }
    );
  }
}
