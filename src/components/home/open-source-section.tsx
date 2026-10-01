import { featuredProjects, openSourceProjects } from '@/content/open-source'
import { useI18n } from '@/lib/i18n'
import { useLocalizedPath } from '@/lib/use-localized-path'
import { Link } from 'react-router'

function ProjectImagePlaceholder() {
  return (
    <div className="flex size-full items-center justify-center bg-bg text-soft" aria-hidden="true">
      <svg viewBox="0 0 46 46" fill="none" className="size-full">
        <rect x="10" y="12" width="26" height="20" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="19" r="3" fill="currentColor" />
        <path d="M12 30L21 23L27 28L32 24L36 30" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function OpenSourceSection() {
  const { messages } = useI18n()
  const localizedPath = useLocalizedPath()
  const copy = messages.openSource

  return (
    <section className="w-full border border-line bg-paper" aria-labelledby="open-source-title">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <h2 id="open-source-title" className="font-mono text-xs font-bold tracking-[0.0875em] text-ink">
            {copy.title.toUpperCase()}
          </h2>
        </div>
        <p className="font-mono text-[10px] font-bold tracking-[0.075em] text-soft">
          {openSourceProjects.length} {copy.countLabel} / {copy.repository.toUpperCase()}
        </p>
      </div>

      {/* Top rule */}
      <div className="h-px bg-line" />

      {/* Project cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {featuredProjects.map((project, index) => (
          <article
            key={project.id}
            className={`group relative min-h-[190px] border-line bg-paper p-6 transition-colors hover:bg-[#1a1a1a] ${
              index % 2 === 0 ? 'md:border-r' : ''
            } ${index < featuredProjects.length - 1 ? 'border-b' : ''} md:border-b`}
          >
            <div className="flex h-full items-start gap-5">
              {/* Mark */}
              <div className="size-[46px] shrink-0 border border-line bg-bg text-soft group-hover:border-[#c8c2b8] dark:group-hover:border-[#5c554d]">
                {project.logo ? (
                  <img src={project.logo} alt="" aria-hidden="true" className="size-full object-contain p-1" loading="lazy" />
                ) : (
                  <ProjectImagePlaceholder />
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col self-stretch">
                {/* Title */}
                <h3 className="font-display text-[29px] leading-[1.05] text-ink group-hover:text-white dark:group-hover:text-[var(--dark-bg)]">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="mt-3 mb-4 font-serif text-[17px] leading-[1.45] text-muted group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]">
                  {copy.projects[project.id]}
                </p>

                {/* Metadata rule */}
                <div className="mt-auto mb-4 h-px bg-hairline" />

                {/* Tags + Year */}
                <div className="flex min-h-6 items-center gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center border border-hairline bg-bg px-[7px] py-0.5 font-mono text-[9px] text-muted group-hover:bg-transparent group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-[10px] font-bold tracking-[0.0625em] text-accent group-hover:text-[#8EA0FF] dark:group-hover:text-[#5c554d]">
                    {project.year}
                  </span>
                </div>
              </div>
            </div>

            {/* Repo link */}
            <Link
              to={localizedPath(`/projects/${project.id}`)}
              className="absolute inset-0 project-card-link"
              aria-label={`${project.name} — ${copy.title}`}
              data-nav-item
            />
          </article>
        ))}

        {/* View all projects card */}
        <Link
          to={localizedPath('/portfolio#projects')}
          className="group relative flex items-start gap-5 border-line bg-paper p-6 transition-colors hover:bg-[#1a1a1a] md:col-span-2"
          data-nav-item
        >
          <div className="size-[46px] shrink-0 border border-line bg-bg flex items-center justify-center text-ink group-hover:border-[#c8c2b8] group-hover:bg-transparent group-hover:text-white dark:group-hover:border-[#5c554d] dark:group-hover:text-[var(--dark-bg)]">
            <svg viewBox="0 0 24 24" fill="none" className="size-[22px]">
              <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs font-bold tracking-[0.08em] text-accent uppercase group-hover:text-[#8EA0FF] dark:group-hover:text-[#5c554d]">
              {copy.viewAllKicker}
            </p>
            <h3 className="mt-1 font-display text-[29px] leading-[1.05] text-ink group-hover:text-white dark:group-hover:text-[var(--dark-bg)]">
              {copy.viewAllTitle}
            </h3>
            <p className="mt-3 font-serif text-[17px] leading-[1.45] text-muted group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]">
              {copy.intro}
            </p>
          </div>
        </Link>
      </div>
    </section>
  )
}
