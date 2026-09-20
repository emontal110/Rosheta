import { SavedPrescriptionRecord } from "@/store/usePrescriptionStore";

export interface CompactPrescriptionPayload {
  id: string;
  mId: string; // machineId
  rxNo: string;
  pName: string; // patient name
  pPhone?: string; // patient phone
  pAge?: number;
  pGender?: string;
  diag?: string;
  notes?: string;
  items: Array<{
    n: string; // drug name
    i?: string; // active ingredient
    q: string; // dose quantity
    f: string; // frequency
    d: string; // duration
  }>;
  ts: string; // timestamp
}

/**
 * Compacts a SavedPrescriptionRecord into a minified payload for Supabase storage.
 * Saves 70%+ storage space to fit effortlessly inside Supabase Free Tier (500MB DB).
 */
export function compactPrescriptionForStorage(
  record: SavedPrescriptionRecord,
  machineId: string
): CompactPrescriptionPayload {
  return {
    id: record.id,
    mId: machineId,
    rxNo: record.prescriptionNo,
    pName: record.patient.nameAr || record.patient.name || "مريض",
    pPhone: record.patient.phone || undefined,
    pAge: record.patient.age || undefined,
    pGender: record.patient.gender || undefined,
    diag: record.diagnosis || undefined,
    notes: record.notes || undefined,
    items: (record.items || []).map((it) => ({
      n: it.nameAr || it.drugName,
      i: it.activeIngredient || undefined,
      q: it.doseQuantity,
      f: it.frequency,
      d: it.duration,
    })),
    ts: record.savedAt,
  };
}
