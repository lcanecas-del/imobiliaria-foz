import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import type { Imovel } from "../supabase";

async function guardarImoveis(imoveis: Imovel[], fonte: string) {
  const { supabase } = await import("../supabase");

  if (imoveis.length === 0) {
    console.log(`${fonte}: nenhum imóvel para guardar`);
    return;
  }

  // Apagar registos antigos desta fonte antes de inserir os novos
  const { error: deleteError } = await supabase
    .from("imoveis")
    .delete()
    .eq("fonte", fonte);

  if (deleteError) {
    console.error(`${fonte}: erro ao limpar registos antigos:`, deleteError.message);
    return;
  }

  const { error } = await supabase.from("imoveis").insert(imoveis);

  if (error) {
    console.error(`${fonte}: erro ao guardar no Supabase:`, error.message);
  } else {
    console.log(`${fonte}: ${imoveis.length} imóveis guardados no Supabase`);
  }
}

async function main() {
  console.log("=== A iniciar scraping ===");
  console.log(new Date().toLocaleString("pt-PT"));

  const { scrapeRemax } = await import("./remax");
  const { scrapeZome } = await import("./zome");

  const [imoveisRemax, imoveisZome] = await Promise.all([
    scrapeRemax(),
    scrapeZome(),
  ]);

  await guardarImoveis(imoveisRemax, "Remax");
  await guardarImoveis(imoveisZome, "Zome");

  const total = imoveisRemax.length + imoveisZome.length;
  console.log(`\n=== Concluído: ${total} imóveis recolhidos no total ===`);
}

main().catch(console.error);
