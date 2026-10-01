import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import About from './about'
import Certificates from './certificates'
import { I18nProvider, i18nStorageKey } from '@/lib/i18n'
import { certifications, certificationsByIssuer, featuredCertifications } from '@/content/certifications'

describe('about certifications', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.localStorage.setItem(i18nStorageKey, 'pt-BR')
  })

  it('never publishes personal emails, weak links or duplicates', () => {
    for (const { url } of certifications) {
      expect(url).not.toMatch(/@|%40/)
      expect(url).not.toMatch(/prnt\.sc|drive\.google|linkedin\.com\/safety/)
    }
    const names = certifications.map(({ name }) => name.toLowerCase())
    expect(new Set(names).size).toBe(names.length)
  })

  it('shows only the highlights on About, linking to the full list', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <About />
        </I18nProvider>
      </MemoryRouter>,
    )

    const section = screen.getByRole('region', { name: 'Estudo registrado' })
    const highlights = within(section).getByRole('list', { name: 'Destaques' })
    // 6 cards, 7 links: as duas partes da USP dividem um card, com um link cada
    expect(within(highlights).getAllByRole('listitem')).toHaveLength(6)
    expect(within(highlights).getAllByRole('link')).toHaveLength(featuredCertifications.length)
    expect(within(highlights).getByRole('link', { name: /CS50x/ })).toHaveAttribute('href', expect.stringContaining('cs50.harvard.edu'))
    expect(within(highlights).getByText(/curso de ciência da computação de Harvard/)).toBeInTheDocument()
    expect(within(highlights).getByRole('link', { name: 'Parte 1' })).toHaveAttribute('href', expect.stringContaining('ZF5BLKXGALXQ'))
    expect(within(highlights).getByRole('link', { name: 'Parte 2' })).toHaveAttribute('href', expect.stringContaining('22MXQGBNNZ2V'))
    expect(section.querySelectorAll('details')).toHaveLength(0)
    expect(within(section).getByRole('link', { name: `Ver todos os ${certifications.length} certificados` })).toHaveAttribute('href', '/certificates')
  })

  it('lists every certificate on the certificates page, grouped by issuer', () => {
    render(
      <MemoryRouter initialEntries={['/certificates']}>
        <I18nProvider>
          <Certificates />
        </I18nProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Tudo o que estudei' })).toBeInTheDocument()
    expect(screen.getByText(`${certifications.length} CERTIFICADOS`)).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Destaques' })).getAllByRole('link')).toHaveLength(featuredCertifications.length)

    const groups = screen.getByRole('region', { name: 'Por plataforma' }).querySelectorAll('details')
    expect(groups).toHaveLength(certificationsByIssuer.length)
    const total = certificationsByIssuer.reduce((sum, [, items]) => sum + items.length, 0)
    expect(total + featuredCertifications.length).toBe(certifications.length)
    expect(screen.getByRole('link', { name: /voltar para o sobre/i })).toHaveAttribute('href', '/about')
  })
})
