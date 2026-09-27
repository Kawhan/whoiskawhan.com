import { Link, useParams } from 'react-router'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { SEO } from '@/components/seo'
import { openSourceProjects, technologyIcons, type OpenSourceProject } from '@/content/open-source'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/use-localized-path'

export default function Project() {
  const { id } = useParams()
  const { messages, t } = useI18n()
  const localizedPath = useLocalizedPath()
  const copy = messages.openSource

  const project = openSourceProjects.find((item) => item.id === id)

  if (!project) {
    return (
      <section className="mx-auto my-10 max-w-[720px] border border-[#1a1a1a] p-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">404</p>
        <h1 className="my-3 text-5xl font-extrabold leading-none tracking-[-0.055em]">{t('project.notFoundTitle')}</h1>
        <Link className="mt-4 inline-flex text-[#057dbc] underline underline-offset-4" to={localizedPath('/portfolio#projects')}>
          {t('project.back')}
        </Link>
      </section>
    )
  }

  const description = copy.projects[project.id as OpenSourceProject['id']]

  return (
    <div>
      <SEO
        title={project.name}
        description={description}
        path={localizedPath(`/projects/${project.id}`)}
        type="article"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareSourceCode',
          name: project.name,
          description,
          codeRepository: project.repo,
          programmingLanguage: project.technologies,
          dateCreated: project.year,
        }}
      />

      <section className="border-b border-[#1a1a1a] py-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">
          {copy.kicker} / {project.year}
        </p>
        <h1 className="my-3 max-w-5xl text-4xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl md:text-7xl">
          {project.name}
        </h1>
        <p className="max-w-[720px] font-serif text-xl leading-8 text-[#1a1a1a]">{description}</p>
      </section>

      <section className="mt-8 border-b border-[#1a1a1a] pb-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#757575]">{t('project.stack')}</p>
        <ul className="mt-4 flex flex-wrap gap-3">
          {project.technologies.map((tech) => (
            <li
              key={tech}
              className="inline-flex items-center gap-2 border border-[#1a1a1a] px-3 py-2 font-mono text-xs uppercase tracking-[0.06em]"
            >
              <img src={technologyIcons[tech]} alt="" aria-hidden="true" className="size-4" loading="lazy" />
              {tech}
            </li>
          ))}
        </ul>
      </section>

      <nav className="mt-8 flex flex-wrap items-center gap-3" aria-label={t('project.linksLabel')}>
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 border-2 border-[#1a1a1a] bg-[#1a1a1a] px-5 font-sans text-sm font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-white hover:text-[#1a1a1a]"
        >
          {copy.repository}
          <ExternalLink size={14} />
        </a>
        {project.docs !== project.repo && (
          <a
            href={project.docs}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 border-2 border-[#1a1a1a] px-5 font-sans text-sm font-extrabold uppercase tracking-[0.08em] transition-colors hover:bg-[#1a1a1a] hover:text-white"
          >
            {copy.docs}
            <ExternalLink size={14} />
          </a>
        )}
      </nav>

      <Link
        to={localizedPath('/portfolio#projects')}
        className="mt-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.095em] text-[#057dbc] underline underline-offset-4"
      >
        <ArrowLeft size={14} />
        {t('project.back')}
      </Link>
    </div>
  )
}
