export const dynamic = "force-dynamic";

import { fetchRemax, fetchZome, fetchImojardim, fetchEspacosECasas, fetchRenthouse, fetchImoexpansao, filtrar } from "@/lib/fetchers";
import ImovelCard from "@/components/ImovelCard";
import Link from "next/link";

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

  const [remax, zome, imojardim, espacosecasas, renthouse, imoexpansao] = await Promise.all([
    fetchRemax(),
    fetchZome(),
    fetchImojardim(),
    fetchEspacosECasas(),
    fetchRenthouse(),
    fetchImoexpansao(),
  ]);
  const imoveis = filtrar([...remax, ...zome, ...imojardim, ...espacosecasas, ...renthouse, ...imoexpansao], params);
  const temFiltros = Object.values(params).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Imóveis Figueira da Foz</h1>
            <p className="text-sm text-gray-500">
              {imoveis.length} imóvel{imoveis.length !== 1 ? "is" : ""} encontrado{imoveis.length !== 1 ? "s" : ""}
              {" "}· dados em tempo real
            </p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Nova pesquisa
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
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
            {imoveis.map((imovel, i) => (
              <ImovelCard key={imovel.link || i} imovel={imovel} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
