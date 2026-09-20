import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "بوابة الاشتراكات وتفعيل الأجهزة - Rosheta (روشتة)",
  description:
    "اختر الباقة المناسبة لعيادتك في تطبيق روشتة الطبي واستكشف مميزات بنك الأدوية والذكاء الاصطناعي مع إمكانية التجربة المجانية لمدة 30 يوماً.",
  openGraph: {
    title: "بوابة الاشتراكات وتفعيل الأجهزة - Rosheta (روشتة)",
    description: "اختر الباقة المناسبة لعيادتك واستمتع بكافة مميزات إدارة العيادة والروشتات الإلكترونية والعمل بدون إنترنت.",
    url: "https://rosheta-iota.vercel.app/subscriptions",
    siteName: "Rosheta Medical Platform",
    images: [
      {
        url: "https://rosheta-iota.vercel.app/icon-512.png",
        width: 512,
        height: 512,
        alt: "Rosheta Medical App Logo",
        type: "image/png",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "بوابة الاشتراكات وتفعيل الأجهزة - Rosheta (روشتة)",
    description: "اختر الباقة المناسبة لعيادتك واستمتع بكافة مميزات إدارة العيادة والروشتات الإلكترونية.",
    images: ["https://rosheta-iota.vercel.app/icon-512.png"],
  },
};

export default function SubscriptionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
