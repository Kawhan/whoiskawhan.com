import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import Hobbies from './hobbies'
import { I18nProvider, i18nStorageKey } from '@/lib/i18n'

describe('hobbies page', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(i18nStorageKey, 'pt-BR')
  })

  it('renders the hobby cards without the Steam profile link', () => {
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
    expect(screen.queryByRole('link', { name: /steamcommunity/i })).not.toBeInTheDocument()
    // "Jogos" aparece só no card de resumo; a seção de galerias foi retirada.
    expect(screen.getAllByRole('heading', { name: /^jogos$/i })).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /^leitura$/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /rpg de mesa/i })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /jogando agora/i })).not.toBeInTheDocument()
  })

  it('inserts a cartridge into the Pocket Arcade', () => {
    render(
      <MemoryRouter initialEntries={['/hobbies']}>
        <I18nProvider>
          <Routes>
            <Route path="/hobbies" element={<Hobbies />} />
          </Routes>
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByText('Escolha um cartucho')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /encaixar garden snake/i }))

    expect(screen.getByRole('button', { name: /ejetar garden snake/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /encaixar garden snake/i })).not.toBeInTheDocument()
    expect(screen.getByText(/espaço para jogar/i)).toBeInTheDocument()
  })

})
