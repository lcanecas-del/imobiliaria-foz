import Anthropic from "@anthropic-ai/sdk";
import type { Imovel } from "./supabase";

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

export async function fetchRemax(): Promise<Imovel[]> {
  try {
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
      const listingType = slugify((item.listingType as string) || "imovel");
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
  } catch {
    return [];
  }
}

export async function fetchZome(): Promise<Imovel[]> {
  try {
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
  } catch {
    return [];
  }
}

// Extrai a secção de listagens do HTML cortando header/footer
function extrairBlocosListagem(html: string): string {
  // Encontrar a posição do primeiro card de imóvel
  const marcadores = [
    'class="card-imovel',
    'class="property-card',
    'class="imovel-card',
    'class="listing-card',
    'class="resultado',
  ];

  let inicio = -1;
  for (const marcador of marcadores) {
    const pos = html.indexOf(marcador);
    if (pos !== -1 && (inicio === -1 || pos < inicio)) {
      inicio = pos;
    }
  }

  if (inicio !== -1) {
    // Tomar até 80K a partir do primeiro card
    return html.substring(Math.max(0, inicio - 500), inicio + 80000);
  }

  // Fallback: primeiros 60K
  return html.substring(0, 60000);
}

// ── Helper: extrair imóveis de HTML via Claude ──────────────────────────────
async function extrairDeHTML(url: string, baseUrl: string, fonte: string, contacto: string): Promise<Imovel[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    const html = await res.text();
    const conteudo = extrairBlocosListagem(html);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: `Analisa este HTML de um site imobiliário português (${fonte}) e extrai todos os imóveis à venda listados.

Devolve um array JSON com esta estrutura exata:
[{"titulo":"...","preco":150000,"tipologia":"T2","area":85,"link":"URL completo","foto":"URL completo da foto"}]

Regras:
- preco: número sem símbolo (ex: 150000), null se não encontrado
- tipologia: formato T0/T1/T2/T3/T4+, null se não encontrado
- area: número em m², null se não encontrado
- link: se for URL relativa (começa com /), prefixar com "${baseUrl}"
- foto: URL completo da imagem, null se não encontrado
- Inclui APENAS imóveis para VENDA (não arrendamento)
- Devolve APENAS o array JSON, sem mais texto

HTML:
${conteudo}`,
      }],
    });

    const content = response.content[0];
    if (content.type !== "text") return [];
    const text = content.text.trim();
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]") + 1;
    if (start === -1) return [];

    const listings = JSON.parse(text.substring(start, end));
    console.log(`${fonte}: ${listings.length} imóveis encontrados`);

    return listings.map((item: Record<string, unknown>) => ({
      fonte,
      titulo: (item.titulo as string) || null,
      preco: (item.preco as number) || null,
      tipologia: (item.tipologia as string) || null,
      area: (item.area as number) || null,
      descricao: null,
      contacto,
      link: (item.link as string) || null,
      foto: (item.foto as string) || null,
    }));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${fonte}: erro — ${msg}`);
    return [];
  }
}

// ── Imojardim ──────────────────────────────────────────────────────────────
export async function fetchImojardim(): Promise<Imovel[]> {
  return extrairDeHTML(
    "https://www.imojardim.pt/pt/imoveis/?pg=1&ct=00000001&or=30&idioma=pt",
    "https://www.imojardim.pt",
    "Imojardim",
    "Imojardim — +351 233 422 406"
  );
}

// ── Espaços e Casas ────────────────────────────────────────────────────────
export async function fetchEspacosECasas(): Promise<Imovel[]> {
  return extrairDeHTML(
    "https://www.espacosecasas.pt/pt/imoveis/?pg=1&ct=00000001&or=30",
    "https://www.espacosecasas.pt",
    "Espaços e Casas",
    "Espaços e Casas — +351 233 422 905"
  );
}

// ── Renthouse ──────────────────────────────────────────────────────────────
export async function fetchRenthouse(): Promise<Imovel[]> {
  return extrairDeHTML(
    "https://www.renthouse.com.pt/imoveis/venda/",
    "https://www.renthouse.com.pt",
    "Renthouse",
    "Renthouse — +351 233 097 571"
  );
}

// ── Imoexpansão ────────────────────────────────────────────────────────────
export async function fetchImoexpansao(): Promise<Imovel[]> {
  return extrairDeHTML(
    "https://imoexpansao.pt/imoveis",
    "https://imoexpansao.pt",
    "Imoexpansão",
    "Imoexpansão — +351 233 422 892"
  );
}

export function filtrar(imoveis: Imovel[], params: Record<string, string | undefined>): Imovel[] {
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
