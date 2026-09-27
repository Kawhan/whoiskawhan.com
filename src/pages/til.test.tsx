import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import Til from './til'
import TilPost from './til-post'
import { I18nProvider, i18nStorageKey } from '@/lib/i18n'
import { ThemeProvider } from '@/lib/theme'
import { FIXTURE_CODE_LANGUAGE, FIXTURE_TIL_SLUG } from '@/test/fixtures/editorial'

// Conteúdo fixo, não o que está publicado em src/content/.
vi.mock('@/content/til', async () => {
  const { tilFixtures } = await import('@/test/fixtures/editorial')
  return { markdownTilSources: tilFixtures }
})

function renderTilRoute(initialEntry: string, route: ReactNode) {
  window.localStorage.setItem(i18nStorageKey, 'pt-BR')
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ThemeProvider>
        <I18nProvider>{route}</I18nProvider>
      </ThemeProvider>
    </MemoryRouter>,
  )
}

describe('today i learned pages', () => {
  it('renders TIL entries from markdown', () => {
    renderTilRoute('/til',
        <Routes>
          <Route path="/til" element={<Til />} />
        </Routes>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /notas de aprendizado/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /til de teste/i })).toHaveAttribute('href', `/til/${FIXTURE_TIL_SLUG}`)
    expect(screen.getByTestId('til-grid')).toBeInTheDocument()
    expect(screen.getByText(/página 1 de 1/i)).toBeInTheDocument()
    expect(screen.getByText(/próxima página/i)).toBeInTheDocument()
  })

  it('renders a TIL detail page with comments', () => {
    renderTilRoute(`/til/${FIXTURE_TIL_SLUG}`,
        <Routes>
          <Route path="/til/:slug" element={<TilPost />} />
        </Routes>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /til de teste/i })).toBeInTheDocument()
    expect(screen.getByText(FIXTURE_CODE_LANGUAGE)).toBeInTheDocument()
    expect(screen.getByLabelText(/comentários/i)).toBeInTheDocument()
  })
})
