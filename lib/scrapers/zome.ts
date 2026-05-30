import { chromium } from "playwright";
import type { Imovel } from "../supabase";

interface ZomeListing {
  id: number;
  pid: string;
  idencode: string;
  tipoimovel: string;
  tipologiaimovel: string;
  precoimovel: string;
  areautilhab: number | null;
  gallery: { mres: string[] };
  localizacaolevel2imovel: string;
  localizacaolevel3imovel: string;
}

function parseLang(json: string, lang = "PT"): string | null {
  try {
    const obj = JSON.parse(json);
    return obj[lang] || obj["EN"] || null;
  } catch {
    return null;
  }
}

function mapTypology(tipologia: string | null): string | null {
  if (!tipologia) return null;
  const match = tipologia.match(/T\d\+?/i);
  return match ? match[0].toUpperCase() : null;
}

export async function scrapeZome(): Promise<Imovel[]> {
  console.log("A iniciar scraper Zome...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  let listings: ZomeListing[] = [];

  page.on("response", async (response) => {
    if (response.url().includes("get_angariacoes")) {
      try {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          listings = data;
          console.log(`Zome: ${data.length} imóveis interceptados da API`);
        }
      } catch {
        // ignorar
      }
    }
  });

  try {
    await page.goto("https://www.zome.pt/pt/figueira-da-foz-h52592/imoveis", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await page.waitForTimeout(3000);
  } finally {
    await browser.close();
  }

  if (listings.length === 0) {
    console.log("Zome: nenhum imóvel encontrado");
    return [];
  }

  return listings.map((item) => {
    const tipo = parseLang(item.tipoimovel);
    const tipologia = parseLang(item.tipologiaimovel);
    const preco = item.precoimovel ? parseFloat(item.precoimovel.replace(/\./g, "").replace(",", ".")) : null;
    const foto = item.gallery?.mres?.[0] || null;
    const local = [item.localizacaolevel3imovel, item.localizacaolevel2imovel].filter(Boolean).join(", ");
    const link = `https://www.zome.pt/pt/${item.pid}`;

    return {
      fonte: "Zome",
      titulo: `${tipo || "Imóvel"} em ${local || "Figueira da Foz"}`,
      preco: isNaN(preco!) ? null : preco,
      tipologia: mapTypology(tipologia),
      area: item.areautilhab || null,
      descricao: null,
      contacto: "Zome Figueira da Foz — +351 233 098 153",
      link,
      foto,
    };
  });
}
