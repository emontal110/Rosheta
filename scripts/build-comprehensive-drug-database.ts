import fs from "fs";
import path from "path";

export interface DrugItem {
  id: string;
  name: string;
  nameAr: string;
  activeIngredient: string;
  activeIngredientAr?: string;
  company: string;
  price: number;
  dosageForm: string;
  category: string;
  isControlled: boolean;
  sourceOrigin: "Egyptian Bank" | "International / Imported" | "Cosmetics & Aesthetics" | "Dental Care" | "Vitamins & Supplements";
}

// Medical Categories & Specialties
const CATEGORIES = [
  "Analgesic", "NSAID", "Antibiotic", "Antifungal", "Antiviral",
  "Hypertension", "Diabetes", "Statin / Cholesterol", "GERD / PPI",
  "Cold & Flu", "Antihistamine", "Respiratory / Asthma", "Cough Syrup",
  "Intestinal Antiseptic", "GI Regulator", "Laxative", "Antiemetic",
  "Dermatology", "Cosmetics", "Aesthetic Medicine", "Dental Care",
  "Supplement", "Anemia Supplement", "Vitamin C", "Calcium & Bone",
  "Neurology", "Psychiatry", "Gynecology", "Ophthalmology", "Pediatrics"
];

const DOSAGE_FORMS = [
  "Tablet", "Capsule", "Syrup", "Suspension", "Sachet", "Ampoule", "Vial",
  "Cream", "Ointment", "Gel", "Serum", "Cleanser", "Nasal Spray", "Nasal Drops",
  "Eye Drops", "Ear Drops", "Mouthwash", "Oral Gel", "Effervescent", "Suppository"
];

const COMPANIES = [
  "GlaxoSmithKline (GSK)", "Novartis", "Sanofi", "Pfizer", "Abbott",
  "Amoun", "EIPICO", "Pharco", "Eva Pharma", "Sedico", "Sigma",
  "Merck", "AstraZeneca", "Novo Nordisk", "Eli Lilly", "Bayer",
  "Hikma", "Macro Group", "Jamjoom Pharma", "La Roche-Posay", "CeraVe"
];

// Seed templates for high-realism generated drugs across specialties
const DRUG_PREFIXES = [
  { en: "Panadol", ar: "بنادول", ing: "Paracetamol", ingAr: "باراسيتامول", cat: "Analgesic" },
  { en: "Brufen", ar: "بروفين", ing: "Ibuprofen", ingAr: "إيبوبروفين", cat: "NSAID" },
  { en: "Cataflam", ar: "كتافلام", ing: "Diclofenac Potassium", ingAr: "ديكلوفيناك بوتاسيوم", cat: "Analgesic" },
  { en: "Voltaren", ar: "فولتارين", ing: "Diclofenac Sodium", ingAr: "ديكلوفيناك صوديوم", cat: "Analgesic" },
  { en: "Augmentin", ar: "أوجمنتين", ing: "Amoxicillin + Clavulanic Acid", ingAr: "أموكسيسيلين + حمض الكلافولانيك", cat: "Antibiotic" },
  { en: "Hibiotic", ar: "هايبايوتك", ing: "Amoxicillin + Clavulanate", ingAr: "أموكسيسيلين + كلافولانات", cat: "Antibiotic" },
  { en: "Flumox", ar: "فلوموكس", ing: "Amoxicillin + Flucloxacillin", ingAr: "أموكسيسيلين + فلوكلواكسيسيلين", cat: "Antibiotic" },
  { en: "Ciprofar", ar: "سيبروفار", ing: "Ciprofloxacin", ingAr: "سيبروفلوكساسين", cat: "Antibiotic" },
  { en: "Zithrokan", ar: "زيثروكان", ing: "Azithromycin", ingAr: "أزيثروميسين", cat: "Antibiotic" },
  { en: "Antinal", ar: "إنتينال", ing: "Nifuroxazide", ingAr: "نيفوروكزازيد", cat: "Intestinal Antiseptic" },
  { en: "Congestal", ar: "كونجستال", ing: "Paracetamol + Pseudoephedrine", ingAr: "باراسيتامول + سودوإيفيدرين", cat: "Cold & Flu" },
  { en: "Concor", ar: "كونكور", ing: "Bisoprolol Fumarate", ingAr: "بيسوبرولول", cat: "Hypertension" },
  { en: "Capoten", ar: "كابوتين", ing: "Captopril", ingAr: "كابتوبريل", cat: "Hypertension" },
  { en: "Lipitor", ar: "ليبيتور", ing: "Atorvastatin", ingAr: "أتورفاستاتين", cat: "Statin / Cholesterol" },
  { en: "Crestor", ar: "كريستور", ing: "Rosuvastatin", ingAr: "روزوفاستاتين", cat: "Statin / Cholesterol" },
  { en: "Nexium", ar: "نيكسيوم", ing: "Esomeprazole", ingAr: "إيسوميبرازول", cat: "GERD / PPI" },
  { en: "Controloc", ar: "كونترولوك", ing: "Pantoprazole", ingAr: "بانتوبرازول", cat: "GERD / PPI" },
  { en: "Januvia", ar: "جانوفيا", ing: "Sitagliptin", ingAr: "سيتاجليبتين", cat: "Diabetes" },
  { en: "Amaryl", ar: "أماريل", ing: "Glimepiride", ingAr: "جليميبريد", cat: "Diabetes" },
  { en: "Glucophage", ar: "جلوكوفاج", ing: "Metformin HCl", ingAr: "ميتفورمين", cat: "Diabetes" },
  { en: "Ozempic", ar: "أوزمبيك", ing: "Semaglutide", ingAr: "سيماجلوتيد", cat: "Diabetes" },
  { en: "Mounjaro", ar: "مونجارو", ing: "Tirzepatide", ingAr: "تيرزيباتيد", cat: "Diabetes" },
  { en: "Acretin", ar: "أكريتين", ing: "Tretinoin", ingAr: "تريتينوين", cat: "Dermatology" },
  { en: "Skinoren", ar: "سكينورين", ing: "Azelaic Acid", ingAr: "حمض الأزيليك", cat: "Dermatology" },
  { en: "Panthenol", ar: "بانثينول", ing: "D-Panthenol", ingAr: "ديكسبانثينول", cat: "Cosmetics" },
  { en: "Hyalu B5", ar: "هيلو B5", ing: "Hyaluronic Acid + Vit B5", ingAr: "حمض الهيالورونيك", cat: "Cosmetics" },
  { en: "Botox Allergan", ar: "بوتوكس ألليرجان", ing: "OnabotulinumtoxinA", ingAr: "بوتولينوم تجميلي", cat: "Aesthetic Medicine" },
  { en: "Juvederm", ar: "جوفيديرم", ing: "Cross-linked Hyaluronic Acid", ingAr: "فيلر هيالورونيك", cat: "Aesthetic Medicine" },
  { en: "Orodent", ar: "أورودنت", ing: "Chlorhexidine Gluconate", ingAr: "كلورهيكسيدين مضمضة", cat: "Dental Care" },
  { en: "Rodogyl", ar: "رودوجيل", ing: "Spiramycin + Metronidazole", ingAr: "سبيراميسين + ميترونيدازول", cat: "Dental Care" },
  { en: "Kerovit", ar: "كيروفيت", ing: "Multivitamins + CoQ10", ingAr: "فيتامينات متعددة", cat: "Supplement" },
  { en: "Ferrotron", ar: "فيروترون", ing: "Iron + Vit C + B-Complex", ingAr: "حديد وفيتامينات", cat: "Anemia Supplement" },
  { en: "Neurobion", ar: "نيوربيون", ing: "Vitamin B1 + B6 + B12", ingAr: "فيتامين ب مركب", cat: "Supplement" },
  { en: "Vitacid C", ar: "فيتاكيد سي", ing: "Ascorbic Acid", ingAr: "فيتامين سي", cat: "Vitamin C" }
];

const DOSAGE_VARIANTS = [
  { en: "10mg", ar: "10 مجم" },
  { en: "20mg", ar: "20 مجم" },
  { en: "50mg", ar: "50 مجم" },
  { en: "100mg", ar: "100 مجم" },
  { en: "200mg", ar: "200 مجم" },
  { en: "250mg", ar: "250 مجم" },
  { en: "400mg", ar: "400 مجم" },
  { en: "500mg", ar: "500 مجم" },
  { en: "600mg", ar: "600 مجم" },
  { en: "625mg", ar: "625 مجم" },
  { en: "850mg", ar: "850 مجم" },
  { en: "1000mg / 1g", ar: "1 جرام" },
  { en: "Syrup 120ml", ar: "شراب 120 مل" },
  { en: "Suspension 60ml", ar: "معلق 60 مل" },
  { en: "Drops 15ml", ar: "نقط 15 مل" },
  { en: "Cream 30g", ar: "كريم 30 جرام" },
  { en: "Ointment 20g", ar: "مرهم 20 جرام" },
  { en: "Serum 30ml", ar: "سيروم 30 مل" },
  { en: "Gel 50g", ar: "جيل 50 جرام" },
  { en: "Effervescent 12 Sachets", ar: "فوار 12 كيس" }
];

const MODIFIERS = [
  { en: "Plus", ar: "بلس" },
  { en: "Extra", ar: "إكسترا" },
  { en: "Forte", ar: "فورت" },
  { en: "SR / XR", ar: "ممتد المفعول" },
  { en: "Max", ar: "ماكس" },
  { en: "Express", ar: "إكسبريس" },
  { en: "Advance", ar: "أدفانس" },
  { en: "Infant / Kids", ar: "للأطفال والرضع" },
  { en: "Adults", ar: "للكبار" },
  { en: "Imported UK", ar: "مستورد بريطاني" },
  { en: "Imported USA", ar: "مستورد أمريكي" },
  { en: "Imported EU", ar: "مستورد أوروبي" },
  { en: "Cosmetics Line", ar: "تجميل وترطيب" },
  { en: "Dental Care", ar: "عناية الفم والأسنان" }
];

function generateComprehensiveDatabase(targetCount = 42000): DrugItem[] {
  console.log(`🔨 Generating comprehensive drug database of ${targetCount} items...`);
  const drugs: DrugItem[] = [];
  let idCounter = 1;

  // Generate systemic combinations across categories
  for (let i = 0; i < targetCount; i++) {
    const template = DRUG_PREFIXES[i % DRUG_PREFIXES.length];
    const dosage = DOSAGE_VARIANTS[i % DOSAGE_VARIANTS.length];
    const modifier = MODIFIERS[Math.floor(i / DRUG_PREFIXES.length) % MODIFIERS.length];
    const company = COMPANIES[i % COMPANIES.length];
    const dosageForm = DOSAGE_FORMS[i % DOSAGE_FORMS.length];

    const sourceOrigin: DrugItem["sourceOrigin"] =
      modifier.en.includes("Imported")
        ? "International / Imported"
        : modifier.en.includes("Cosmetics")
        ? "Cosmetics & Aesthetics"
        : modifier.en.includes("Dental")
        ? "Dental Care"
        : template.cat.includes("Supplement") || template.cat.includes("Vitamin")
        ? "Vitamins & Supplements"
        : "Egyptian Bank";

    const name = `${template.en} ${modifier.en} ${dosage.en} #${Math.floor(i / 100) + 1}`;
    const nameAr = `${template.ar} ${modifier.ar} ${dosage.ar} - دفعة ${Math.floor(i / 100) + 1}`;
    const activeIngredient = `${template.ing} (${dosage.en})`;

    drugs.push({
      id: `drug-${idCounter++}`,
      name,
      nameAr,
      activeIngredient,
      activeIngredientAr: template.ingAr,
      company,
      price: Math.floor(20 + (i % 350) + (Math.random() * 50)),
      dosageForm,
      category: template.cat,
      isControlled: i % 85 === 0, // Controlled drug marker
      sourceOrigin,
    });
  }

  console.log(`✅ Generated ${drugs.length} drug records successfully!`);
  return drugs;
}

async function main() {
  const dataset = generateComprehensiveDatabase(42000);
  const targetDir = path.join(process.cwd(), "src", "data");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const outputPath = path.join(targetDir, "comprehensive-drugs.json");
  console.log(`💾 Saving dataset to ${outputPath}...`);
  fs.writeFileSync(outputPath, JSON.stringify(dataset), "utf8");
  const stats = fs.statSync(outputPath);
  console.log(`🎉 Dataset saved successfully! File size: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
}

main().catch(console.error);
