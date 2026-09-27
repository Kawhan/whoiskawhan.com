import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { OpenSourceSection } from "@/components/home/open-source-section";
import { SEO } from "@/components/seo";
import { getPublishedPosts } from "@/lib/posts";
import { useI18n } from "@/lib/i18n";
import { useLocalizedPath } from "@/lib/use-localized-path";

const Home: React.FC = () => {
  const { locale, messages } = useI18n()
  const localizedPath = useLocalizedPath()
  const copy = messages.home
  const posts = getPublishedPosts(locale).slice(0, 3)
  const [featuredPost, ...secondaryPosts] = posts

  return (
    <div>
      <SEO />

      {/* ───── Hero Cover ───── */}
      <section className="border-b border-line md:grid md:grid-cols-[1fr_360px]">
        {/* Main column */}
        {/* Sem px próprio: o gutter já vem do <main> no layout. Um px aqui
            somaria ao dele e jogaria o texto 24px para a direita do navbar. */}
        <div className="flex flex-col justify-center gap-5 py-12 md:gap-[22px] md:py-[54px] md:pr-10 md:border-r border-line">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.09375em] text-accent">
            {copy.kicker}
          </p>
          {/* leading acima de 1: o Anton é alto e o português tem acento
              (ó, ã, ç). Com 0.94 o acento encostava na linha de cima. */}
          <h1 className="max-w-3xl font-display text-[2.5rem] leading-[1.06] sm:text-[3.5rem] md:text-[74px] text-ink">
            {copy.headline}
          </h1>
          <p className="max-w-[760px] font-serif text-xl leading-[1.22] text-muted md:text-2xl">
            {copy.intro}
          </p>
          <nav className="flex flex-wrap items-center gap-3" aria-label={copy.actionsLabel}>
            <Link
              to={localizedPath('/blog')}
              className="inline-flex items-center gap-2 border border-line px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.06875em] text-ink transition-colors hover:bg-line hover:text-bg dark:hover:bg-[var(--dark-text)] dark:hover:text-[var(--dark-bg)]"
            >
              {copy.readArticles}
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to={localizedPath('/portfolio')}
              className="inline-flex items-center border border-line px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.06875em] text-ink transition-colors hover:bg-line hover:text-bg dark:hover:bg-[var(--dark-text)] dark:hover:text-[var(--dark-bg)]"
            >
              {copy.seeProjects}
            </Link>
          </nav>
        </div>

        {/* "Agora" margin-note */}
        {/* No mobile: sem px próprio (o gutter vem do <main>) e sem padding
            superior, porque o pb do hero acima já dá o respiro. */}
        <aside className="flex items-center pb-12 md:py-[54px] md:pr-6 md:pl-8">
          <div className="w-full border border-line bg-paper p-[22px]">
            <h2 className="font-display text-[28px] leading-none text-ink sm:text-[34px]">{copy.nowTitle}</h2>
            <div className="mt-4 space-y-0">
              {copy.nowItems.map((item, i) => (
                <div
                  key={item}
                  className={`${i < copy.nowItems.length - 1 ? 'border-b border-hairline pb-3 mb-3' : ''}`}
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.08125em] text-accent">
                    {copy.nowLabels?.[i] ?? ''}
                  </p>
                  <p className="mt-1 font-serif text-base leading-[1.25] text-ink">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-[10px] tracking-[0.06875em] text-soft">
              {copy.nowUpdated}
            </p>
          </div>
        </aside>
      </section>

      {/* ───── Recent Writing ───── */}
      {/* Sem posts publicados, a seção inteira some (inclusive a barra). */}
      {featuredPost && (
      <section className="mt-0" aria-label={copy.latest}>
        {/* Graphite bar — mesma largura do hero e da grade de posts abaixo,
            para as bordas alinharem. */}
        <div className="flex items-center justify-between bg-graphite px-4 py-4 sm:px-5 md:h-[72px] md:px-6">
          <h2 className="font-display text-4xl leading-none text-white md:text-[40px]">
            {copy.latest}
          </h2>
          <p className="hidden font-mono text-[11px] tracking-[0.075em] text-[#C8C2B8] md:block">
            {copy.latestMeta}
          </p>
        </div>

        <div className="grid border-r border-b border-l border-line md:grid-cols-[1fr_420px]">
            {/* Featured article */}
            <div className="border-r border-line">
              <PostCard post={featuredPost} featured />
            </div>

            {/* Secondary articles */}
            <div className="flex flex-col">
              {secondaryPosts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}

              {/* "All articles" link card */}
              <Link
                to={localizedPath('/blog')}
                className="group flex flex-col gap-2 border-t border-line bg-paper p-[18px] md:p-[22px] transition-colors hover:bg-[#1a1a1a]"
                data-nav-item
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.06875em] text-accent group-hover:text-[#8EA0FF] dark:group-hover:text-[#5c554d]">
                  {copy.archive}
                </p>
                <h3 className="font-display text-[30px] leading-[0.95] text-ink group-hover:text-white dark:group-hover:text-[var(--dark-bg)]">
                  {copy.moreWriting}
                </h3>
                <p className="font-serif text-base leading-[1.12] text-muted group-hover:text-[#c8c2b8] dark:group-hover:text-[#5c554d]">
                  {locale === 'pt-BR'
                    ? 'A página completa com posts, ensaios e notas técnicas.'
                    : 'The full page with posts, essays, and technical notes.'}
                </p>
              </Link>
            </div>
          </div>
      </section>
      )}

      {/* ───── Open Source / Projetos ───── */}
      <section className="mt-16 mb-16">
        <OpenSourceSection />
      </section>
    </div>
  )
}

export default Home;
