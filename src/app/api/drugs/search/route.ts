import { NextResponse } from "next/server";
import { searchComprehensiveDrugs, getTotalDrugCount, DrugRecord } from "@/lib/drugSearchEngine";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query.trim()) {
    const defaultCatalog = searchComprehensiveDrugs("Panadol", limit);
    return NextResponse.json({
      results: defaultCatalog,
      totalCatalogSize: getTotalDrugCount(),
      executionTimeMs: Date.now() - startTime,
      source: "default-popular-catalog",
    });
  }

  const cleanQuery = query.trim();

  // 1. Run Ultra-Fast Sub-Millisecond Search Engine across 42,000+ dataset
  const memoryResults = searchComprehensiveDrugs(cleanQuery, limit);

  if (memoryResults.length > 0) {
    return NextResponse.json({
      query: cleanQuery,
      results: memoryResults,
      totalCatalogSize: getTotalDrugCount(),
      executionTimeMs: Date.now() - startTime,
      source: "ultra-fast-memory-engine-42k",
    });
  }

  // 2. Fallback to Database Query if memory search engine yields empty
  try {
    const dbResults = await prisma.drug.findMany({
      where: {
        OR: [
          { name: { contains: cleanQuery, mode: "insensitive" } },
          { nameAr: { contains: cleanQuery, mode: "insensitive" } },
          { activeIngredient: { contains: cleanQuery, mode: "insensitive" } },
        ],
      },
      take: limit,
    });

    if (dbResults && dbResults.length > 0) {
      const formattedDb: DrugRecord[] = dbResults.map((d) => ({
        id: d.id,
        name: d.name,
        nameAr: d.nameAr || undefined,
        activeIngredient: d.activeIngredient,
        company: d.company || undefined,
        price: d.price || undefined,
        dosageForm: d.dosageForm || undefined,
        category: d.category || undefined,
        isControlled: d.isControlled || false,
        sourceOrigin: "Egyptian Bank",
      }));

      return NextResponse.json({
        query: cleanQuery,
        results: formattedDb,
        totalCatalogSize: getTotalDrugCount(),
        executionTimeMs: Date.now() - startTime,
        source: "database",
      });
    }
  } catch (err) {
    // Ignore DB errors in offline mode
  }

  return NextResponse.json({
    query: cleanQuery,
    results: [],
    totalCatalogSize: getTotalDrugCount(),
    executionTimeMs: Date.now() - startTime,
    source: "empty",
  });
}
