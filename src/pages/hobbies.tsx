import { SEO } from '@/components/seo'
import { allTimeGames, nowPlaying, type Game } from '@/content/games'
import { getResponsiveGridClass } from '@/lib/posts'
import { useI18n } from '@/lib/i18n'
import { Gamepad2, Library, Users } from 'lucide-react'
import { useId, type ReactNode } from 'react'

/**
 * Agrupa o conteúdo de um hobby sob um título grande. Para adicionar outro
 * hobby (leitura, RPG), basta repetir o padrão com uma chave nova de locale.
 */
function HobbySection({ title, children }: { title: string; children: ReactNode }) {
  const headingId = useId()

  return (
    <section className="mt-16" aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="border-t-2 border-[#1a1a1a] pt-6 text-4xl font-extrabold leading-none tracking-[-0.05em] md:text-6xl"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function GameGallery({ title, games, coverAlt }: { title: string; games: Game[]; coverAlt: string }) {
  if (games.length === 0) return null

  return (
    <>
      <section className="mt-12 bg-black px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-white" aria-label={title}>
        {title}
      </section>
      <div className={`grid gap-4 border border-t-0 border-[#1a1a1a] p-4 ${getResponsiveGridClass(games.length)}`}>
        {games.map((game) => (
          <article key={game.title} className="border border-[#1a1a1a] bg-white p-4">
            {game.image && (
              <img src={game.image} alt={`${coverAlt} ${game.title}`} className="mb-5 aspect-square w-full object-cover" />
            )}
            {game.meta && (
              <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#757575]">{game.meta}</p>
            )}
            <h2 className="my-2 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{game.title}</h2>
          </article>
        ))}
      </div>
    </>
  )
}

export default function Hobbies() {
  const { messages, t } = useI18n()
  const copy = messages.hobbies

  return (
    <div>
      <SEO
        title="Hobbies"
        description={copy.seoDescription}
        path="/hobbies"
      />
      <section className="border-b border-[#1a1a1a] py-8">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{t('kicker.hobbies')}</p>
        <h1 className="my-3 max-w-5xl text-4xl font-extrabold leading-none tracking-[-0.055em] sm:text-5xl md:text-8xl">
          {copy.title}
        </h1>
        <p className="max-w-[760px] font-serif text-xl leading-8 text-[#1a1a1a]">
          {copy.description}
        </p>
      </section>

      <section className="grid grid-cols-1 border-b border-l border-[#1a1a1a] md:grid-cols-3">
        <article className="border-r border-t border-[#1a1a1a] p-6">
          <Gamepad2 className="mb-4 size-6" aria-hidden="true" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{copy.cards[0].kicker}</p>
          <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{copy.cards[0].title}</h2>
          <p className="font-serif leading-7">{copy.cards[0].text}</p>
          <p className="mt-3 font-serif leading-7">
            {copy.steamPrefix}{' '}
            <a className="text-[#057dbc] underline underline-offset-4" href="https://steamcommunity.com/profiles/76561198841570916/" target="_blank" rel="noopener noreferrer">steamcommunity.com/profiles/76561198841570916</a>.
          </p>
        </article>
        <article className="border-r border-t border-[#1a1a1a] p-6">
          <Library className="mb-4 size-6" aria-hidden="true" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{copy.cards[1].kicker}</p>
          <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{copy.cards[1].title}</h2>
          <p className="font-serif leading-7">{copy.cards[1].text}</p>
        </article>
        <article className="border-r border-t border-[#1a1a1a] p-6">
          <Users className="mb-4 size-6" aria-hidden="true" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{copy.cards[2].kicker}</p>
          <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{copy.cards[2].title}</h2>
          <p className="font-serif leading-7">{copy.cards[2].text}</p>
        </article>
      </section>

      <HobbySection title={copy.gamesTitle}>
        <GameGallery title={copy.nowPlayingTitle} games={nowPlaying} coverAlt={copy.coverAlt} />
        <GameGallery title={copy.allTimeTitle} games={allTimeGames} coverAlt={copy.coverAlt} />
      </HobbySection>
    </div>
  )
}
