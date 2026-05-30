import { NextResponse } from "next/server";
import { fetchRemax, fetchZome, fetchFromSupabase, filtrar } from "@/lib/fetchers";

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const [remax, zome, cache] = await Promise.all([
    fetchRemax(),
    fetchZome(),
    fetchFromSupabase([
      // Figueira da Foz — activas
      "Imojardim", "Espaços e Casas", "Renthouse", "Imoexpansão",
      "Himobiliária", "Homelusa", "Realfoz", "Imogabinete",
      // Figueira da Foz — preparação futura
      "ERA Figueira da Foz", "Century 21 Aqua", "Predial Serra",
      "Porta da Frente Figueira", "Figueira Imóveis", "Atlântico Imóveis",
      "LM Imobiliária", "Mediação Figueira",
      // Coimbra — preparação futura
      "ERA Coimbra", "Century 21 Coimbra", "Remax Coimbra", "Predibisa",
      "Porta da Frente Coimbra", "Imoprime Coimbra", "Mondego Imóveis",
      "Grão-Pará Imóveis",
    ]),
  ]);

  const resultado = filtrar([...remax, ...zome, ...cache], params);
  return NextResponse.json(resultado);
}
