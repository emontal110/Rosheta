# 🩺 Rosheta (روشتة) - Egyptian Medical Prescription Platform & PWA

منظومة **Rosheta** لإدارة الروشتات الطبية الإلكترونية، بنك الأدوية المصري، وفحص تفاعلات الأدوية بالذكاء الاصطناعي مع إمكانية مشاركة الروشتة عبر الواتساب وإدارة الاشتراكات والفروع.

---

## 🔗 روابط هامة وسريعة (Quick Links):

- 👑 **[بورتال أدمن تفعيل الحسابات والاشتراكات (Admin Portal)](https://rosheta.vercel.app/admin/subscriptions)**
  - الرابط المحلي: `http://localhost:3000/admin/subscriptions`
- 💳 **[صفحة باقات الاشتراك والأسعار (Subscriptions Page)](https://rosheta.vercel.app/subscriptions)**
  - الرابط المحلي: `http://localhost:3000/subscriptions`

---

## 🌟 أبرز مميزات النظام المتكامل:

1. **🇪🇬 بنك الأدوية المصري الشامل (43,500+ دواء مسجل):**
   - محرك بحث لحظي فائق السرعة بالاسم التجاري، المادة الفعالة، الشركة المصنعة، أصل المستحضر، والسعر.
2. **🤖 مساعد الذكاء الاصطناعي لفحص الأمان والتفاعلات:**
   - فحص تلقائي لحظي لتكرار المواد الفعالة، تعارض الأدوية، وحساسية البنسلين مع توصيات طبية دقيقة.
3. **📱 طباعة وإرسال الروشتات عبر الواتساب:**
   - تصدير الروشتة بدقة عالية بصيغ PDF وصور وإرسالها مباشرة لرقم المريض بنقرة واحدة.
4. **🏢 إدارة الفروع والعيادات المتعددة:**
   - إضافة فروع وتخصيص اللوجو والهواتف والترويسات والتذييل لكل عيادة على حدة.
5. **👑 بورتال منفصل للتحكم وتفعيل الاشتراكات (`/admin/subscriptions`):**
   - متابعة جميع الطلبات الواردة عن طريق (فودافون كاش / إنستاباي) مع تفعيل الحسابات وتحديد مدة التفعيل (شهر، 3 شهور، 6 شهور، سنة، أو أيام مخصصة) فوراً.

---

## 🛠️ تقنيات المشروع (Tech Stack):

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS & Vanilla Glassmorphism
- **Database & ORM:** Supabase (Cloud PostgreSQL) + Prisma ORM
- **State Management:** Zustand (with LocalStorage Persistence)
- **Icons & UI:** Lucide React & Framer Motion
- **Deployment & Hosting:** Vercel + GitHub + PWA Support

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
