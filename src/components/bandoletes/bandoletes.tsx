import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import {
  Colony, drawColony, isNight, lifeStage, parseState, TICK_MS, WORLD_H, WORLD_W,
  type ColonyStats, type Genes, type LifeStage,
} from './colony'

const STORAGE_KEY = 'bandoletes:colony'
const SAVE_EVERY_MS = 5000
// Acima disso (px do mundo por ms), o ponteiro assusta em vez de fazer carinho.
const STARTLE_SPEED = 0.6
// Quanto tempo a colônia fica acordada depois que um visitante noturno chama.
const WAKE_MS = 2 * 60 * 1000

interface Card {
  id: number
  name: string
  stage: LifeStage
  generation: number
  hunger: number
  mood: number
  genes: Genes
}

interface Hud {
  stats: ColonyStats
  /** Dormindo agora. */
  night: boolean
  /** É noite no relógio, mas alguém acordou a colônia. */
  woken: boolean
  /** Fichinha do bichinho selecionado; 'gone' se ele morreu com a ficha aberta. */
  card: Card | 'gone' | null
}

/** Atualiza o sono da colônia pelo relógio, respeitando quem foi acordado. Devolve se é noite. */
function syncNight(colony: Colony, wakeUntil: number) {
  const night = isNight(new Date())
  colony.night = night && Date.now() > wakeUntil
  return night
}

function snapshot(colony: Colony, selectedId: number | null, nightHours = colony.night): Hud {
  const c = selectedId === null ? undefined : colony.creatures.find((o) => o.id === selectedId)
  const card: Hud['card'] = selectedId === null
    ? null
    : c
      ? { id: c.id, name: c.name, stage: lifeStage(c), generation: c.generation, hunger: c.hunger, mood: c.mood, genes: c.genes }
      : 'gone'
  return { stats: colony.stats(), night: colony.night, woken: nightHours && !colony.night, card }
}

function loadColony() {
  try {
    return new Colony(Math.random, parseState(window.localStorage.getItem(STORAGE_KEY)) ?? undefined)
  } catch {
    return new Colony()
  }
}

function saveColony(colony: Colony) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(colony.toJSON()))
  } catch {
    // Sem storage (aba anônima, bloqueio): a colônia só não sobrevive ao reload.
  }
}

export function Bandoletes() {
  const { messages } = useI18n()
  const copy = messages.hobbies.bandoletes

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const colonyRef = useRef<Colony | null>(null)
  const selectedRef = useRef<number | null>(null)
  const pointerRef = useRef<{ x: number; y: number; t: number } | null>(null)
  const wakeUntilRef = useRef(0)
  /** Texto da confirmação de "Nova colônia"; `null` quando não está perguntando. */
  const [confirming, setConfirming] = useState<string | null>(null)
  // `null` até o primeiro frame: no prerender ainda não existe colônia.
  const [hud, setHud] = useState<Hud | null>(null)
  const [visible, setVisible] = useState(false)
  const stats = hud?.stats

  // A colônia só nasce no navegador (o prerender não tem canvas nem storage).
  useEffect(() => {
    const colony = loadColony()
    syncNight(colony, 0)
    colonyRef.current = colony
    // Quem pediu menos movimento no sistema ganha uma colônia mais calma — e
    // a mudança vale na hora, sem recarregar.
    const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    const syncMotion = () => {
      colony.calm = motion?.matches ?? false
    }
    syncMotion()
    motion?.addEventListener('change', syncMotion)
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx) drawColony(ctx, colony)
    const save = () => saveColony(colony)
    window.addEventListener('pagehide', save)
    return () => {
      save()
      window.removeEventListener('pagehide', save)
      motion?.removeEventListener('change', syncMotion)
    }
  }, [])

  // Fora da tela, o aquário pausa: não gasta CPU de quem está lendo outra coisa.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let frame = 0
    let last = performance.now()
    let acc = 0
    let sinceSave = 0
    let sinceHud = Infinity
    const loop = (now: number) => {
      const colony = colonyRef.current
      const ctx = canvasRef.current?.getContext('2d')
      const dt = Math.min(now - last, 250)
      last = now
      if (colony && ctx) {
        acc += dt
        let ticked = false
        while (acc >= TICK_MS) {
          acc -= TICK_MS
          colony.tick()
          ticked = true
        }
        // A tela costuma rodar a 60–144 fps, mas a colônia só muda a 20:
        // redesenhar sem tick seria pintar a mesma imagem de novo.
        if (ticked) drawColony(ctx, colony, selectedRef.current)
        sinceHud += dt
        if (sinceHud > 500) {
          sinceHud = 0
          const nightHours = syncNight(colony, wakeUntilRef.current)
          setHud(snapshot(colony, selectedRef.current, nightHours))
        }
        sinceSave += dt
        if (sinceSave > SAVE_EVERY_MS) {
          sinceSave = 0
          saveColony(colony)
        }
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [visible])

  const toWorld = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * WORLD_W,
      y: ((e.clientY - rect.top) / rect.height) * WORLD_H,
    }
  }

  const select = (id: number | null) => {
    selectedRef.current = id
    const colony = colonyRef.current
    if (colony) setHud(snapshot(colony, id))
  }

  // Clique em cima de um bichinho abre a ficha; no vazio, joga comida.
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const colony = colonyRef.current
    if (!colony) return
    // À noite, cada toque acorda (ou mantém acordada) a colônia por um tempinho.
    if (isNight(new Date())) {
      wakeUntilRef.current = Date.now() + WAKE_MS
      if (colony.night) {
        colony.wake()
        setHud(snapshot(colony, selectedRef.current, true))
      }
    }
    const { x, y } = toWorld(e)
    const hit = colony.creatureAt(x, y)
    if (hit) select(hit.id)
    else colony.feed(x, y)
  }

  // Ponteiro devagar faz carinho; rápido demais, assusta.
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const colony = colonyRef.current
    if (!colony) return
    const { x, y } = toWorld(e)
    const prev = pointerRef.current
    const t = e.timeStamp
    pointerRef.current = { x, y, t }
    const speed = prev && t > prev.t ? Math.hypot(x - prev.x, y - prev.y) / (t - prev.t) : 0
    if (speed > STARTLE_SPEED) colony.startle(x, y)
    else colony.pet(x, y)
  }

  const restart = useCallback(() => {
    const colony = colonyRef.current
    if (!colony) return
    colony.seed()
    saveColony(colony)
    selectedRef.current = null
    setConfirming(null)
    setHud(snapshot(colony, null, isNight(new Date())))
  }, [])

  // Com a colônia viva, pergunta antes de apagar; o texto cita alguém pelo nome.
  const askRestart = () => {
    const colony = colonyRef.current
    if (!colony || colony.extinct) return restart()
    const [first] = colony.creatures
    const others = colony.creatures.length - 1
    setConfirming(others > 0
      ? copy.confirm.many.replace('{name}', first.name).replace('{count}', String(others))
      : copy.confirm.one.replace('{name}', first.name))
  }

  const moodLabel = !stats?.population
    ? '—'
    : stats.mood > 0.66 ? copy.moods.happy : stats.mood > 0.4 ? copy.moods.calm : copy.moods.sad
  const extinct = stats?.population === 0
  const show = (v: number | undefined) => (v === undefined ? '—' : String(v))

  return (
    <section aria-labelledby="bandoletes-title" className="border-t border-[#1a1a1a] py-10 dark:border-[var(--dark-border)]">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{copy.kicker}</p>
      <h2 id="bandoletes-title" className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] md:text-5xl">
        {copy.title}
      </h2>
      <p className="max-w-[640px] font-serif text-lg leading-7">{copy.description}</p>

      <div className="mt-8 border border-[#1a1a1a] bg-[#efece4] p-3 dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)] md:p-6">
        <div className="relative overflow-hidden border border-[#1a1a1a] bg-[#0b120d]">
          <canvas
            ref={canvasRef}
            width={WORLD_W}
            height={WORLD_H}
            role="img"
            aria-label={copy.canvasLabel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onContextMenu={(e) => e.preventDefault()}
            // `touch-pan-y`: no celular, arrastar o dedo na vertical ainda rola a página.
            className="block aspect-[16/9] w-full cursor-crosshair touch-pan-y select-none [image-rendering:pixelated]"
          />
          {extinct && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0b120d]/85 px-4 text-center font-mono text-xs uppercase tracking-[0.08em] text-[#8fe09c]">
              <p className="font-bold">{copy.extinct}</p>
              <button
                type="button"
                onClick={restart}
                className="border border-[#8fe09c] px-3 py-2 font-bold hover:bg-[#8fe09c] hover:text-[#0b120d]"
              >
                {copy.newColony}
              </button>
            </div>
          )}
          {(hud?.night || hud?.woken) && !extinct && (
            <p className="pointer-events-none absolute left-2 top-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#7f9cc4]">
              {hud.night ? copy.sleeping : copy.woken}
            </p>
          )}
        </div>

        <div className="mt-4 border border-[#1a1a1a] bg-white p-4 dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)]">
          <h3 className="font-mono text-xs font-bold uppercase tracking-[0.095em]">{copy.controlsTitle}</h3>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            {copy.controls.map(({ action, effect }) => (
              <div key={action}>
                <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.08em]">{action}</dt>
                <dd className="mt-1 font-serif leading-6">{effect}</dd>
              </div>
            ))}
          </dl>
        </div>

        {hud?.card && (
          <div className="mt-4 border border-[#1a1a1a] bg-white p-4 font-mono text-xs uppercase tracking-[0.08em] dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)]">
            {hud.card === 'gone' ? (
              <div className="flex items-center justify-between gap-3">
                <p>{copy.card.gone}</p>
                <button type="button" onClick={() => select(null)} className="font-bold underline">{copy.card.close}</button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold normal-case tracking-normal">{hud.card.name}</p>
                    <p className="text-[10px] text-[#1a1a1a]/70 dark:text-inherit">
                      {copy.card.stages[hud.card.stage]} · {copy.stats.generation} {hud.card.generation}
                    </p>
                  </div>
                  <button type="button" onClick={() => select(null)} className="font-bold underline">{copy.card.close}</button>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {([
                    [copy.card.hunger, hud.card.hunger],
                    [copy.stats.mood, hud.card.mood],
                    [copy.card.speed, (hud.card.genes.speed - 0.4) / 1.6],
                    [copy.card.sociability, hud.card.genes.sociability],
                    [copy.card.curiosity, hud.card.genes.curiosity],
                  ] as const).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[10px]">{label}</dt>
                      <dd className="mt-1 h-2 border border-[#1a1a1a] dark:border-[var(--dark-border)]">
                        <div className="h-full bg-[#1a1a1a] dark:bg-[#8fe09c]" style={{ width: `${Math.round(value * 100)}%` }} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </div>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-px border border-[#1a1a1a] bg-[#1a1a1a] font-mono text-xs uppercase tracking-[0.08em] dark:border-[var(--dark-border)] sm:grid-cols-4">
          {[
            [copy.stats.population, show(stats?.population)],
            [copy.stats.generation, show(stats?.generation)],
            [copy.stats.births, show(stats?.births)],
            [copy.stats.mood, moodLabel],
          ].map(([label, value]) => (
            <div key={label} className="bg-white p-3 dark:bg-[var(--dark-surface)]">
              <dt className="text-[10px] text-[#1a1a1a]/70 dark:text-inherit">{label}</dt>
              <dd className="mt-1 text-base font-bold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
          {confirming ? (
            <div role="alertdialog" aria-label={copy.newColony} className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.08em]">
              <p>{confirming}</p>
              <button
                type="button"
                onClick={restart}
                className="border border-[#1a1a1a] bg-[#1a1a1a] px-3 py-2 font-bold text-white dark:border-[var(--dark-border)]"
              >
                {copy.confirm.yes}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                className="border border-[#1a1a1a] bg-white px-3 py-2 font-bold dark:border-[var(--dark-border)] dark:bg-transparent"
              >
                {copy.confirm.no}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={askRestart}
              className="border border-[#1a1a1a] bg-white px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#1a1a1a] hover:text-white dark:border-[var(--dark-border)] dark:bg-transparent"
            >
              {copy.newColony}
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
