"use client";

import { useState } from "react";
import Link from "next/link";
import ImovelCard from "@/components/ImovelCard";
import PdfReport from "@/components/PdfReport";
import type { Imovel } from "@/lib/supabase";

interface Props {
  imoveis: Imovel[];
  params: Record<string, string>;
}

export default function ResultadosClient({ imoveis, params }: Props) {
  const [selecionados, setSelecionados] = useState<Imovel[]>([]);
  const [mostrarPdf, setMostrarPdf] = useState(false);

  const temFiltros = Object.values(params).some(Boolean);

  function toggleSelecao(imovel: Imovel) {
    setSelecionados((prev) =>
      prev.some((i) => i.link === imovel.link)
        ? prev.filter((i) => i.link !== imovel.link)
        : [...prev, imovel]
    );
  }

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
          <div className="flex items-center gap-3">
            {selecionados.length > 0 && (
              <button
                onClick={() => setMostrarPdf(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Relatório PDF ({selecionados.length})
              </button>
            )}
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              ← Nova pesquisa
            </Link>
          </div>
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
          <>
            {selecionados.length > 0 && (
              <p className="mb-4 text-sm text-blue-700 font-medium">
                {selecionados.length} imóvel{selecionados.length !== 1 ? "is" : ""} seleccionado{selecionados.length !== 1 ? "s" : ""}
                {" "}·{" "}
                <button onClick={() => setSelecionados([])} className="underline hover:no-underline">
                  limpar seleção
                </button>
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {imoveis.map((imovel, i) => (
                <ImovelCard
                  key={imovel.link || i}
                  imovel={imovel}
                  selecionado={selecionados.some((s) => s.link === imovel.link)}
                  onToggleSelecao={toggleSelecao}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {mostrarPdf && (
        <PdfReport imoveis={selecionados} onClose={() => setMostrarPdf(false)} />
      )}
    </div>
  );
}
