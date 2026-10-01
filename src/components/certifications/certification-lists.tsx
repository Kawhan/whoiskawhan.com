import { ArrowUpRight, ChevronRight, Code2, Trophy } from 'lucide-react'
import { certificationHighlights, certificationsByIssuer, type HighlightIcon } from '@/content/certifications'
import { technologyIcons } from '@/content/open-source'
import { useI18n } from '@/lib/i18n'

/** '2022-09' → 'set. 2022' / 'Sep 2022', no idioma da página. */
function formatIssuedAt(issuedAt: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' })
    .format(new Date(`${issuedAt}-15T12:00:00`))
    .replace(' de ', ' ')
}

function HighlightIconMark({ icon }: { icon: HighlightIcon }) {
  const className = 'size-12 shrink-0 transition-transform duration-150 group-hover:scale-105'
  if (icon === 'trophy') return <Trophy aria-hidden="true" strokeWidth={1.25} className={`${className} text-[#c8c2b8]`} />
  if (icon === 'code') return <Code2 aria-hidden="true" strokeWidth={1.25} className={`${className} text-[#c8c2b8]`} />
  return <img src={technologyIcons[icon]} alt="" aria-hidden="true" className={className} loading="lazy" />
}

const footerLink =
  'relative z-10 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] underline-offset-4 hover:underline'

/**
 * Destaques em cards: frase de contexto, ícone da linguagem à direita e o
 * card inteiro clicável (link esticado no título). Curso em partes não tem
 * link esticado — cada parte ganha o seu no rodapé.
 */
export function FeaturedCertifications() {
  const { messages, locale, format } = useI18n()

  return (
    <ul className="grid grid-cols-1 border-l border-[#1a1a1a] md:grid-cols-2 lg:grid-cols-3" aria-label={messages.about.certificationsFeatured}>
      {certificationHighlights.map((highlight) => {
        const [singleUrl] = highlight.urls.length === 1 ? highlight.urls : []
        return (
          <li
            key={highlight.id}
            className="group relative flex min-h-[280px] flex-col border-b border-r border-[#1a1a1a] bg-white p-8 transition-colors hover:bg-[#1a1a1a] hover:text-white"
          >
            <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#757575] group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]">
              {highlight.issuer} · {formatIssuedAt(highlight.issuedAt, locale)}
            </p>
            <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-[-0.04em]">
              {singleUrl ? (
                <a href={singleUrl} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
                  {highlight.name}
                </a>
              ) : (
                highlight.name
              )}
            </h3>
            <p className="mt-3 font-serif leading-7 text-[#5f5f5f] group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]">
              {messages.about.highlights[highlight.id]}
            </p>
            <div className="mt-auto flex items-end justify-between gap-4 pt-8">
              {singleUrl ? (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em]">
                  {messages.about.credential}
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </span>
              ) : (
                <span className="flex flex-wrap gap-4">
                  {highlight.urls.map((url, index) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer" className={footerLink}>
                      {format('about.certificationPart', { part: index + 1 })}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  ))}
                </span>
              )}
              <HighlightIconMark icon={highlight.icon} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/** Os demais, um grupo recolhível por emissor: 79 linhas abertas de uma vez viram parede. */
export function CertificationsByIssuer() {
  const { locale } = useI18n()

  return (
    <div className="border-t border-[#1a1a1a]">
      {certificationsByIssuer.map(([issuer, items]) => (
        <details key={issuer} className="group border-b border-[#1a1a1a]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-mono text-xs font-bold uppercase tracking-[0.095em] hover:text-[#057dbc] [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2">
              <ChevronRight aria-hidden="true" className="size-4 transition-transform group-open:rotate-90" />
              {issuer}
            </span>
            <span className="text-[#757575]">{items.length}</span>
          </summary>
          <ul className="pb-4">
            {items.map((certification) => (
              <li key={certification.url}>
                <a
                  href={certification.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid gap-1 border-t border-[#e2e8f0] py-3 pl-6 transition-colors hover:text-[#057dbc] sm:grid-cols-[1fr_auto] sm:gap-6"
                >
                  <span className="font-serif leading-6 underline-offset-4 hover:underline">{certification.name}</span>
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[#757575]">
                    {formatIssuedAt(certification.issuedAt, locale)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}
