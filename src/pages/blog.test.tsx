import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Blog from './blog'
import BlogPost from './blog-post'
import { BLOG_POSTS_PER_PAGE, getPublishedPosts } from '@/lib/posts'
import { I18nProvider, i18nStorageKey } from '@/lib/i18n'
import { ThemeProvider } from '@/lib/theme'
import { FIXTURE_CODE_LANGUAGE, FIXTURE_CODE_SNIPPET, FIXTURE_POST_SLUG } from '@/test/fixtures/editorial'

// Conteúdo fixo, não o que está publicado em src/content/.
vi.mock('@/content/posts', async () => {
  const { postFixtures } = await import('@/test/fixtures/editorial')
  return { markdownPostSources: postFixtures }
})

const clipboardWrite = vi.fn()

function renderBlogRoute(initialEntry = '/blog') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ThemeProvider>
        <I18nProvider>
          <Routes>
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </I18nProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('blog editorial pages', () => {
  beforeEach(() => {
    clipboardWrite.mockResolvedValue(undefined)
    window.localStorage.clear()
    window.localStorage.setItem(i18nStorageKey, 'pt-BR')
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: clipboardWrite,
      },
    })
  })

  it('renders the first paginated page with pagination controls', () => {
    renderBlogRoute()

    expect(screen.getByRole('heading', { level: 1, name: /engenharia em campo/i })).toBeInTheDocument()
    expect(screen.getByTestId('recent-post-grid')).toHaveClass('md:grid-cols-6')

    const articles = screen.getAllByRole('article')
    expect(articles).toHaveLength(Math.min(BLOG_POSTS_PER_PAGE, getPublishedPosts().length))

    for (const post of getPublishedPosts().slice(0, BLOG_POSTS_PER_PAGE)) {
      const tile = screen.getByTestId(`post-card-${post.slug}`)
      expect(within(tile).getByText(post.kicker)).toBeInTheDocument()
      expect(within(tile).getByRole('link', { name: post.title })).toHaveAttribute('href', `/blog/${post.slug}`)
      expect(within(tile).getByText(post.excerpt)).toBeInTheDocument()
      expect(within(tile).getByText((content) => content.includes(post.readingTime))).toBeInTheDocument()
    }

    expect(screen.getByText(new RegExp(`página 1 de ${Math.ceil(getPublishedPosts().length / BLOG_POSTS_PER_PAGE)}`, 'i'))).toBeInTheDocument()
    expect(screen.getByText(/próxima página/i)).toBeInTheDocument()
  })

  it('clamps subsequent paginated pages to the last available page', () => {
    renderBlogRoute('/blog?page=2')

    const posts = getPublishedPosts()
    // Page 2 clamps to page 1 when total posts < BLOG_POSTS_PER_PAGE
    expect(screen.getAllByRole('article')).toHaveLength(posts.length)
    expect(screen.getByText(new RegExp(`página 1 de ${Math.ceil(posts.length / BLOG_POSTS_PER_PAGE)}`, 'i'))).toBeInTheDocument()
  })

  it('renders a post route by slug with author links and a 720px reading container', () => {
    renderBlogRoute(`/blog/${FIXTURE_POST_SLUG}`)

    const article = screen.getByRole('article')
    expect(article).toHaveClass('article-container')
    expect(screen.getByRole('heading', { level: 1, name: /Post de teste/i })).toBeInTheDocument()
    expect(screen.getByText('TESTE')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /kawhan laurindo de lima/i })).toHaveAttribute('src', '/profile/kawhan.jpg')
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/Kawhan')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/kawhan/')
    expect(screen.getByRole('link', { name: 'Steam' })).toHaveAttribute('href', 'https://steamcommunity.com/profiles/76561198841570916/')
    expect(screen.getByRole('navigation', { name: /neste texto/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/comentários/i)).toBeInTheDocument()
  })

  it('does not render a newsletter form', () => {
    renderBlogRoute(`/blog/${FIXTURE_POST_SLUG}`)

    // A seção de newsletter foi removida enquanto não existe um Substack.
    // Ver src/components/blog/newsletter-cta.tsx, que segue no repositório.
    expect(screen.queryByRole('form', { name: /newsletter/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/substack/i)).not.toBeInTheDocument()
  })

  it('renders a post in English when EN locale is set and translation exists', () => {
    window.localStorage.setItem(i18nStorageKey, 'en')
    renderBlogRoute(`/blog/${FIXTURE_POST_SLUG}`)

    expect(screen.getByRole('heading', { level: 1, name: /Test post/i })).toBeInTheDocument()
    expect(screen.getByText('TEST')).toBeInTheDocument()
    expect(screen.getByText(/4 MIN READ/i)).toBeInTheDocument()
  })

  it('renders a friendly not found state for an unknown post slug', () => {
    renderBlogRoute('/blog/slug-inexistente')

    expect(screen.getByRole('heading', { name: /artigo não encontrado/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voltar para o blog/i })).toHaveAttribute('href', '/blog')
  })

  it('shows language metadata and copies code block content', async () => {
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: clipboardWrite },
    })
    renderBlogRoute(`/blog/${FIXTURE_POST_SLUG}`)

    expect(screen.getByText(FIXTURE_CODE_LANGUAGE)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: new RegExp(`copiar ${FIXTURE_CODE_LANGUAGE}`, 'i') }))

    expect(clipboardWrite).toHaveBeenCalledWith(expect.stringContaining(FIXTURE_CODE_SNIPPET))
    expect(await screen.findByText(/copiado/i)).toBeInTheDocument()
  })
})
