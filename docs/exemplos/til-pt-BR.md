---
slug: exemplo-de-til
title: Como funciona uma nota TIL
kicker: EXEMPLO
date: 2026-09-26
excerpt: TIL é para nota curta — uma coisa que você aprendeu hoje e cabe em poucos parágrafos, sem a cerimônia de um post.
published: true
locale: pt-BR
---

Diferente de um post, uma nota TIL é um arquivo `.md` solto em `src/content/til/`, sem pasta e sem par de tradução obrigatório. O idioma vem do campo `locale` no frontmatter.

Os campos obrigatórios são poucos: `slug`, `title`, `kicker`, `date`, `excerpt` e `published`. Não tem `cover`, não tem `readingTime`, não tem `author`.

A ideia é reduzir o atrito. Se você aprendeu algo que cabe em três parágrafos, não precisa transformar em artigo — vira TIL e pronto.

```bash
npm run validate:editorial
```

Apague este arquivo quando escrever a sua primeira nota de verdade.
