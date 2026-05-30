import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type Imovel = {
  id?: string;
  fonte: string;
  titulo: string | null;
  preco: number | null;
  tipologia: string | null;
  area: number | null;
  descricao: string | null;
  contacto: string | null;
  link: string | null;
  foto: string | null;
  referencia?: string | null;
  data_recolha?: string;
};
