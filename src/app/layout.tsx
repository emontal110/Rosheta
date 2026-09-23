import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  metadataBase: new URL("https://rosheta-iota.vercel.app"),
  title: "PenRx+ (بن آر إكس +) - Medical Prescription & Clinic Platform",
  description:
    "تطبيق PenRx+ (بن آر إكس +) لإدارة العيادات الطبية، كتابة الروشتات، بنك الأدوية المصري، وفحص التفاعلات بالذكاء الاصطناعي على الأندرويد والآيفون والويب.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "PenRx+ (بن آر إكس +) - منصة الروشتة الطبية الذكية",
    description: "تطبيق PenRx+ لإدارة العيادات الطبية والبحث في دليل الأدوية وتفعيل الاشتراكات.",
    url: "https://rosheta-iota.vercel.app",
    siteName: "PenRx+ Platform",
    images: [
      {
        url: "https://rosheta-iota.vercel.app/icon-512.png",
        width: 512,
        height: 512,
        alt: "PenRx+ Medical App Logo",
        type: "image/png",
      },
    ],
    locale: "ar_EG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PenRx+ (بن آر إكس +)",
    description: "منصة الروشتة الطبية الذكية للعيادات والمراكز الطبية",
    images: ["https://rosheta-iota.vercel.app/icon-512.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PenRx+ Medical",
  },
};


export const viewport: Viewport = {
  themeColor: "#131b24",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;800&family=Almarai:wght@400;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=Cairo:wght@300;400;600;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Inter:wght@400;600;700&family=Readex+Pro:wght@400;600;700&family=Tajawal:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
