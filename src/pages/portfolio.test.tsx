import { render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import Home from './home'
import Portfolio from './portfolio'
import Books from './books'
import { I18nProvider, i18nStorageKey } from '@/lib/i18n'
import { openSourceProjects } from '@/content/open-source'

function withI18n(children: ReactNode) {
  return <I18nProvider>{children}</I18nProvider>
}

describe('editorial secondary pages', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(i18nStorageKey, 'pt-BR')
  })

  it('renders the minimal home with open source projects and latest writing', () => {
    render(
      <MemoryRouter>
        {withI18n(<Home />)}
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: /conheca meu trabalho/i })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Opportunity Microservices' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'NLW Journey API' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'libft' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ler artigos/i })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: /ver projetos/i })).toHaveAttribute('href', '/portfolio')
    expect(screen.getByText(/apis \.net para automa..o industrial/i)).toBeInTheDocument()
    expect(screen.getByText(/arquitetura orientada a eventos e s.ries temporais/i)).toBeInTheDocument()
    expect(screen.getByText(/confiss.es, de santo agostinho/i)).toBeInTheDocument()
    expect(screen.getByText(/atualizado em 26 set\. 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/CONSTRUINDO/)).toBeInTheDocument()
    expect(screen.getByText(/ESTUDANDO/)).toBeInTheDocument()
    expect(screen.getByText(/LENDO/)).toBeInTheDocument()
  })

  it('renders the portfolio page in editorial sections', () => {
    render(
      <MemoryRouter initialEntries={['/portfolio']}>
        {withI18n(
          <Routes>
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>,
        )}
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /onde eu resolvo problema/i })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByText('SERVIÇO PÚBLICO')).toBeInTheDocument()
  })

  it('lists every open source project on the portfolio, linking to its page', () => {
    render(
      <MemoryRouter initialEntries={['/portfolio']}>
        {withI18n(
          <Routes>
            <Route path="/portfolio" element={<Portfolio />} />
          </Routes>,
        )}
      </MemoryRouter>,
    )

    const section = screen.getByRole('region', { name: 'Projetos' })
    expect(section).toHaveAttribute('id', 'projects')
    expect(within(section).getAllByRole('link')).toHaveLength(openSourceProjects.length)
    for (const project of openSourceProjects) {
      expect(within(section).getByRole('heading', { name: project.name }).closest('a')).toHaveAttribute(
        'href',
        `/projects/${project.id}`,
      )
    }
  })

  it('renders books with the same editorial visual hierarchy', () => {
    render(
      <MemoryRouter>
        {withI18n(<Books />)}
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /biblioteca de engenharia/i })).toBeInTheDocument()
    expect(screen.getByTestId('books-carousel')).toHaveClass('overflow-x-auto')
    expect(screen.getByRole('button', { name: /livro anterior/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /pr.ximo livro/i })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /o programador pragm.tico/i })).toBeInTheDocument()
  })
})
