import { useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { openSourceProjects, portfolioProjectsPath, PROJECTS_PER_PAGE } from '@/content/open-source'
import { useI18n } from '@/lib/i18n'
import { paginate } from '@/lib/pagination'
import { useLocalizedPath } from '@/lib/use-localized-path'

export default function Portfolio() {
  const { messages, t, format } = useI18n()
  const localizedPath = useLocalizedPath()
  const { hash, search } = useLocation()
  const [searchParams] = useSearchParams()
  const copy = messages.portfolio
  const projectsCopy = messages.openSource
  const pagination = paginate(openSourceProjects, Number(searchParams.get('page') ?? '1'), PROJECTS_PER_PAGE)

  // O router não rola até a âncora em navegação client-side; sem isso o
  // "voltar para o portfólio" (/portfolio#projects) cairia no topo da página.
  // `search` entra nas dependências para a troca de página também rolar.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash, search])

  return (
    <div>
      <section className="border-b border-[#1a1a1a] py-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{t('kicker.portfolio')}</p>
        <h1 className="my-3 max-w-5xl text-4xl font-extrabold leading-none tracking-[-0.055em] sm:text-5xl md:text-8xl">
          {copy.title}
        </h1>
        <p className="max-w-[720px] font-serif text-xl leading-8 text-[#1a1a1a]">
          {copy.description}
        </p>
      </section>

      <section className="grid grid-cols-1 border-b border-l border-[#1a1a1a] md:grid-cols-3" aria-label={copy.areasLabel}>
        {/* flex-col no card + mt-auto no stack: as linhas de tecnologia
            alinham no rodapé, independente do tamanho do resumo acima. */}
        {copy.projects.map((project) => (
          <article key={project.name} className="flex flex-col border-r border-t border-[#1a1a1a] bg-white p-6">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{project.kicker}</p>
            <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{project.name}</h2>
            <p className="mb-5 font-serif leading-7 text-[#1a1a1a]">{project.summary}</p>
            <p className="mt-auto font-mono text-xs uppercase leading-5 tracking-[0.08em] text-[#757575]">{project.stack}</p>
          </article>
        ))}
      </section>

      <section id="projects" className="mt-12 scroll-mt-8" aria-labelledby="portfolio-projects-title">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#1a1a1a] pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{projectsCopy.kicker}</p>
            <h2 id="portfolio-projects-title" className="mt-2 text-4xl font-extrabold leading-none tracking-[-0.045em]">
              {projectsCopy.title}
            </h2>
            <p className="mt-3 max-w-2xl font-serif leading-7">{projectsCopy.intro}</p>
          </div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#757575]">
            {openSourceProjects.length} {projectsCopy.countLabel}
          </p>
        </div>

        <ul className="grid grid-cols-1 border-l border-[#1a1a1a] md:grid-cols-2">
          {pagination.items.map((project) => (
            <li key={project.id} className="border-b border-r border-[#1a1a1a]">
              <Link
                to={localizedPath(`/projects/${project.id}`)}
                state={{ portfolioPage: pagination.currentPage }}
                className="group flex h-full flex-col bg-white p-6 transition-colors hover:bg-[#1a1a1a] hover:text-white"
              >
                <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#757575] group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]">
                  {project.year}
                </p>
                <h3 className="my-3 flex items-start justify-between gap-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]">
                  {project.name}
                  <ArrowUpRight aria-hidden="true" className="mt-1 size-6 shrink-0" />
                </h3>
                <p className="mb-5 font-serif leading-7">{projectsCopy.projects[project.id]}</p>
                <p className="mt-auto font-mono text-xs uppercase leading-5 tracking-[0.08em] text-[#757575] group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]">
                  {project.technologies.join(' / ')}
                </p>
              </Link>
            </li>
          ))}
        </ul>

        {/* Mesmo padrão de paginação do TIL e do blog. */}
        {pagination.totalPages > 1 && (
          <nav className="mt-8 flex flex-col gap-4 border-t border-[#1a1a1a] pt-5 font-mono text-xs uppercase tracking-[0.095em] text-[#1a1a1a] md:flex-row md:items-center md:justify-between" aria-label={t('portfolio.paginationLabel')}>
            <span className="text-center text-[#757575] md:text-left">{format('blog.pageStatus', { current: pagination.currentPage, total: pagination.totalPages })}</span>
            <div className="flex gap-3">
              {pagination.hasPreviousPage ? (
                <Link className="flex-1 border-2 border-[#1a1a1a] px-4 py-3 text-center transition-colors hover:bg-[#1a1a1a] hover:text-white md:flex-initial" to={localizedPath(portfolioProjectsPath(pagination.currentPage - 1))}>{t('blog.previousPage')}</Link>
              ) : (
                <span className="flex-1 border-2 border-[#e2e8f0] px-4 py-3 text-center text-[#999999] md:flex-initial">{t('blog.previousPage')}</span>
              )}
              {pagination.hasNextPage ? (
                <Link className="flex-1 border-2 border-[#1a1a1a] px-4 py-3 text-center transition-colors hover:bg-[#1a1a1a] hover:text-white md:flex-initial" to={localizedPath(portfolioProjectsPath(pagination.currentPage + 1))}>{t('blog.nextPage')}</Link>
              ) : (
                <span className="flex-1 border-2 border-[#e2e8f0] px-4 py-3 text-center text-[#999999] md:flex-initial">{t('blog.nextPage')}</span>
              )}
            </div>
          </nav>
        )}
      </section>

      {/* Mesmo padrão dos cards de projeto acima: o bloco inteiro é o link. */}
      <section className="mt-12 border border-[#1a1a1a]">
        <Link
          to={localizedPath('/about')}
          className="group grid gap-6 bg-white p-6 transition-colors hover:bg-[#1a1a1a] hover:text-white md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#757575] group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]">
              {copy.availability}
            </p>
            <h2 className="mt-3 text-4xl font-extrabold leading-none tracking-[-0.045em]">{copy.ctaTitle}</h2>
            <p className="mt-3 max-w-2xl font-serif leading-7">
              {copy.ctaText}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.095em]">
            {copy.ctaLink}
            <ArrowUpRight aria-hidden="true" className="size-6 shrink-0" />
          </span>
        </Link>
      </section>
    </div>
  )
}
