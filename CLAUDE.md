# CLAUDE.md — Plataforma Imobiliária Figueira da Foz

## O que é este projeto
Plataforma web para consultores imobiliários pesquisarem imóveis
diretamente nos sites das agências locais da Figueira da Foz,
sem depender de portais como Idealista ou Imovirtual.

## Stack
- Next.js (frontend + API routes)
- Supabase (base de dados PostgreSQL)
- Playwright (scraping dos sites das agências)
- Anthropic API / Claude (extração inteligente de dados)
- Vercel (deploy)
- GitHub (repositório)

## Utilizadora
Liliana — nível técnico básico. Explica sempre o que vais fazer
antes de fazer. Espera confirmação antes de avançar para a
próxima tarefa.

## Regras importantes
1. Faz UMA tarefa de cada vez — nunca avances sem confirmação
2. Antes de cada tarefa, diz em 2 linhas o que vais fazer e porquê
3. Depois de cada tarefa, diz como testar se funcionou
4. Nunca apagues código que funciona para fazer outra coisa
5. Se encontrares um problema, explica-o em linguagem simples
   antes de propor solução
6. Guarda sempre as variáveis sensíveis (API keys, passwords)
   em ficheiro .env.local — nunca no código

## Agências — Fase 1
- Remax → https://www.remax.pt/comprar/figueira-da-foz
- Zome → https://www.zome.pt/pt/figueira-da-foz-h52592/imoveis

## Agências — Fase 2
- Himobiliária → https://himobiliaria.com/
- Homelusa → https://www.homelusa.pt/comprar-casa
- Renthouse → https://www.renthouse.com.pt/imoveis/venda/
- Imojardim → https://www.imojardim.pt/
- Realfoz → https://www.realfoz.pt
- Imogabinete → https://www.imogabinete.com/imoveis
- Espaços e Casas → https://www.espacosecasas.pt/
- Imoexpansão → https://imoexpansao.pt/
- ImoVEEL → bloqueado por Cloudflare (não scraping)

## Campos a recolher de cada imóvel
- título, preço, tipologia, área, descrição
- contacto da agência, link direto, foto principal
- data de recolha, fonte (nome da agência)

## Arquitetura
Os scrapers correm localmente (no PC da Liliana) e guardam resultados
no Supabase. A plataforma web (Vercel) apenas lê da base de dados.

## Estado atual
Projeto completo e publicado em https://imobiliaria-foz-bku9.vercel.app

### Arquitetura de dados
- **Remax e Zome** — chamadas em tempo real a cada pesquisa (APIs directas, ~2s)
- **Restantes 8 agências** — lidos do Supabase (cache); actualizar com scraper local

### Scrapers locais (correr no PC da Liliana)
```
npx tsx lib/scrapers/run.ts
```
Ficheiros principais:
- `lib/scrapers/run.ts` — orquestra todos os scrapers
- `lib/scrapers/remax.ts` + `lib/scrapers/zome.ts` — APIs directas (Fase 1)
- `lib/scrapers/egorealestate.ts` — Playwright para Homelusa, Realfoz, Imogabinete
- `lib/scrapers/himobiliaria.ts` — Playwright para H-Imobiliária
- `lib/fetchers.ts` — fetch + Claude Haiku para Imojardim, Espaços e Casas, Renthouse, Imoexpansão

### Vercel
- Projecto público: `imobiliaria-foz-bku9` (não confundir com `imobiliaria-foz` que tem auth)
- Deploy: `npx vercel --prod` (a partir deste directório, já ligado ao projecto certo)
- Variáveis de ambiente necessárias: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ANTHROPIC_API_KEY
