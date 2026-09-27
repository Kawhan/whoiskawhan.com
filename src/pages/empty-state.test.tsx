import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import Blog from './blog'
import Home from './home'
import Til from './til'
import { I18nProvider, i18nStorageKey } from '@/lib/i18n'
import { ThemeProvider } from '@/lib/theme'

// Sem nenhum conteúdo publicado: é o caso que o empty state cobre.
vi.mock('@/content/posts', () => ({ markdownPostSources: [] }))
vi.mock('@/content/til', () => ({ markdownTilSources: [] }))

function renderRoute(path: string, element: ReactNode) {
  window.localStorage.setItem(i18nStorageKey, 'pt-BR')
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <I18nProvider>
          <Routes>
            <Route path={path} element={element} />
          </Routes>
        </I18nProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('empty states', () => {
  it('shows the blog empty state and hides pagination', () => {
    renderRoute('/blog', <Blog />)

    expect(screen.getByRole('heading', { name: /o primeiro artigo está a caminho/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver projetos/i })).toHaveAttribute('href', '/portfolio#projects')
    expect(screen.queryByRole('navigation', { name: /paginação/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/página 1 de/i)).not.toBeInTheDocument()
  })

  it('hides the latest writing section on the home page', () => {
    renderRoute('/', <Home />)

    expect(screen.queryByRole('region', { name: /escrita recente/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/escrita recente/i)).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /projetos/i, level: 2 })).toBeInTheDocument()
  })

  it('shows the TIL empty state and hides pagination', () => {
    renderRoute('/til', <Til />)

    expect(screen.getByRole('heading', { name: /nenhuma nota ainda/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver projetos/i })).toHaveAttribute('href', '/portfolio#projects')
    expect(screen.queryByTestId('til-grid')).not.toBeInTheDocument()
    expect(screen.queryByText(/página 1 de/i)).not.toBeInTheDocument()
  })
})
