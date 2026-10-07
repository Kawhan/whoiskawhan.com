import React from 'react'
import { Button } from '@/components/ui/button'

type State = { failed: boolean }

// Textos fixos aqui: o I18nProvider pode ser justamente o que falhou.
const messages = {
  'pt-BR': {
    title: 'Algo deu errado.',
    description: 'Não conseguimos carregar esta página. Tente recarregar ou volte para a home.',
    reload: 'Recarregar',
    back: 'Voltar para o início',
  },
  en: {
    title: 'Something went wrong.',
    description: "We couldn't load this page. Try reloading or head back home.",
    reload: 'Reload',
    back: 'Back to home',
  },
}

function detectLocale(): keyof typeof messages {
  return /^\/en(\/|$)/.test(window.location.pathname) ? 'en' : 'pt-BR'
}

// Sem isso, um erro de render desmonta a árvore inteira e sobra tela branca.
// Mesmo layout da 404, mas sem router, tema ou i18n.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children

    const locale = detectLocale()
    const t = messages[locale]

    return (
      <div className="flex min-h-screen flex-col bg-bg text-ink">
        <section className="flex flex-1 items-center justify-center">
          <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div className="mx-auto max-w-screen-sm text-center">
              <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-ink">:(</h1>
              <p className="mb-4 text-3xl tracking-tight font-bold text-ink md:text-4xl">{t.title}</p>
              <p className="mb-4 text-lg font-light text-muted">{t.description}</p>
              <div className="flex items-center justify-center gap-2">
                <Button variant="link" onClick={() => window.location.reload()}>
                  {t.reload}
                </Button>
                <Button variant="link" asChild>
                  <a href={locale === 'en' ? '/en' : '/'}>{t.back}</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
