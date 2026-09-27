import { SEO } from '@/components/seo'
import { useI18n } from '@/lib/i18n'
import { Gamepad2, Library, Users } from 'lucide-react'

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
        <article className="border-r border-t border-[#1a1a1a] bg-white p-6">
          <Gamepad2 className="mb-4 size-6" aria-hidden="true" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{copy.cards[0].kicker}</p>
          <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{copy.cards[0].title}</h2>
          <p className="font-serif leading-7">{copy.cards[0].text}</p>
          <p className="mt-3 font-serif leading-7">
            {copy.steamPrefix}{' '}
            <a className="text-[#057dbc] underline underline-offset-4" href="https://steamcommunity.com/profiles/76561198841570916/" target="_blank" rel="noopener noreferrer">steamcommunity.com/profiles/76561198841570916</a>.
          </p>
        </article>
        <article className="border-r border-t border-[#1a1a1a] bg-white p-6">
          <Library className="mb-4 size-6" aria-hidden="true" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{copy.cards[1].kicker}</p>
          <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{copy.cards[1].title}</h2>
          <p className="font-serif leading-7">{copy.cards[1].text}</p>
        </article>
        <article className="border-r border-t border-[#1a1a1a] bg-white p-6">
          <Users className="mb-4 size-6" aria-hidden="true" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{copy.cards[2].kicker}</p>
          <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em]">{copy.cards[2].title}</h2>
          <p className="font-serif leading-7">{copy.cards[2].text}</p>
        </article>
      </section>
    </div>
  )
}
