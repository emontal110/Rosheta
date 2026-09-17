import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "emontal.33@gmail.com";
  const passwordRaw = "EMOmoro30630";
  const passwordHash = hashPassword(passwordRaw);

  console.log(`Seeding Admin User: ${adminEmail}...`);

  // Ensure default clinic exists
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

  // Upsert Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Rosheta System Administrator",
      role: "ADMIN",
      passwordHash: passwordHash,
    },
    create: {
      email: adminEmail,
      name: "Rosheta System Administrator",
      role: "ADMIN",
      passwordHash: passwordHash,
      clinicId: clinic.id,
      title: "System Admin",
    },
  });

  console.log("✅ Admin User Seeded Successfully:", adminUser.email);
}

main()
  .catch((e) => {
    console.error("❌ Seed Admin Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
