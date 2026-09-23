# 🩺 PenRx+ (بن آر إكس +) - Smart Medical Prescription & Clinic Platform

منظومة **PenRx+** الشاملة لإدارة الروشتات الطبية الإلكترونية، بنك الأدوية المصري، وفحص تفاعلات الأدوية بالذكاء الاصطناعي مع دعم تطبيقات الهواتف الذكية **Android APK** و **iOS App** وموقع الويب الموحد المربوط بقاعدة بيانات Supabase.

---

## 🔗 روابط هامة وسريعة (Quick Links):

- 📱 **[تحميل تطبيق الأندرويد والآيفون (App Download Hub)](https://rosheta.vercel.app)**
- 👑 **[بورتال أدمن تفعيل الحسابات والاشتراكات (Admin Portal)](https://rosheta.vercel.app/admin/subscriptions)**
  - الرابط المحلي: `http://localhost:3000/admin/subscriptions`
- 💳 **[صفحة باقات الاشتراك والأسعار (Subscriptions Page)](https://rosheta.vercel.app/subscriptions)**
  - الرابط المحلي: `http://localhost:3000/subscriptions`

---

## 🌟 أبرز مميزات النظام المتكامل (PenRx+):

1. **📱 تطبيق Android APK وتطبيق iOS متزامن:**
   - تطبيق أندرويد حقيقي جاهز للتحميل والتثبيت المباشر `PenRx+.apk`.
   - تثبيت حقيقي ومباشر للآيفون (iOS PWA Web Clip) بدون تحذيرات 0% Warnings وبدون متجر.
2. **🆔 نظام معرّف الجهاز العتادي الثابت (Hardware Device ID):**
   - حل مشكلة تكرار الأجهزة والاشتراكات عبر استخراج معرّف الأندرويد والويب الثابت.
3. **🇪🇬 بنك الأدوية المصري الشامل (43,500+ دواء مسجل):**
   - محرك بحث لحظي فائق السرعة بالاسم التجاري، المادة الفعالة، الشركة المصنعة، أصل المستحضر، والسعر.
4. **🤖 مساعد الذكاء الاصطناعي لفحص الأمان والتفاعلات:**
   - فحص تلقائي لحظي لتكرار المواد الفعالة، تعارض الأدوية، وحساسية البنسلين مع توصيات طبية دقيقة.
5. **💬 طباعة وإرسال الروشتات عبر الواتساب:**
   - تصدير الروشتة بدقة عالية بصيغ PDF وصور وإرسالها مباشرة لرقم المريض بنقرة واحدة.
6. **👑 بورتال منفصل للتحكم وتفعيل الاشتراكات (`/admin/subscriptions`):**
   - تفعيل الحسابات وتحديد مدة التفعيل (شهر، 3 شهور، 6 شهور، سنة، أو أيام مخصصة) فوراً.

---

## 🛠️ تقنيات المشروع (Tech Stack):

- **Framework:** Next.js 14 (App Router)
- **Mobile Native:** Capacitor 6 (Android Project `com.penrx.app` + iOS PWA)
- **Styling:** Tailwind CSS & Vanilla Glassmorphism
- **Database & ORM:** Supabase (Cloud PostgreSQL) + Prisma ORM
- **State Management:** Zustand (with LocalStorage Persistence)
- **Icons & UI:** Lucide React & Framer Motion
- **Deployment & Hosting:** Vercel + GitHub + Automatic Cloud Updates (OTA)


---

## 🚀 تشغيل المشروع محلياً (Local Development):

```bash
# 1. تثبيت الحزم
npm install

# 2. توليد Prisma Client
npx prisma generate

# 3. تشغيل سيرفر التطوير
npm run dev

# أو تشغيل بورتال الأدمن مباشرة عبر ملف البات
Start-Admin-Portal.bat
```

---

## ⚙️ إعدادات النشر على Vercel و Supabase:

1. **Supabase Database String (`.env`):**
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.qspaigplwyvpqbmszpgc.supabase.co:5432/postgres"
   NEXT_PUBLIC_SUPABASE_URL="https://qspaigplwyvpqbmszpgc.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
   ```

2. **رفع جداول الـ SQL لـ Supabase:**
   - استخدام ملف `schema.sql` في الـ SQL Editor لـ Supabase.
   - أو تشغيل: `npx prisma db push`

---

© 2026 Rosheta Platform. All Rights Reserved.
