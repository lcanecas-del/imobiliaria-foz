import type { Imovel } from "@/lib/supabase";

export default function ImovelCard({ imovel }: { imovel: Imovel }) {
  const preco = imovel.preco
    ? imovel.preco.toLocaleString("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
    : "Preço sob consulta";

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Foto */}
      <div className="relative h-48 bg-gray-100">
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
        {/* Preço */}
        <p className="text-xl font-bold text-blue-600">{preco}</p>

        {/* Título */}
        <p className="text-sm font-medium text-gray-900 line-clamp-2">
          {imovel.titulo || "Imóvel"}
        </p>

        {/* Tags: tipologia e área */}
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

        {/* Descrição */}
        {imovel.descricao && (
          <p className="text-xs text-gray-500 line-clamp-3">{imovel.descricao}</p>
        )}

        {/* Contacto */}
        {imovel.contacto && (
          <p className="text-xs text-gray-600">
            <span className="font-medium">Contacto:</span> {imovel.contacto}
          </p>
        )}

        {/* Botão ver imóvel */}
        {imovel.link && (
          <a
            href={imovel.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            Ver imóvel →
          </a>
        )}
      </div>
    </div>
  );
}
