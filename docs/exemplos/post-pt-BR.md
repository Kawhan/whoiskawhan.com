---
slug: primeiro-post
translationKey: primeiro-post
title: Primeiro post
kicker: EXEMPLO
date: 2026-09-26
readingTime: 2 MIN DE LEITURA
author: kawhan
excerpt: Post de exemplo que existe só para demonstrar o formato editorial do site. Substitua ou apague quando publicar o primeiro texto de verdade.
cover: https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80
coverAlt: Mesa de trabalho com caderno aberto e teclado
published: true
locale: pt-BR
---

Este post existe só para mostrar como o conteúdo é estruturado. Ele mantém os validadores passando enquanto você ainda não escreveu nada. Pode editar por cima ou apagar a pasta inteira.

## Como um post funciona

Cada post é uma pasta em `src/content/posts/`, nomeada com a data e o slug. Dentro dela ficam dois arquivos: `pt-BR.md` e `en.md`. Os dois precisam existir, e alguns campos precisam bater exatamente entre eles.

- `slug`, `translationKey`, `date`, `cover` e `author` têm que ser idênticos nos dois idiomas
- `published` também precisa ser o mesmo — não dá para publicar só em um idioma
- `title`, `excerpt`, `kicker` e o corpo do texto são livres para variar

Se algum desses campos divergir, o comando `npm run validate:editorial` falha e aponta qual arquivo está errado.

## O que o markdown aceita

O parser é próprio e deliberadamente pequeno. Ele entende parágrafos, títulos de nível dois, listas com traço e blocos de código:

```bash
npm run validate:editorial
```

Não há suporte a HTML embutido, e isso é intencional: sem `dangerouslySetInnerHTML` no caminho, não existe superfície de XSS vinda do conteúdo.

## Próximos passos

Apague esta pasta, crie a sua com a data de hoje e escreva. O índice do blog, o RSS, o sitemap e as páginas pré-renderizadas se atualizam sozinhos a partir dos arquivos.
