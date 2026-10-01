import { fireEvent, render, screen, within } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import Home from './home'
import Portfolio from './portfolio'
import Project from './project'
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

  it('paginates the open source projects six per page, linking each to its page', () => {
    window.HTMLElement.prototype.scrollIntoView = () => {}
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

    const pages = [openSourceProjects.slice(0, 6), openSourceProjects.slice(6)]
    for (const [index, projects] of pages.entries()) {
      if (index > 0) fireEvent.click(within(section).getByRole('link', { name: /pr.xima p.gina/i }))
      expect(within(section).getByText(`Página ${index + 1} de ${pages.length}`)).toBeInTheDocument()
      const list = within(section).getByRole('list')
      expect(within(list).getAllByRole('link')).toHaveLength(projects.length)
      for (const project of projects) {
        expect(within(list).getByRole('heading', { name: project.name }).closest('a')).toHaveAttribute(
          'href',
          `/projects/${project.id}`,
        )
      }
    }
    expect(within(section).queryByRole('link', { name: /pr.xima p.gina/i })).not.toBeInTheDocument()
    expect(within(section).getByRole('link', { name: /p.gina anterior/i })).toHaveAttribute('href', '/portfolio#projects')
  })

  it('brings the project page back to the portfolio page it was opened from', () => {
    window.HTMLElement.prototype.scrollIntoView = () => {}
    const project = openSourceProjects[6]
    render(
      <MemoryRouter initialEntries={['/portfolio?page=2']}>
        {withI18n(
          <Routes>
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/projects/:id" element={<Project />} />
          </Routes>,
        )}
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('heading', { name: project.name }))
    expect(screen.getByRole('heading', { level: 1, name: project.name })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /voltar para o portf.lio/i })).toHaveAttribute('href', '/portfolio?page=2#projects')
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
