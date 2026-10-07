/**
 * scripts/prerender.mjs
 *
 * SSG prerender step — runs after `vite build`.
 *
 * For every public route the prerendered React app HTML is injected into the
 * Vite-built template (`dist/index.html`) and written to `dist/<rota>/index.html`.
 * Page-specific <title>, <meta>, and JSON-LD tags are injected based on route
 * metadata so that crawlers see the correct SEO payload without JS.
 *
 * Usage (part of `npm run build`):
 *   vite build && node scripts/prerender.mjs
 */

import { createServer } from 'vite'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { getPublishedPosts, getPublishedTilEntries, escapeHtml, siteUrl, siteName } from './editorial-content.mjs'

const distDir = 'dist'
const defaultTitle = `${siteName} - Engenharia de software sem atalhos`
const defaultDescription =
  'Blog e portfólio de Kawhan Laurindo sobre engenharia de software, back-end .NET, automação industrial e front-end.'
const defaultImage = `/profile/kawhan.jpg`

// O Worker serve dist/<rota>/index.html em /<rota>/ e redireciona /<rota>
// (307). Canonical, hreflang e og:url precisam da forma final, com barra.
const withSlash = (url) => (url.endsWith('/') ? url : `${url}/`)

const absoluteUrl = (path) => (path.startsWith('http') ? path : `${siteUrl}${path}`)

// ── SEO helpers ──────────────────────────────────────────────────────

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Kawhan Laurindo',
  url: siteUrl,
  image: `${siteUrl}/profile/kawhan.jpg`,
  sameAs: [
    'https://github.com/Kawhan',
    'https://www.linkedin.com/in/kawhan/',
  ],
  jobTitle: 'Software Engineer',
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
}

/**
 * Inject SEO `<title>`, `<meta>`, `<link rel="canonical">`, `<link rel="alternate" hreflang="…">`,
 * and JSON-LD into a built HTML string.
 */
function injectSeoTags(html, { title, description, url, image, type, jsonLd, locale }, hreflangLinks = []) {
  const imageUrl = absoluteUrl(image ?? defaultImage)
  const escapedTitle = escapeHtml(title)
  const escapedDescription = escapeHtml(description)
  const escapedUrl = escapeHtml(url)
  const escapedImageUrl = escapeHtml(imageUrl)

  html = html.replace(/<title>.*?<\/title>/, `<title>${escapedTitle}</title>`)
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${locale === 'en' ? 'en' : 'pt-BR'}"`)

  const tags = [
    `<meta name="description" content="${escapedDescription}" />`,
    `<meta property="og:title" content="${escapedTitle}" />`,
    `<meta property="og:description" content="${escapedDescription}" />`,
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:url" content="${escapedUrl}" />`,
    `<meta property="og:image" content="${escapedImageUrl}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
    `<meta name="twitter:description" content="${escapedDescription}" />`,
    `<meta name="twitter:image" content="${escapedImageUrl}" />`,
    `<link rel="canonical" href="${escapedUrl}" />`,
    ...hreflangLinks,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
  ]

  html = html.replace('</head>', `    ${tags.join('\n    ')}\n  </head>`)

  return html
}

function getHreflangLinks(route, ptPosts, enPosts, til) {
  const ptToEn = {
    '/': '/en/',
    '/about': '/en/about',
    '/certificates': '/en/certificates',
    '/blog': '/en/blog',
    '/til': '/en/til',
    '/projects': '/en/projects',
    '/portfolio': '/en/portfolio',
    '/hobbies': '/en/hobbies',
    '/books': '/en/books',
    '/privacy-policy': '/en/privacy-policy',
    '/terms-of-use': '/en/terms-of-use',
  }

  const enToPt = Object.fromEntries(
    Object.entries(ptToEn).map(([pt, en]) => [en, pt]),
  )

  const toUrl = (r) => withSlash(`${siteUrl}${r}`)

  const links = []

  if (route in ptToEn) {
    const enRoute = ptToEn[route]
    links.push(`<link rel="alternate" hreflang="pt-BR" href="${escapeHtml(toUrl(route))}" />`)
    links.push(`<link rel="alternate" hreflang="en" href="${escapeHtml(toUrl(enRoute))}" />`)
  } else if (route in enToPt) {
    const ptRoute = enToPt[route]
    links.push(`<link rel="alternate" hreflang="pt-BR" href="${escapeHtml(toUrl(ptRoute))}" />`)
    links.push(`<link rel="alternate" hreflang="en" href="${escapeHtml(toUrl(route))}" />`)
  }

  const blogMatch = route.match(/^\/(en\/)?blog\/(.+)/)
  if (blogMatch) {
    const isEn = !!blogMatch[1]
    const slug = blogMatch[2]

    if (isEn ? ptPosts.some((p) => p.slug === slug) : enPosts.some((p) => p.slug === slug)) {
      links.push(`<link rel="alternate" hreflang="pt-BR" href="${escapeHtml(toUrl(`/blog/${slug}`))}" />`)
      links.push(`<link rel="alternate" hreflang="en" href="${escapeHtml(toUrl(`/en/blog/${slug}`))}" />`)
    }
  }

  const tilRouteMatch = route.match(/^(\/en)?\/til\/(.+)/)
  if (tilRouteMatch) {
    const isEn = Boolean(tilRouteMatch[1])
    const slug = tilRouteMatch[2]

    if ((isEn ? til.pt : til.en).some((e) => e.slug === slug)) {
      links.push(`<link rel="alternate" hreflang="pt-BR" href="${escapeHtml(toUrl(`/til/${slug}`))}" />`)
      links.push(`<link rel="alternate" hreflang="en" href="${escapeHtml(toUrl(`/en/til/${slug}`))}" />`)
    }
  }

  // Páginas de projeto: mesmo id nos dois idiomas.
  const projectRouteMatch = route.match(/^(\/en)?\/projects\/(.+)/)
  if (projectRouteMatch) {
    const id = projectRouteMatch[2]
    links.push(`<link rel="alternate" hreflang="pt-BR" href="${escapeHtml(toUrl(`/projects/${id}`))}" />`)
    links.push(`<link rel="alternate" hreflang="en" href="${escapeHtml(toUrl(`/en/projects/${id}`))}" />`)
  }

  // x-default aponta para a versão em português, que é a raiz do site.
  // Serve visitantes cujo idioma não casa com pt-BR nem en.
  const ptHreflang = links.find((link) => link.includes('hreflang="pt-BR"'))
  if (ptHreflang) {
    links.push(ptHreflang.replace('hreflang="pt-BR"', 'hreflang="x-default"'))
  }

  return links
}

function getSeoForRoute(route, ptPosts, enPosts, til, content) {
  const projectMatch = route.match(/^(\/en)?\/projects\/(.+)/)
  if (projectMatch && content) {
    const prefix = projectMatch[1] ?? ''
    const isEn = Boolean(prefix)
    const project = content.openSourceProjects.find((p) => p.id === projectMatch[2])
    if (project) {
      const messages = isEn ? content.en : content.ptBR
      const description = messages.openSource.projects[project.id]
      const url = withSlash(`${siteUrl}${prefix}/projects/${project.id}`)
      return {
        locale: isEn ? 'en' : 'pt-BR',
        title: `${project.name} – ${siteName}`,
        description,
        url,
        image: defaultImage,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: project.name,
          description,
          codeRepository: project.repo,
          programmingLanguage: project.technologies,
          dateCreated: project.year,
          url,
          author: { '@type': 'Person', name: siteName },
        },
      }
    }
  }

  const blogMatch = route.match(/^\/(en\/)?blog\/(.+)/)
  if (blogMatch) {
    const isEn = !!blogMatch[1]
    const slug = blogMatch[2]
    const posts = isEn ? enPosts : ptPosts
    const post = posts.find((p) => p.slug === slug)
    if (post) {
      const postUrl = withSlash(isEn ? `${siteUrl}/en/blog/${slug}` : `${siteUrl}/blog/${slug}`)
      const coverImage = post.cover || defaultImage
      return {
        locale: isEn ? 'en' : 'pt-BR',
        title: `${post.title} – ${siteName}`,
        description: post.excerpt || '',
        url: postUrl,
        image: coverImage,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt || '',
          // Dados estruturados exigem URL absoluta; og:image é resolvida em injectSeoTags.
          image: absoluteUrl(coverImage),
          datePublished: post.date,
          url: postUrl,
          author: { '@type': 'Person', name: post.author || siteName },
        },
      }
    }
  }

  const tilMatch = route.match(/^(\/en)?\/til\/(.+)/)
  if (tilMatch) {
    const prefix = tilMatch[1] ?? ''
    const slug = tilMatch[2]
    const entry = (prefix ? til.en : til.pt).find((e) => e.slug === slug)
    if (entry) {
      const entryUrl = withSlash(`${siteUrl}${prefix}/til/${slug}`)
      return {
        locale: prefix ? 'en' : 'pt-BR',
        title: `${entry.title} – ${siteName}`,
        description: entry.excerpt || '',
        url: entryUrl,
        image: defaultImage,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: entry.title,
          description: entry.excerpt || '',
          datePublished: entry.date,
          url: entryUrl,
          author: { '@type': 'Person', name: siteName },
        },
      }
    }
  }

  const staticPages = {
    '/': {
      locale: 'pt-BR', title: defaultTitle, description: defaultDescription, jsonLd: [personJsonLd, websiteJsonLd],
    },
    '/about': {
      locale: 'pt-BR', title: `Sobre – ${siteName}`, description: 'Conheça mais sobre Kawhan Laurindo, engenheiro de software.', jsonLd: personJsonLd,
    },
    '/blog': {
      locale: 'pt-BR', title: `Blog – ${siteName}`, description: 'Artigos sobre engenharia de software, arquitetura, frontend, operação e produto.', jsonLd: personJsonLd,
    },
    '/til': {
      locale: 'pt-BR', title: `Today I Learned – ${siteName}`, description: 'Notas curtas sobre aprendizados técnicos do dia a dia.', jsonLd: personJsonLd,
    },
    '/portfolio': {
      locale: 'pt-BR', title: `Portfólio – ${siteName}`, description: 'Projetos e trabalhos de Kawhan Laurindo.', jsonLd: personJsonLd,
    },
    '/hobbies': {
      locale: 'pt-BR', title: `Hobbies – ${siteName}`, description: 'Interesses pessoais e hobbies de Kawhan Laurindo.', jsonLd: personJsonLd,
    },
    '/certificates': {
      locale: 'pt-BR', title: `Certificados – ${siteName}`, description: 'Todos os certificados de Kawhan Laurindo, agrupados por plataforma, com link para cada credencial.', jsonLd: personJsonLd,
    },
    '/books': {
      locale: 'pt-BR', title: `Livros – ${siteName}`, description: 'Livros que Kawhan Laurindo leu ou está lendo.', jsonLd: personJsonLd,
    },
    '/privacy-policy': {
      locale: 'pt-BR', title: `Política de Privacidade – ${siteName}`, description: 'Política de privacidade do site whoiskawhan.com.',
      jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: `Política de Privacidade – ${siteName}`, description: 'Política de privacidade do site whoiskawhan.com.' },
    },
    '/terms-of-use': {
      locale: 'pt-BR', title: `Termos de Uso – ${siteName}`, description: 'Termos de uso do site whoiskawhan.com.',
      jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: `Termos de Uso – ${siteName}`, description: 'Termos de uso do site whoiskawhan.com.' },
    },
    '/404': {
      locale: 'pt-BR', title: `Página não encontrada – ${siteName}`, description: 'A página que você procura não foi encontrada.',
      jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: `Página não encontrada – ${siteName}` },
    },
    '/en/': {
      locale: 'en', title: `${siteName} – Software engineering without shortcuts`,
      description: 'Blog and portfolio of Kawhan Laurindo about software engineering, .NET back-end, industrial automation, and front-end.',
      jsonLd: [personJsonLd, websiteJsonLd],
    },
    '/en/about': {
      locale: 'en', title: `About – ${siteName}`, description: 'Learn more about Kawhan Laurindo, software engineer.', jsonLd: personJsonLd,
    },
    '/en/blog': {
      locale: 'en', title: `Blog – ${siteName}`, description: 'Articles about software engineering, architecture, frontend, operations, and product.', jsonLd: personJsonLd,
    },
    '/en/til': {
      locale: 'en', title: `Today I Learned – ${siteName}`, description: 'Short notes on day-to-day technical learnings.', jsonLd: personJsonLd,
    },
    '/en/portfolio': {
      locale: 'en', title: `Portfolio – ${siteName}`, description: 'Projects and work by Kawhan Laurindo.', jsonLd: personJsonLd,
    },
    '/en/hobbies': {
      locale: 'en', title: `Hobbies – ${siteName}`, description: 'Personal interests and hobbies of Kawhan Laurindo.', jsonLd: personJsonLd,
    },
    '/en/certificates': {
      locale: 'en', title: `Certificates – ${siteName}`, description: 'Every certificate earned by Kawhan Laurindo, grouped by platform, each linking to its credential.', jsonLd: personJsonLd,
    },
    '/en/books': {
      locale: 'en', title: `Books – ${siteName}`, description: 'Books Kawhan Laurindo has read or is reading.', jsonLd: personJsonLd,
    },
    '/en/privacy-policy': {
      locale: 'en', title: `Privacy Policy – ${siteName}`, description: 'Privacy policy for whoiskawhan.com.',
      jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: `Privacy Policy – ${siteName}`, description: 'Privacy policy for whoiskawhan.com.' },
    },
    '/en/terms-of-use': {
      locale: 'en', title: `Terms of Use – ${siteName}`, description: 'Terms of use for whoiskawhan.com.',
      jsonLd: { '@context': 'https://schema.org', '@type': 'WebPage', name: `Terms of Use – ${siteName}`, description: 'Terms of use for whoiskawhan.com.' },
    },
  }

  const page = staticPages[route]
  if (page) {
    const canonical = withSlash(`${siteUrl}${route}`)
    return { ...page, url: canonical, image: defaultImage, type: 'website' }
  }

  return {
    locale: 'pt-BR', title: defaultTitle, description: defaultDescription,
    url: withSlash(`${siteUrl}${route}`), image: defaultImage, type: 'website', jsonLd: personJsonLd,
  }
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const { ptPosts, enPosts } = getPublishedPosts()
  const til = { pt: getPublishedTilEntries('pt-BR'), en: getPublishedTilEntries('en') }

  const ptStatic = ['/', '/about', '/certificates', '/blog', '/til', '/portfolio', '/hobbies', '/books', '/privacy-policy', '/terms-of-use', '/404']
  const ptBlog = ptPosts.map((p) => `/blog/${p.slug}`)
  const ptTil = til.pt.map((e) => `/til/${e.slug}`)
  const enStatic = ['/en/', '/en/about', '/en/certificates', '/en/blog', '/en/til', '/en/portfolio', '/en/hobbies', '/en/books', '/en/privacy-policy', '/en/terms-of-use']
  const enBlog = enPosts.map((p) => `/en/blog/${p.slug}`)
  const enTil = til.en.map((e) => `/en/til/${e.slug}`)
  const templatePath = join(distDir, 'index.html')
  let template
  try {
    template = readFileSync(templatePath, 'utf8')
  } catch {
    console.error('dist/index.html not found. Run `vite build` first.')
    process.exit(1)
  }

  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
  })

  const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')

  // Projetos e traduções moram em TypeScript; o Vite é quem sabe carregá-los.
  const { openSourceProjects } = await vite.ssrLoadModule('/src/content/open-source.ts')
  const { ptBR } = await vite.ssrLoadModule('/src/locales/pt-BR.ts')
  const { en } = await vite.ssrLoadModule('/src/locales/en.ts')

  const ptProjects = openSourceProjects.map((p) => `/projects/${p.id}`)
  const enProjects = openSourceProjects.map((p) => `/en/projects/${p.id}`)

  const routes = [...ptStatic, ...ptBlog, ...ptTil, ...ptProjects, ...enStatic, ...enBlog, ...enTil, ...enProjects]
  console.log(`Prerendering ${routes.length} routes …\n`)

  for (const route of routes) {
    const seo = getSeoForRoute(route, ptPosts, enPosts, til, { openSourceProjects, ptBR, en })
    const appHtml = render(route)
    let html = template.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
    const hreflangLinks = getHreflangLinks(route, ptPosts, enPosts, til)
    html = injectSeoTags(html, seo, hreflangLinks)

    const normalized = route === '/' ? '' : route
    // O Worker (not_found_handling: "404-page" no wrangler.jsonc) serve
    // dist/404.html com status 404 para qualquer caminho inexistente.
    const outPath = route === '/404'
      ? join(distDir, '404.html')
      : join(distDir, normalized, 'index.html')
    mkdirSync(dirname(outPath), { recursive: true })
    writeFileSync(outPath, html)

    console.log(`  ✓ ${route}`)
  }

  await vite.close()

  // ── Sitemap ────────────────────────────────────────────────────────
  const dateByRoute = {}
  for (const p of ptPosts) {
    if (p.date) dateByRoute[`/blog/${p.slug}`] = p.date
  }
  for (const p of enPosts) {
    if (p.date) dateByRoute[`/en/blog/${p.slug}`] = p.date
  }
  for (const e of til.pt) {
    if (e.date) dateByRoute[`/til/${e.slug}`] = e.date
  }
  for (const e of til.en) {
    if (e.date) dateByRoute[`/en/til/${e.slug}`] = e.date
  }

  const today = new Date().toISOString().split('T')[0]
  const routeSet = new Set(routes)

  const sitemapUrls = routes
    .filter((r) => r !== '/404')
    .map((route) => {
      const normalizeUrl = (p) => `${siteUrl}${p.endsWith('/') ? p : p + '/'}`
      const loc = normalizeUrl(route)
      const lastmod = dateByRoute[route] || today

      const isEn = route.startsWith('/en')
      const ptRoute = route === '/en/' ? '/' : isEn ? route.slice(3) : route
      const enRoute = route === '/' ? '/en/' : isEn ? route : '/en' + route
      const hasBoth = routeSet.has(ptRoute) && routeSet.has(enRoute) && ptRoute !== enRoute

      const alternates = hasBoth
        ? `
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${normalizeUrl(ptRoute)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${normalizeUrl(enRoute)}"/>`
        : ''

      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>${alternates}
  </url>`
    })
    .join('\n')

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapUrls}
</urlset>`

  writeFileSync('dist/sitemap.xml', sitemap)
  console.log('  ✓ dist/sitemap.xml')

  console.log(`\nPrerender complete — ${routes.length} routes, ${routes.length - 1} sitemap URLs.`)
}

main().catch((err) => {
  console.error('\nPrerender failed:', err)
  process.exit(1)
})
