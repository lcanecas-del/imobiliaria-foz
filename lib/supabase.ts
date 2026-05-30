import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  data_recolha?: string;
};
