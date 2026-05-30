import type { Imovel } from "../supabase";
import { chromium } from "playwright";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

interface EgoPrice {
  PriceValue: number;
}
interface EgoBusiness {
  BusinessName: string;
  Prices: EgoPrice[];
}
interface EgoProperty {
  ID: number;
  Title: string | null;
  Rooms: number | null;
  GrossArea: number | null;
  NetArea: number | null;
  Description: string | null;
  Zone: string | null;
  Municipality: string | null;
  Type: string | null;
  Thumbnail: string | null;
  PropertyBusiness: EgoBusiness[] | null;
}

function mapProperty(item: EgoProperty, siteUrl: string, fonte: string): Imovel | null {
  const sale = item.PropertyBusiness?.find((b) => b.BusinessName === "Venda");
  if (!sale) return null;

  if (item.Municipality && !item.Municipality.toLowerCase().includes("figueira da foz")) return null;

  const preco = sale.Prices?.[0]?.PriceValue || null;
  const rawRooms = item.Rooms;
  const rooms = rawRooms !== null && rawRooms >= 0 ? rawRooms : null;
  const tipologia = rooms !== null ? (rooms >= 4 ? "T4+" : `T${rooms}`) : null;
  const area = item.NetArea || item.GrossArea || null;
  const slug = slugify(item.Title || "imovel");
  const link = `${siteUrl}/imovel/${slug}/${item.ID}`;
  const local = item.Zone || item.Municipality || "Figueira da Foz";

  return {
    fonte,
    titulo: `${item.Type || "Imóvel"} em ${local}`,
    preco,
    tipologia,
    area,
    descricao: item.Description?.substring(0, 300) || null,
    contacto: fonte,
    link,
    foto: item.Thumbnail || null,
  };
}

async function scrapeEgorealestate(
  pageUrl: string,
  siteUrl: string,
  fonte: string
): Promise<Imovel[]> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const collected: EgoProperty[] = [];

    page.on("response", async (resp) => {
      if (resp.url().includes("/v1/Properties?")) {
        try {
          const data = await resp.json();
          if (Array.isArray(data.Properties)) collected.push(...data.Properties);
        } catch {}
      }
    });

    await page.goto(pageUrl, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(4000);

    const imoveis = collected
      .map((p) => mapProperty(p, siteUrl, fonte))
      .filter((i): i is Imovel => i !== null);

    console.log(`${fonte}: ${imoveis.length} imóveis encontrados`);
    return imoveis;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`${fonte}: erro — ${msg}`);
    return [];
  } finally {
    await browser.close();
  }
}

export async function scrapeHomelusa(): Promise<Imovel[]> {
  return scrapeEgorealestate(
    "https://www.homelusa.pt/comprar-casa",
    "https://www.homelusa.pt",
    "Homelusa"
  );
}

export async function scrapeRealfoz(): Promise<Imovel[]> {
  return scrapeEgorealestate(
    "https://www.realfoz.pt/imoveis/?dst=6,10",
    "https://www.realfoz.pt",
    "Realfoz"
  );
}

export async function scrapeImogabinete(): Promise<Imovel[]> {
  return scrapeEgorealestate(
    "https://www.imogabinete.com/imoveis",
    "https://www.imogabinete.com",
    "Imogabinete"
  );
}
