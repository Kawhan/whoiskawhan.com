import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/**
 * Volta a rolagem para o topo a cada troca de página.
 *
 * O `BrowserRouter` não faz isso sozinho (o `<ScrollRestoration>` só existe
 * nos data routers), então sem este hook a página nova abria na altura em
 * que a anterior estava. Fica de fora:
 * - URL com âncora (#projects): a própria página rola até a seção;
 * - voltar/avançar do navegador (POP): o navegador restaura a posição.
 */
export function useScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (hash || navigationType === 'POP') return
    window.scrollTo(0, 0)
  }, [pathname, hash, navigationType])
}
