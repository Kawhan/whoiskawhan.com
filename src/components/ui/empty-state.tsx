import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'

type EmptyStateProps = {
  icon: ReactNode
  kicker: string
  title: string
  text: string
  action: { to: string; label: string }
}

// Card estático (bg-white, sem hover) no mesmo padrão dos cards informativos;
// só o botão leva para outra página.
export function EmptyState({ icon, kicker, title, text, action }: EmptyStateProps) {
  return (
    <section className="mt-8 border border-[#1a1a1a] bg-white p-6 md:p-10" aria-label={title}>
      <div className="mb-4 size-6" aria-hidden="true">{icon}</div>
      <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#757575]">{kicker}</p>
      <h2 className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] md:text-4xl">{title}</h2>
      <p className="mb-6 max-w-2xl font-serif leading-7 text-[#1a1a1a]">{text}</p>
      <Link
        to={action.to}
        className="inline-flex items-center gap-2 border-2 border-[#1a1a1a] px-4 py-3 font-mono text-xs uppercase tracking-[0.095em] transition-colors hover:bg-[#1a1a1a] hover:text-white"
      >
        {action.label}
        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
      </Link>
    </section>
  )
}
