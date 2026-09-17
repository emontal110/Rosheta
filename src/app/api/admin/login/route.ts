import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { hashPassword, verifyPassword, createAdminSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";

const prisma = new PrismaClient();

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

    // Verify email match
    if (trimmedEmail !== ADMIN_EMAIL.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني." },
        { status: 401 }
      );
    }

    // Query Database for Admin User
    let dbUser = null;
    try {
      dbUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      // Auto-Seed in DB if user does not exist in DB yet
      if (!dbUser) {
        let clinic = await prisma.clinic.findFirst();
        if (!clinic) {
          clinic = await prisma.clinic.create({
            data: {
              name: "Rosheta System Administration",
              specialty: "System Administration",
              primaryColor: "#059669",
            },
          });
        }

        dbUser = await prisma.user.create({
          data: {
            id: "user-admin-001",
            clinicId: clinic.id,
            name: "Rosheta System Administrator",
            email: ADMIN_EMAIL,
            role: "ADMIN",
            title: "System Admin",
            passwordHash: ADMIN_PASSWORD_HASH,
          },
        });
      }
    } catch (dbError) {
      console.warn("Database lookup warning (using secure auth fallback):", dbError);
    }

    // Verify Password against DB or Fallback Hash
    const targetHash = dbUser?.passwordHash || ADMIN_PASSWORD_HASH;
    const isPasswordValid = verifyPassword(password, targetHash);

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
      message: "تم تسجيل الدخول بنجاح وتأكيد بيانات المستجيب في قاعدة البيانات",
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
      { success: false, error: "حدث خطأ أثناء عملية تسجيل الدخول." },
      { status: 500 }
    );
  }
}
