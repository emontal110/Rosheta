import { NextResponse } from "next/server";

interface PrescriptionItemInput {
  id: string;
  drugName: string;
  activeIngredient?: string;
  doseQuantity?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

// Known Clinical Interaction Rules for Egyptian Drug Bank
const KNOWN_INTERACTION_RULES = [
  {
    ingredients: ["warfarin", "diclofenac"],
    names: ["marevan", "cataflam", "voltaren"],
    severity: "HIGH",
    title: "Severe Bleeding Risk (تحذير نزيف حاد)",
    description: "Combining Warfarin (Marevan) with NSAIDs (Cataflam/Diclofenac) significantly increases the risk of major gastrointestinal bleeding and altered INR.",
    recommendation: "Avoid NSAIDs; use Paracetamol (Panadol) for pain management.",
  },
  {
    ingredients: ["warfarin", "ibuprofen"],
    names: ["marevan", "brufen"],
    severity: "HIGH",
    title: "Severe Anticoagulant Interaction (تداخل تجلط الدم)",
    description: "Ibuprofen (Brufen) inhibits platelet aggregation and damages gastric mucosa when taken with Warfarin.",
    recommendation: "Switch to Paracetamol or consult Hematology before prescribing.",
  },
  {
    ingredients: ["ciprofloxacin", "paracetamol"],
    names: ["ciprofar", "antacid"],
    severity: "MEDIUM",
    title: "Reduced Antibiotic Absorption (انخفاض امتصاص المضاد)",
    description: "Fluoroquinolones like Ciprofloxacin bind with divalent cations (Magnesium/Aluminum antacids, Calcium, Iron supplements).",
    recommendation: "Administer Ciprofloxacin 2 hours before or 6 hours after antacids/minerals.",
  },
  {
    ingredients: ["amoxicillin", "methotrexate"],
    names: ["augmentin", "hibiotic"],
    severity: "HIGH",
    title: "Methotrexate Toxicity Hazard",
    description: "Penicillins reduce renal clearance of Methotrexate, potentially causing severe marrow suppression.",
    recommendation: "Monitor serum methotrexate levels closely or choose alternative antibiotic.",
  },
  {
    ingredients: ["bisoprolol", "verapamil"],
    names: ["concor", "isoptin"],
    severity: "HIGH",
    title: "Severe Bradycardia & AV Block (هبوط ضربات القلب)",
    description: "Concomitant use of Beta-blockers (Concor) and non-dihydropyridine calcium channel blockers can precipitate profound bradycardia or heart block.",
    recommendation: "Avoid combination unless under electrophysiology monitoring.",
  },
  {
    ingredients: ["metformin", "contrast"],
    names: ["cidophage", "janumet"],
    severity: "MEDIUM",
    title: "Lactic Acidosis Risk (احتياط كلوي)",
    description: "Metformin should be temporarily withheld prior to iodinated contrast procedures in patients with reduced eGFR.",
    recommendation: "Discontinue Metformin 48 hours prior to IV contrast procedure.",
  }
];

// Clinical Dosage Suggestions Dictionary
const DOSAGE_PRESETS: Record<string, { doseQuantity: string; frequency: string; duration: string; instructions: string }> = {
  "panadol": { doseQuantity: "1 قرص", frequency: "عند الحاجة كل 6 ساعات", duration: "عند اللزوم", instructions: "يؤخذ بعد الأكل مع كوب ماء كامل. لا تتجاوز 8 أقراص يومياً." },
  "augmentin": { doseQuantity: "1 قرص (1g)", frequency: "كل 12 ساعة بعد الوجبات", duration: "لمدة 7 أيام", instructions: "يُستكمل الكورس بالكامل حتى لو تحسنت الأعراض." },
  "brufen": { doseQuantity: "1 قرص (400mg)", frequency: "كل 8 ساعات بعد الأكل", duration: "لمدة 5 أيام", instructions: "يمنع تناوله على معدة فارغة لتجنب تهيج المعدة." },
  "cataflam": { doseQuantity: "1 قرص (50mg)", frequency: "كل 8-12 ساعة بعد الأكل", duration: "لمدة 3-5 أيام", instructions: "يشرب مع كمية وفيرة من الماء." },
  "antinal": { doseQuantity: "1 كبسولة", frequency: "كل 6 ساعات (4 مرات يومياً)", duration: "لمدة 3-5 أيام", instructions: "مطهر معوي، يؤخذ قبل أو بعد الأكل." },
  "congestal": { doseQuantity: "1 قرص", frequency: "كل 8 ساعات", duration: "لمدة 4 أيام", instructions: "قد يسبب النعاس؛ يُنصح بتجنب القيادة أثناء العلاج." },
  "otrivin": { doseQuantity: "2 نقطة بكل أنف", frequency: "كل 8-12 ساعة", duration: "لمدة 3-5 أيام فقط", instructions: "لا تزيد مدة الاستخدام عن 5 أيام متتالية لمنع الاحتقان المرتد." },
  "ciprofar": { doseQuantity: "1 قرص (500mg)", frequency: "كل 12 ساعة", duration: "لمدة 7 أيام", instructions: "تجنب تناول اللبن أو أدوية حموضة الكالسيوم بالتزامن." },
  "concor": { doseQuantity: "1 قرص (5mg)", frequency: "مرة واحدة صباحاً", duration: "علاج مستمر", instructions: "يؤخذ قبل الفطور صباحاً، لا توقف العلاج فجأة." },
  "acretin": { doseQuantity: "كمية بحجم حبة البسلة", frequency: "مرة واحدة مساءً قبل النوم", duration: "لمدة 8 أسابيع", instructions: "يُوضع على بشرة جافة ليلاً، وتجنب التعرض للشمس ويجب استخدام واقي شمس." },
  "hyalu": { doseQuantity: "3-4 قطرات", frequency: "مرتين يومياً (صباحاً ومساءً)", duration: "عناية يومية", instructions: "يدلك برفق على الوجه والرقبة قبل المرطب." },
  "orodent": { doseQuantity: "15 مل مضمضة", frequency: "مرتين يومياً بعد غسيل الأسنان", duration: "لمدة 10 أيام", instructions: "تمضمض لمدة 60 ثانية ثم ابصق، لا تمضمض بالماء بعدها لمدة 30 دقيقة." },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: PrescriptionItemInput[] = body.items || [];
    const patientAllergies: string = (body.patientAllergies || "").toLowerCase();

    const interactions: any[] = [];
    const dosageSuggestions: Record<string, any> = {};

    // 1. Analyze Drug-Drug Interactions
    const itemFullTexts = items.map((i) => `${i.drugName} ${i.activeIngredient || ""}`.toLowerCase());

    for (const rule of KNOWN_INTERACTION_RULES) {
      let matchedCount = 0;
      const matchedDrugs: string[] = [];

      for (let idx = 0; idx < items.length; idx++) {
        const text = itemFullTexts[idx];
        const isMatch = rule.ingredients.some((ing) => text.includes(ing)) || rule.names.some((n) => text.includes(n));
        if (isMatch) {
          matchedCount++;
          matchedDrugs.push(items[idx].drugName);
        }
      }

      if (matchedCount >= 2) {
        interactions.push({
          id: `int-${rule.severity}-${rule.ingredients.join("-")}`,
          severity: rule.severity,
          title: rule.title,
          description: rule.description,
          recommendation: rule.recommendation,
          involvedDrugs: Array.from(new Set(matchedDrugs)),
        });
      }
    }

    // 2. Patient Allergy Checks
    if (patientAllergies) {
      for (const item of items) {
        const fullText = `${item.drugName} ${item.activeIngredient || ""}`.toLowerCase();
        if (patientAllergies.includes("penicillin") || patientAllergies.includes("بنسلين")) {
          if (fullText.includes("amoxicillin") || fullText.includes("augmentin") || fullText.includes("flumox") || fullText.includes("hibiotic")) {
            interactions.push({
              id: `allergy-${item.id}`,
              severity: "HIGH",
              title: "⚠️ Penicillin Allergy Risk (تحذير حساسية بنسلين)",
              description: `Patient has documented Penicillin Allergy! ${item.drugName} contains Amoxicillin/Penicillin derivative.`,
              recommendation: "Discontinue penicillin antibiotic; switch to Macrolide (e.g. Zithrokan/Azithromycin).",
              involvedDrugs: [item.drugName],
            });
          }
        }
      }
    }

    // 3. Generate Dosage Auto-Fill Suggestions
    for (const item of items) {
      const lowerName = item.drugName.toLowerCase();
      let matchedPreset = null;

      for (const [key, preset] of Object.entries(DOSAGE_PRESETS)) {
        if (lowerName.includes(key)) {
          matchedPreset = preset;
          break;
        }
      }

      if (matchedPreset) {
        dosageSuggestions[item.id] = matchedPreset;
      } else {
        // Generic Default Prescription Dosage Generator
        dosageSuggestions[item.id] = {
          doseQuantity: item.doseQuantity || "1 قرص / كبسولة",
          frequency: item.frequency || "كل 12 ساعة بعد الأكل",
          duration: item.duration || "لمدة 5 أيام",
          instructions: item.instructions || "اتبع تعليمات الطبيب بدقة.",
        };
      }
    }

    return NextResponse.json({
      success: true,
      interactions,
      dosageSuggestions,
      totalItemsAnalyzed: items.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
