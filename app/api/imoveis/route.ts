import { NextResponse } from "next/server";
import { fetchRemax, fetchZome, fetchFromSupabase, filtrar } from "@/lib/fetchers";

export const maxDuration = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const [remax, zome, cache] = await Promise.all([
    fetchRemax(),
    fetchZome(),
    fetchFromSupabase(["Imojardim", "Espaços e Casas", "Renthouse", "Imoexpansão"]),
  ]);

  const resultado = filtrar([...remax, ...zome, ...cache], params);
  return NextResponse.json(resultado);
}
