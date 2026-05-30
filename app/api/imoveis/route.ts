import { NextResponse } from "next/server";
import { fetchRemax, fetchZome, fetchImojardim, fetchEspacosECasas, fetchRenthouse, fetchImoexpansao, filtrar } from "@/lib/fetchers";

export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const [remax, zome, imojardim, espacosecasas, renthouse, imoexpansao] = await Promise.all([
    fetchRemax(),
    fetchZome(),
    fetchImojardim(),
    fetchEspacosECasas(),
    fetchRenthouse(),
    fetchImoexpansao(),
  ]);

  const resultado = filtrar([...remax, ...zome, ...imojardim, ...espacosecasas, ...renthouse, ...imoexpansao], params);
  return NextResponse.json(resultado);
}
