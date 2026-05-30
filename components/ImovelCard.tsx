"use client";

import { useState } from "react";
import type { Imovel } from "@/lib/supabase";

interface Props {
  imovel: Imovel;
  selecionado?: boolean;
  onToggleSelecao?: (imovel: Imovel) => void;
}

export default function ImovelCard({ imovel, selecionado = false, onToggleSelecao }: Props) {
  const [copiado, setCopiado] = useState(false);

  const preco = imovel.preco
    ? imovel.preco.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
    : "Preço sob consulta";

  function copiarLink() {
    if (!imovel.link) return;
    navigator.clipboard.writeText(imovel.link).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <div className={`bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow ${selecionado ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"}`}>
      {/* Foto */}
      <div className="relative h-48 bg-gray-100">
        {/* Checkbox de seleção */}
        {onToggleSelecao && (
          <button
            onClick={() => onToggleSelecao(imovel)}
            aria-label={selecionado ? "Remover seleção" : "Selecionar imóvel"}
            className={`absolute top-2 left-2 z-10 w-6 h-6 rounded border-2 flex items-center justify-center shadow transition-colors ${
              selecionado ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300 hover:border-blue-400"
            }`}
          >
            {selecionado && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        )}

        {imovel.foto ? (
          <img
            src={imovel.foto}
            alt={imovel.titulo || "Imóvel"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Sem foto disponível
          </div>
        )}

        {/* Badge da fonte */}
        <span className="absolute top-2 right-2 bg-white text-gray-700 text-xs font-semibold px-2 py-1 rounded-full shadow">
          {imovel.fonte}
        </span>
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        <p className="text-xl font-bold text-blue-600">{preco}</p>

        <p className="text-sm font-medium text-gray-900 line-clamp-2">
          {imovel.titulo || "Imóvel"}
        </p>

        <div className="flex flex-wrap gap-2">
          {imovel.tipologia && (
            <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {imovel.tipologia}
            </span>
          )}
          {imovel.area && (
            <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
              {imovel.area} m²
            </span>
          )}
        </div>

        {imovel.descricao && (
          <p className="text-xs text-gray-500 line-clamp-3">{imovel.descricao}</p>
        )}

        {imovel.contacto && (
          <p className="text-xs text-gray-600">
            <span className="font-medium">Contacto:</span> {imovel.contacto}
          </p>
        )}

        {/* Botões */}
        {imovel.link && (
          <div className="flex gap-2">
            <a
              href={imovel.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
            >
              Ver imóvel →
            </a>
            <button
              onClick={copiarLink}
              title="Copiar link"
              className="px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {copiado ? (
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
