/**
 * Conteúdo editorial fixo para os testes.
 *
 * Os testes mockam `@/content/posts` e `@/content/til` com estes valores, em
 * vez de ler os arquivos de `src/content/`. Isso desacopla a suíte do que
 * está publicado: escrever, editar ou apagar um post não quebra teste nenhum.
 *
 * Mantenha o frontmatter aqui em dia com as regras de
 * `scripts/validate-editorial.mjs` — é o mesmo contrato.
 */

type Source = { path: string; raw: string }

const COVER = 'https://example.com/cover.png'

function post(meta: {
  slug: string
  locale: 'pt-BR' | 'en'
  title: string
  kicker: string
  date: string
  readingTime: string
  excerpt: string
  published?: boolean
  body: string
}): Source {
  const { slug, locale, title, kicker, date, readingTime, excerpt, published = true, body } = meta

  return {
    path: `./posts/${date}-${slug}/${locale}.md`,
    raw: [
      '---',
      `slug: ${slug}`,
      `translationKey: ${slug}`,
      `title: ${title}`,
      `kicker: ${kicker}`,
      `date: ${date}`,
      `readingTime: ${readingTime}`,
      'author: kawhan',
      `excerpt: ${excerpt}`,
      `cover: ${COVER}`,
      'coverAlt: Imagem de capa de teste',
      `published: ${published}`,
      `locale: ${locale}`,
      '---',
      '',
      body,
      '',
    ].join('\n'),
  }
}

/** Trecho de código usado pelo teste de "copiar bloco de código". */
export const FIXTURE_CODE_LANGUAGE = 'bash'
export const FIXTURE_CODE_SNIPPET = 'npm run validate'

const bodyWithCode = [
  'Parágrafo de abertura do post de teste.',
  '',
  '## Primeira seção',
  '',
  'Texto da primeira seção, que também alimenta o índice lateral.',
  '',
  '- primeiro item',
  '- segundo item',
  '',
  '## Segunda seção',
  '',
  '```' + FIXTURE_CODE_LANGUAGE,
  FIXTURE_CODE_SNIPPET,
  '```',
].join('\n')

/** O post mais recente: tem tradução em inglês e bloco de código. */
export const FIXTURE_POST_SLUG = 'post-de-teste'
/** Posts anteriores, para exercitar a grade "artigos recentes" e a paginação. */
export const FIXTURE_OLDER_SLUGS = ['post-anterior', 'post-mais-antigo'] as const
/** Post não publicado: precisa ficar de fora de toda listagem. */
export const FIXTURE_DRAFT_SLUG = 'rascunho-nao-publicado'

export const postFixtures: Source[] = [
  post({
    slug: FIXTURE_POST_SLUG,
    locale: 'pt-BR',
    title: 'Post de teste',
    kicker: 'TESTE',
    date: '2026-03-10',
    readingTime: '4 MIN DE LEITURA',
    excerpt: 'Resumo do post de teste em português.',
    body: bodyWithCode,
  }),
  post({
    slug: FIXTURE_POST_SLUG,
    locale: 'en',
    title: 'Test post',
    kicker: 'TEST',
    date: '2026-03-10',
    readingTime: '4 MIN READ',
    excerpt: 'Summary of the test post in English.',
    body: bodyWithCode,
  }),
  post({
    slug: FIXTURE_OLDER_SLUGS[0],
    locale: 'pt-BR',
    title: 'Post anterior',
    kicker: 'TESTE',
    date: '2026-02-05',
    readingTime: '3 MIN DE LEITURA',
    excerpt: 'Resumo do segundo post.',
    body: 'Corpo do segundo post.',
  }),
  post({
    slug: FIXTURE_OLDER_SLUGS[1],
    locale: 'pt-BR',
    title: 'Post mais antigo',
    kicker: 'TESTE',
    date: '2026-01-02',
    readingTime: '2 MIN DE LEITURA',
    excerpt: 'Resumo do terceiro post.',
    body: 'Corpo do terceiro post.',
  }),
  post({
    slug: FIXTURE_DRAFT_SLUG,
    locale: 'pt-BR',
    title: 'Rascunho não publicado',
    kicker: 'TESTE',
    date: '2026-04-01',
    readingTime: '1 MIN DE LEITURA',
    excerpt: 'Este post não deve aparecer em nenhuma listagem.',
    published: false,
    body: 'Corpo do rascunho.',
  }),
]

export const FIXTURE_TIL_SLUG = 'til-de-teste'

export const tilFixtures: Source[] = [
  {
    path: `./til/${FIXTURE_TIL_SLUG}.md`,
    raw: [
      '---',
      `slug: ${FIXTURE_TIL_SLUG}`,
      'title: TIL de teste',
      'kicker: TESTE',
      'date: 2026-03-08',
      'excerpt: Resumo curto da nota de teste.',
      'published: true',
      'locale: pt-BR',
      '---',
      '',
      'Corpo da nota de teste.',
      '',
      '```' + FIXTURE_CODE_LANGUAGE,
      FIXTURE_CODE_SNIPPET,
      '```',
      '',
    ].join('\n'),
  },
]
