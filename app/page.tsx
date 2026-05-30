import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Imóveis Figueira da Foz
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pesquisa direta nas agências locais
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            O que procuras?
          </h2>
          <SearchForm />
        </div>
      </main>
    </div>
  );
}
