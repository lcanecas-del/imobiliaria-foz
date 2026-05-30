export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { fetchRemax, fetchZome, fetchFromSupabase, filtrar } from "@/lib/fetchers";
import ResultadosClient from "@/components/ResultadosClient";

interface SearchParams {
  tipo?: string;
  tipologia?: string;
  localizacao?: string;
  areaMin?: string;
  areaMax?: string;
  precoMin?: string;
  precoMax?: string;
  [key: string]: string | undefined;
}

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [remax, zome, cache] = await Promise.all([
    fetchRemax(),
    fetchZome(),
    fetchFromSupabase(["Imojardim", "Espaços e Casas", "Renthouse", "Imoexpansão", "Himobiliária", "Homelusa", "Realfoz", "Imogabinete"]),
  ]);
  const imoveis = filtrar([...remax, ...zome, ...cache], params);

  const paramsClean = Object.fromEntries(
    Object.entries(params).filter(([ , v]) => v !== undefined)
  ) as Record<string, string>;

  return <ResultadosClient imoveis={imoveis} params={paramsClean} />;
}
