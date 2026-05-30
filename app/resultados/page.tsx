export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabase";
import ImovelCard from "@/components/ImovelCard";
import Link from "next/link";
import type { Imovel } from "@/lib/supabase";

interface SearchParams {
  tipo?: string;
  tipologia?: string;
  localizacao?: string;
  areaMin?: string;
  areaMax?: string;
  precoMin?: string;
  precoMax?: string;
}

async function getImoveis(params: SearchParams): Promise<Imovel[]> {
  let query = supabase
    .from("imoveis")
    .select("*")
    .order("data_recolha", { ascending: false });

  if (params.tipologia) {
    query = query.eq("tipologia", params.tipologia);
  }
  if (params.precoMin) {
    query = query.gte("preco", Number(params.precoMin));
  }
  if (params.precoMax) {
    query = query.lte("preco", Number(params.precoMax));
  }
  if (params.areaMin) {
    query = query.gte("area", Number(params.areaMin));
  }
  if (params.areaMax) {
    query = query.lte("area", Number(params.areaMax));
  }
  if (params.localizacao) {
    query = query.ilike("titulo", `%${params.localizacao}%`);
  }
  if (params.tipo) {
    query = query.ilike("titulo", `%${params.tipo}%`);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    console.error("Erro ao carregar imóveis:", error.message);
    return [];
  }

  return (data as Imovel[]) || [];
}

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const imoveis = await getImoveis(params);
  const temFiltros = Object.values(params).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Imóveis Figueira da Foz</h1>
            <p className="text-sm text-gray-500">
              {imoveis.length} imóvel{imoveis.length !== 1 ? "is" : ""} encontrado{imoveis.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Nova pesquisa
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Filtros ativos */}
        {temFiltros && (
          <div className="mb-6 flex flex-wrap gap-2">
            {params.tipo && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full capitalize">
                {params.tipo}
              </span>
            )}
            {params.tipologia && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                {params.tipologia}
              </span>
            )}
            {params.localizacao && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                {params.localizacao}
              </span>
            )}
            {(params.precoMin || params.precoMax) && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                {params.precoMin ? `${Number(params.precoMin).toLocaleString("pt-PT")}€` : "0€"}
                {" — "}
                {params.precoMax ? `${Number(params.precoMax).toLocaleString("pt-PT")}€` : "sem limite"}
              </span>
            )}
            {(params.areaMin || params.areaMax) && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                {params.areaMin || "0"} — {params.areaMax || "∞"} m²
              </span>
            )}
          </div>
        )}

        {imoveis.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Nenhum imóvel encontrado com estes critérios.</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
              Tentar outra pesquisa
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {imoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
