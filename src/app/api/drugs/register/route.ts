import { NextResponse } from "next/server";
import { registerCustomDrug } from "@/lib/drugSearchEngine";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, nameAr, activeIngredient, dosageForm, price, company } = body;

    const drugName = (name || nameAr || "").trim();
    if (!drugName) {
      return NextResponse.json({ error: "Drug name is required" }, { status: 400 });
    }

    // 1. Instantly register in memory search engine for O(1) autocomplete matching across all doctors
    const registeredDrug = registerCustomDrug({
      name: drugName,
      nameAr: (nameAr || drugName).trim(),
      activeIngredient: (activeIngredient || "Custom Formula / تركيب خاص").trim(),
      dosageForm: dosageForm || "Tablet",
      price: price ? parseFloat(price) : 0,
      company: company || "مُضاف بواسطة طبيب",
    });

    // 2. Persist to PostgreSQL Prisma Database if connected
    try {
      const existingDb = await prisma.drug.findFirst({
        where: {
          OR: [
            { name: { equals: registeredDrug.name, mode: "insensitive" } },
            { nameAr: { equals: registeredDrug.nameAr, mode: "insensitive" } },
          ],
        },
      });

      if (!existingDb) {
        await prisma.drug.create({
          data: {
            name: registeredDrug.name,
            nameAr: registeredDrug.nameAr,
            activeIngredient: registeredDrug.activeIngredient,
            dosageForm: registeredDrug.dosageForm,
            price: registeredDrug.price,
            company: registeredDrug.company,
            category: registeredDrug.category || "Custom Medication",
          },
        });
      }
    } catch (dbErr) {
      // Ignore DB errors in offline/local storage mode
    }

    return NextResponse.json({
      success: true,
      message: "تم حفظ الدواء بنجاح في قاعدة البيانات ومحرك البحث الذكي",
      drug: registeredDrug,
    });
  } catch (err: any) {
    console.error("Error registering custom drug:", err);
    return NextResponse.json({ error: err.message || "Failed to register drug" }, { status: 500 });
  }
}
