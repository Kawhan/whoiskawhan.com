import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import Hobbies from './hobbies'
import { I18nProvider, i18nStorageKey } from '@/lib/i18n'

describe('hobbies page', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(i18nStorageKey, 'pt-BR')
  })

  it('renders the hobby cards and the external Steam profile', () => {
    render(
      <MemoryRouter initialEntries={['/hobbies']}>
        <I18nProvider>
          <Routes>
            <Route path="/hobbies" element={<Hobbies />} />
          </Routes>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: /fora do editor/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /steamcommunity.com\/profiles\/76561198841570916/i })).toHaveAttribute('href', 'https://steamcommunity.com/profiles/76561198841570916/')
    // "Jogos" aparece só no card de resumo; a seção de galerias foi retirada.
    expect(screen.getAllByRole('heading', { name: /^jogos$/i })).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /^leitura$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /rpg de mesa/i })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /jogando agora/i })).not.toBeInTheDocument()
  })

})
