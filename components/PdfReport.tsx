"use client";

import { useEffect } from "react";
import type { Imovel } from "@/lib/supabase";

interface Props {
  imoveis: Imovel[];
  onClose: () => void;
}

export default function PdfReport({ imoveis, onClose }: Props) {
  const hoje = new Date().toLocaleDateString("pt-PT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "pdf-print-style";
    style.textContent = `
      @media print {
        body { visibility: hidden; }
        #pdf-relatorio-conteudo { visibility: visible; position: fixed; top: 0; left: 0; width: 100%; background: white; }
        #pdf-relatorio-conteudo * { visibility: visible; }
      }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("pdf-print-style")?.remove();
  }, []);

  function imprimir() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center py-6 overflow-y-auto">
      {/* Barra de acções (não imprime) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 flex gap-3 bg-white rounded-xl shadow-lg px-5 py-3 border border-gray-200">
        <span className="text-sm text-gray-600 self-center">
          {imoveis.length} imóvel{imoveis.length !== 1 ? "is" : ""} seleccionado{imoveis.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={imprimir}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          Imprimir / Guardar PDF
        </button>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-800 px-2"
        >
          ✕ Fechar
        </button>
      </div>

      {/* Conteúdo do relatório */}
      <div id="pdf-relatorio-conteudo" className="bg-white w-full max-w-3xl mx-4 mt-16 rounded-2xl shadow-xl p-10">
        {/* Cabeçalho da consultora */}
        <div className="flex items-center gap-6 pb-6 border-b-2 border-gray-100">
          <img
            src="/agent-photo.webp"
            alt="Liliana Serra"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div>
            <p className="text-xl font-bold text-gray-900">Liliana Serra</p>
            <p className="text-sm text-gray-500 mt-0.5">Consultora Imobiliária · CENTURY 21 Aqua</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
              <span>📱 +351 969 362 511</span>
              <span>✉ liliana.serra@century21.pt</span>
            </div>
          </div>
        </div>

        {/* Título do relatório */}
        <div className="mt-6 mb-6">
          <h1 className="text-lg font-bold text-gray-900">Selecção de Imóveis</h1>
          <p className="text-sm text-gray-400 mt-1">{hoje}</p>
        </div>

        {/* Lista de imóveis */}
        <div className="space-y-6">
          {imoveis.map((imovel, i) => {
            const preco = imovel.preco
              ? imovel.preco.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
              : "Preço sob consulta";
            return (
              <div key={imovel.link || i} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50">
                {/* Foto */}
                <div className="w-28 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  {imovel.foto ? (
                    <img src={imovel.foto} alt={imovel.titulo || "Imóvel"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Sem foto</div>
                  )}
                </div>

                {/* Detalhes */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm leading-snug">
                      {imovel.titulo || "Imóvel"}
                    </p>
                    <span className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                      {imovel.fonte}
                    </span>
                  </div>

                  <p className="text-blue-600 font-bold mt-1">{preco}</p>

                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {imovel.tipologia && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{imovel.tipologia}</span>
                    )}
                    {imovel.area && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{imovel.area} m²</span>
                    )}
                  </div>

                  {imovel.link && (
                    <p className="text-xs text-gray-400 mt-1.5 break-all">{imovel.link}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Liliana Serra · CENTURY 21 Aqua · +351 969 362 511 · liliana.serra@century21.pt
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Documento confidencial — preparado exclusivamente para o destinatário.
          </p>
        </div>
      </div>
    </div>
  );
}
