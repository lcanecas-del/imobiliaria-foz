import { NextResponse } from "next/server";
import { fetchRemax, fetchZome, filtrar } from "@/lib/fetchers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const params = Object.fromEntries(searchParams.entries());

  const [remax, zome] = await Promise.all([fetchRemax(), fetchZome()]);
  const resultado = filtrar([...remax, ...zome], params);

  return NextResponse.json(resultado);
}
