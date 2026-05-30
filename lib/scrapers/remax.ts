import type { Imovel } from "../supabase";

const REMAX_API = "https://www.remax.pt/api/Listing/PaginatedMultiMatchSearch";
const PHOTO_BASE = "https://i.maxwork.pt/l-feat/";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildUrl(item: RemaxListing): string {
  const type = slugify(item.listingType || "imovel");
  const bedrooms = item.numberOfBedrooms;
  const typology = bedrooms !== null ? `t${bedrooms}` : "t";
  const region2 = slugify(item.regionName2 || "");
  const region3 = item.regionName3 ? "-" + slugify(item.regionName3) : "";
  return `https://www.remax.pt/imoveis/venda-${type}-${typology}-${region2}${region3}/${item.listingTitle}`;
}

function mapTypology(bedrooms: number | null): string | null {
  if (bedrooms === null) return null;
  if (bedrooms >= 4) return "T4+";
  return `T${bedrooms}`;
}

interface RemaxListing {
  listingTitle: string;
  listingType: string;
  listingPrice: number | null;
  numberOfBedrooms: number | null;
  livingArea: number | null;
  listingPictureUrl: string | null;
  officeName: string | null;
  officePhoneNumber: string | null;
  regionName2: string | null;
  regionName3: string | null;
  descriptions: Array<{ languageCode: string; description: string }>;
}

export async function scrapeRemax(): Promise<Imovel[]> {
  console.log("A iniciar scraper Remax...");

  const body = {
    filters: [
      { field: "businessTypeID", operationType: "int", operator: "=", value: "1", label: "buy" },
      { field: "Region2ID", operationType: "string", operator: "=", value: "444" },
      { field: "listingClassID", operationType: "int", operator: "=", value: "1" },
      { field: "isSpecialExclusive", operator: "=", operationType: "string", value: "false" },
    ],
    pageNumber: 1,
    pageSize: 24,
    sort: ["-PublishDate"],
    searchValue: "Figueira da Foz",
  };

  const response = await fetch(REMAX_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Origin": "https://www.remax.pt",
      "Referer": "https://www.remax.pt/comprar/figueira-da-foz",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error(`Remax: erro HTTP ${response.status}`);
    return [];
  }

  const data = await response.json();
  const results: RemaxListing[] = data.results || [];
  console.log(`Remax: ${results.length} imóveis encontrados (total: ${data.total})`);

  return results.map((item) => {
    const ptDesc = item.descriptions?.find((d) => d.languageCode === "PT");
    const descricao = ptDesc?.description?.replace(/<[^>]*>/g, "").substring(0, 300) || null;
    const foto = item.listingPictureUrl ? PHOTO_BASE + item.listingPictureUrl : null;

    return {
      fonte: "Remax",
      titulo: `${item.listingType || "Imóvel"} em ${item.regionName3 || item.regionName2 || "Figueira da Foz"}`,
      preco: item.listingPrice || null,
      tipologia: mapTypology(item.numberOfBedrooms),
      area: item.livingArea || null,
      descricao,
      contacto: [item.officeName, item.officePhoneNumber].filter(Boolean).join(" — ") || "RE/MAX Figueira da Foz",
      link: buildUrl(item),
      foto,
    };
  });
}
