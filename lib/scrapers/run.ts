import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import type { Imovel } from "../supabase";

async function guardarImoveis(imoveis: Imovel[], fonte: string) {
  const { getSupabase } = await import("../supabase");
  const supabase = getSupabase();

  if (imoveis.length === 0) {
    console.log(`${fonte}: nenhum imóvel para guardar`);
    return;
  }

  const { error: deleteError } = await supabase
    .from("imoveis")
    .delete()
    .eq("fonte", fonte);

  if (deleteError) {
    console.error(`${fonte}: erro ao limpar:`, deleteError.message);
    return;
  }

  const { error } = await supabase.from("imoveis").insert(imoveis);

  if (error) {
    console.error(`${fonte}: erro ao guardar:`, error.message);
  } else {
    console.log(`${fonte}: ${imoveis.length} imóveis guardados`);
  }
}

async function main() {
  console.log("=== A iniciar scraping de todas as agências ===");
  console.log(new Date().toLocaleString("pt-PT"));

  const { scrapeRemax } = await import("./remax");
  const { scrapeZome } = await import("./zome");
  const {
    fetchImojardim,
    fetchEspacosECasas,
    fetchRenthouse,
    fetchImoexpansao,
  } = await import("../fetchers");

  const {
    scrapeHomelusa,
    scrapeRealfoz,
    scrapeImogabinete,
  } = await import("./egorealestate");

  const { scrapeHimobiliaria } = await import("./himobiliaria");

  console.log("\n[Fase 1 — APIs directas]");
  const [imoveisRemax, imoveisZome] = await Promise.all([
    scrapeRemax(),
    scrapeZome(),
  ]);

  console.log("\n[Fase 2 — HTML + Claude]");
  const imoveisImojardim = await fetchImojardim();
  const imoveisEspacos = await fetchEspacosECasas();
  const imoveisRenthouse = await fetchRenthouse();
  const imoveisImoexpansao = await fetchImoexpansao();
  const imoveisHimobiliaria = await scrapeHimobiliaria();
  const imoveisHomelusa = await scrapeHomelusa();
  const imoveisRealfoz = await scrapeRealfoz();
  const imoveisImogabinete = await scrapeImogabinete();

  console.log("\n[A guardar no Supabase...]");
  await guardarImoveis(imoveisRemax, "Remax");
  await guardarImoveis(imoveisZome, "Zome");
  await guardarImoveis(imoveisImojardim, "Imojardim");
  await guardarImoveis(imoveisEspacos, "Espaços e Casas");
  await guardarImoveis(imoveisRenthouse, "Renthouse");
  await guardarImoveis(imoveisImoexpansao, "Imoexpansão");
  await guardarImoveis(imoveisHimobiliaria, "Himobiliária");
  await guardarImoveis(imoveisHomelusa, "Homelusa");
  await guardarImoveis(imoveisRealfoz, "Realfoz");
  await guardarImoveis(imoveisImogabinete, "Imogabinete");

  const total =
    imoveisRemax.length +
    imoveisZome.length +
    imoveisImojardim.length +
    imoveisEspacos.length +
    imoveisRenthouse.length +
    imoveisImoexpansao.length +
    imoveisHimobiliaria.length +
    imoveisHomelusa.length +
    imoveisRealfoz.length +
    imoveisImogabinete.length;

  console.log(`\n=== Concluído: ${total} imóveis guardados no total ===`);
}

main().catch(console.error);
