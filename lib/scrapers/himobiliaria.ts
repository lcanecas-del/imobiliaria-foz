import type { Imovel } from "../supabase";
import { chromium } from "playwright";

const BASE = "https://himobiliaria.com";

function parsePrice(raw: string): number | null {
  const match = raw.match(/([\d\s.]+)€/);
  if (!match) return null;
  const n = parseFloat(match[1].replace(/[\s.]/g, "").replace(",", "."));
  return isNaN(n) ? null : n;
}

function extractTypology(title: string): string | null {
  const m = title.match(/\bT(\d)\b/i);
  if (!m) return null;
  const n = parseInt(m[1]);
  return n >= 4 ? "T4+" : `T${n}`;
}

export async function scrapeHimobiliaria(): Promise<Imovel[]> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${BASE}/imoveis`, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(3000);

    const imoveis = await page.evaluate((base) => {
      const cards = document.querySelectorAll(".realestate-container");
      return Array.from(cards).map((card) => {
        const linkEl = card.querySelector('a[href*="/imovel/"]');
        const link = linkEl ? base + linkEl.getAttribute("href") : null;
        const imgEl = card.querySelector("img.mainPhoto");
        const foto =
          imgEl?.getAttribute("data-original") ||
          (imgEl?.getAttribute("src")?.startsWith("data:") ? null : imgEl?.getAttribute("src")) ||
          null;
        const lines = (card as HTMLElement).innerText
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        return { link, foto, lines };
      });
    }, BASE);

    const result: Imovel[] = imoveis.map(({ link, foto, lines }) => {
      const titulo = lines[0] || null;
      const areaRaw = lines.find((l) => /^\d+[\d.,]*$/.test(l) && parseFloat(l.replace(",", ".")) > 10);
      const area = areaRaw ? parseFloat(areaRaw.replace(",", ".")) : null;
      const priceRaw = lines.find((l) => l.includes("€"));
      const preco = priceRaw ? parsePrice(priceRaw) : null;
      const tipologia = titulo ? extractTypology(titulo) : null;

      return {
        fonte: "Himobiliária",
        titulo,
        preco,
        tipologia,
        area,
        descricao: null,
        contacto: "Himobiliária",
        link,
        foto,
      };
    });

    console.log(`Himobiliária: ${result.length} imóveis encontrados`);
    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`Himobiliária: erro — ${msg}`);
    return [];
  } finally {
    await browser.close();
  }
}
