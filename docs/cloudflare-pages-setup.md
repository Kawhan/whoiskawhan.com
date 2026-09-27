# Deploy na Cloudflare Pages

Este site é estático: o build gera HTML pré-renderizado em `dist/` e não existe
backend. Qualquer host de estáticos serve, mas a Cloudflare Pages é a escolha
natural aqui porque é o único, junto da Netlify, que lê os arquivos
`public/_headers` e `public/_redirects`. No GitHub Pages esses dois são
ignorados — e com eles vão embora os cabeçalhos de segurança e a
canonicalização de `www`.

## Configuração

1. Cloudflare → **Pages** → *Create a project* → *Connect to Git*
2. Selecione o repositório `Kawhan/whoiskawhan`
3. Build settings:

   | Campo | Valor |
   |---|---|
   | Framework preset | None (Vite puro) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | 22 — variável de ambiente `NODE_VERSION=22` |

4. Domínio próprio:
   - Adicione `whoiskawhan.com` em *Custom domains*
   - A Cloudflare emite o certificado SSL sozinha
   - Aponte o DNS do registrador para os nameservers da Cloudflare

5. `public/_headers` e `public/_redirects` são aplicados automaticamente, sem
   configuração adicional.

## Por que Node 22

O `vite.config.ts` usa `import.meta.dirname`, que existe a partir do Node 20.11.
O `sharp` 0.35 pede Node 22 ou superior. Se o build falhar com erro de versão,
confira essa variável antes de qualquer outra coisa.

## O que já vem configurado no repositório

**`public/_headers`** — `X-Content-Type-Options: nosniff`, `X-Frame-Options:
DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, cache de um ano para
`/assets/*` e de uma hora para `/rss/*`.

**`public/_redirects`** — 301 de `www.whoiskawhan.com/*` para a raiz, evitando
que o Google trate os dois endereços como conteúdo duplicado.

## GitHub Actions

Existe um workflow em `.github/workflows/gh-pages.yml` que publica no **GitHub
Pages**. Se o deploy passar a ser pela Cloudflare, esse workflow vira
redundante: os dois publicariam a cada push, em endereços diferentes. Remova ou
desative quando decidir.

## Observações

- HTTP → HTTPS é tratado pela própria Cloudflare
- A barra final é normalizada pelo servidor estático: `/blog/` serve
  `dist/blog/index.html`
- Deploy puramente estático não precisa de `wrangler.toml`; o painel basta
- A Cloudflare guarda o histórico de deploys e permite rollback com um clique
