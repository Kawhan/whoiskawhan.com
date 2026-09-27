# Exemplos de conteúdo editorial

Modelos para copiar quando você for publicar. Nada aqui é lido pelo site —
são arquivos inertes, só de referência.

## Publicar um post

Um post é uma **pasta** em `src/content/posts/`, nomeada `YYYY-MM-DD-slug`, com
dois arquivos dentro: `pt-BR.md` e `en.md`. Os dois são obrigatórios.

```bash
mkdir -p src/content/posts/2026-10-01-meu-primeiro-post
cp docs/exemplos/post-pt-BR.md src/content/posts/2026-10-01-meu-primeiro-post/pt-BR.md
cp docs/exemplos/post-en.md    src/content/posts/2026-10-01-meu-primeiro-post/en.md
```

Depois edite o frontmatter dos dois arquivos. Estes campos precisam ser
**idênticos** nas duas versões, senão o build falha:

| Campo | Regra |
|---|---|
| `slug` | igual nos dois; define a URL `/blog/<slug>` |
| `translationKey` | igual nos dois; é o que liga as traduções |
| `date` | igual nos dois, formato `YYYY-MM-DD` |
| `cover` | igual nos dois |
| `author` | igual nos dois; tem que existir em `src/content/authors.ts` |
| `published` | igual nos dois; `true` ou `false` |

Livres para variar: `title`, `kicker`, `excerpt`, `readingTime` e o corpo.

## Publicar um TIL

TIL é mais simples: um arquivo `.md` solto em `src/content/til/`, sem pasta e
sem par de tradução obrigatório. O idioma vem do campo `locale`.

```bash
cp docs/exemplos/til-pt-BR.md src/content/til/meu-til.md
```

Campos obrigatórios: `slug`, `title`, `kicker`, `date`, `excerpt`, `published`.

## Antes de commitar

```bash
npm run validate
```

Roda typecheck, testes, validação editorial e paridade de idiomas. Se algum
campo estiver errado ou faltando, ele aponta o arquivo e o campo.

## O que o markdown aceita

O parser é próprio e pequeno (`src/lib/markdown.ts`). Ele entende:

- parágrafos
- títulos de nível dois (`## Título`) — viram o índice lateral do post
- listas com traço (`- item`)
- blocos de código cercados por ``` com a linguagem na primeira linha

Não aceita HTML embutido, e isso é de propósito: sem `dangerouslySetInnerHTML`
no caminho, o conteúdo não pode virar vetor de XSS.
