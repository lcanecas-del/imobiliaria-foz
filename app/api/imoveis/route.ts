import { NextResponse } from "next/server";
import type { Imovel } from "@/lib/supabase";

// ── Remax ──────────────────────────────────────────────────────────────────
async function fetchRemax(): Promise<Imovel[]> {
  const response = await fetch(
    "https://www.remax.pt/api/Listing/PaginatedMultiMatchSearch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Origin: "https://www.remax.pt",
        Referer: "https://www.remax.pt/comprar/figueira-da-foz",
      },
      body: JSON.stringify({
        filters: [
          { field: "businessTypeID", operationType: "int", operator: "=", value: "1", label: "buy" },
          { field: "Region2ID", operationType: "string", operator: "=", value: "444" },
          { field: "listingClassID", operationType: "int", operator: "=", value: "1" },
          { field: "isSpecialExclusive", operator: "=", operationType: "string", value: "false" },
        ],
        pageNumber: 1,
        pageSize: 48,
        sort: ["-PublishDate"],
        searchValue: "Figueira da Foz",
      }),
    }
  );

  if (!response.ok) return [];
  const data = await response.json();

  return (data.results || []).map((item: Record<string, unknown>) => {
    const descriptions = item.descriptions as Array<{ languageCode: string; description: string }>;
    const ptDesc = descriptions?.find((d) => d.languageCode === "PT");
    const descricao = ptDesc?.description?.replace(/<[^>]*>/g, "").substring(0, 300) || null;
    const beds = item.numberOfBedrooms as number | null;
    const tipologia = beds !== null ? (beds >= 4 ? "T4+" : `T${beds}`) : null;
    const foto = item.listingPictureUrl
      ? `https://i.maxwork.pt/l-feat/${item.listingPictureUrl}`
      : null;
    const listingType = (item.listingType as string || "imovel").toLowerCase();
    const region2 = slugify((item.regionName2 as string) || "");
    const region3 = item.regionName3 ? "-" + slugify(item.regionName3 as string) : "";
    const bedSlug = beds !== null ? `t${beds}` : "t";
    const link = `https://www.remax.pt/imoveis/venda-${listingType}-${bedSlug}-${region2}${region3}/${item.listingTitle}`;

    return {
      fonte: "Remax",
      titulo: `${item.listingType || "Imóvel"} em ${(item.regionName3 as string) || (item.regionName2 as string) || "Figueira da Foz"}`,
      preco: (item.listingPrice as number) || null,
      tipologia,
      area: (item.livingArea as number) || null,
      descricao,
      contacto: [(item.officeName as string), (item.officePhoneNumber as string)].filter(Boolean).join(" — ") || "RE/MAX Figueira da Foz",
      link,
      foto,
    };
  });
}

// ── Zome ───────────────────────────────────────────────────────────────────
async function fetchZome(): Promise<Imovel[]> {
  const response = await fetch(
    "https://luvskhnljpxllkxpeasu.supabase.co/rest/v1/rpc/get_angariacoes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "content-profile": "pt_prod",
        apikey: "sb_publishable_fY6BgFcFONgcOhMf1Snqjw_qwwJY2zk",
        authorization: "Bearer sb_publishable_fY6BgFcFONgcOhMf1Snqjw_qwwJY2zk",
      },
      body: JSON.stringify({
        localizationiso: "PT",
        typebusiness: 1,
        typelisting: null,
        localizacao: null,
        typologylisting: null,
        arraylocalization: null,
        minprecoimovel: null,
        maxprecoimovel: null,
        areaminlisting: null,
        statuslisting: null,
        attr_piscina: null,
        attr_elevador: null,
        attr_garagem: null,
        attr_parqueamento: null,
        attr_mobilidadereduzida: null,
        valorentradafinanciamento: null,
        prazoamortizacaofinanciamento: null,
        taxafixafinanciamento: null,
        spread: null,
        pricebymonth: null,
        arrayzmid: null,
        mylocalizacao: null,
        mylocalizacaodistance: null,
        idconsultor: null,
        moradahubconsultorid: 50,
        limiti: 48,
        offseti: 0,
        orderby: "dataentradarede",
        orderdirection: "DESC",
      }),
    }
  );

  if (!response.ok) return [];
  const data = await response.json();

  return (data as Record<string, unknown>[]).map((item) => {
    const tipoimovel = parseLang(item.tipoimovel as string);
    const tipologia = mapTypologia(parseLang(item.tipologiaimovel as string));
    const preco = item.precoimovel
      ? parseFloat((item.precoimovel as string).replace(/\./g, "").replace(",", "."))
      : null;
    const gallery = item.gallery as { mres: string[] } | null;
    const foto = gallery?.mres?.[0] || null;
    const local = [(item.localizacaolevel3imovel as string), (item.localizacaolevel2imovel as string)].filter(Boolean).join(", ");

    return {
      fonte: "Zome",
      titulo: `${tipoimovel || "Imóvel"} em ${local || "Figueira da Foz"}`,
      preco: preco && !isNaN(preco) ? preco : null,
      tipologia,
      area: (item.areautilhab as number) || null,
      descricao: null,
      contacto: "Zome Figueira da Foz — +351 233 098 153",
      link: `https://www.zome.pt/pt/${item.pid}`,
      foto,
    };
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────
function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function parseLang(json: string, lang = "PT"): string | null {
  try {
    const obj = JSON.parse(json);
    return obj[lang] || obj["EN"] || null;
  } catch {
    return null;
  }
}

function mapTypologia(t: string | null): string | null {
  if (!t) return null;
  const m = t.match(/T\d\+?/i);
  return m ? m[0].toUpperCase() : null;
}

function filtrar(imoveis: Imovel[], params: Record<string, string>): Imovel[] {
  return imoveis.filter((i) => {
    if (params.tipologia && i.tipologia !== params.tipologia) return false;
    if (params.tipo && !i.titulo?.toLowerCase().includes(params.tipo.toLowerCase())) return false;
    if (params.localizacao && !i.titulo?.toLowerCase().includes(params.localizacao.toLowerCase())) return false;
    if (params.precoMin && (i.preco ?? 0) < Number(params.precoMin)) return false;
    if (params.precoMax && (i.preco ?? Infinity) > Number(params.precoMax)) return false;
    if (params.areaMin && (i.area ?? 0) < Number(params.areaMin)) return false;
    if (params.areaMax && (i.area ?? Infinity) > Number(params.areaMax)) return false;
    return true;
  });
}

// ── Handler ────────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const [remax, zome] = await Promise.all([fetchRemax(), fetchZome()]);
  const todos = [...remax, ...zome];
  const resultado = filtrar(todos, params);

  return NextResponse.json(resultado);
}
