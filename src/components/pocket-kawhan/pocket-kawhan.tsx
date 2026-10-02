import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { CartridgeArt } from './cartridge-art'
import { createGame, SCREEN_H, SCREEN_W, type Button, type Game, type GameId } from './games'

const GAME_IDS: GameId[] = ['block-tower', 'grass-snake', 'star-patrol', 'sky-hopper', 'wall-smash', 'blast-maze', 'rock-storm']

// Onde cada cartucho "descansa" na mesa em telas md+ (no mobile viram uma fileira):
// duas colunas ao lado do console, com leve zigue-zague e inclinação para parecer solto.
const CART_POSITION: Record<GameId, string> = {
  'block-tower': 'md:left-[4%] md:top-[3%] md:-rotate-6',
  'blast-maze': 'md:left-[9%] md:top-[27%] md:rotate-3',
  'star-patrol': 'md:left-[4%] md:top-[51%] md:-rotate-3',
  'rock-storm': 'md:left-[9%] md:top-[75%] md:rotate-2',
  'wall-smash': 'md:right-[6%] md:top-[10%] md:rotate-6',
  'grass-snake': 'md:right-[10%] md:top-[38%] md:-rotate-2',
  'sky-hopper': 'md:right-[5%] md:top-[66%] md:rotate-3',
}

const KEY_TO_BUTTON: Record<string, Button> = {
  w: 'up', arrowup: 'up',
  s: 'down', arrowdown: 'down',
  a: 'left', arrowleft: 'left',
  d: 'right', arrowright: 'right',
  ' ': 'action', enter: 'action',
}

type Status = 'idle' | 'running' | 'over'

const bestKey = (id: GameId) => `pocket-kawhan:best:${id}`

function readBest(id: GameId) {
  try {
    return Number(window.localStorage.getItem(bestKey(id))) || 0
  } catch {
    return 0
  }
}

function writeBest(id: GameId, score: number) {
  try {
    window.localStorage.setItem(bestKey(id), String(score))
  } catch {
    // Sem storage (aba anônima, bloqueio): o recorde só não persiste.
  }
}

export function PocketKawhan() {
  const { messages } = useI18n()
  const copy = messages.hobbies.arcade

  const [inserted, setInserted] = useState<GameId | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [hud, setHud] = useState<{ score: number; stat: number; best: number; label: ReturnType<Game['stat']>['label']; badge: string }>({
    score: 0, stat: 0, best: 0, label: 'lines', badge: '',
  })

  const consoleRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameRef = useRef<Game | null>(null)
  const heldRef = useRef(new Set<Button>())

  const syncHud = useCallback((game: Game, id: GameId) => {
    setHud((prev) => {
      const stat = game.stat().value
      const badge = game.badge?.() ?? ''
      if (prev.score === game.score && prev.stat === stat && prev.badge === badge) return prev
      return { ...prev, score: game.score, stat, badge, best: Math.max(prev.best, game.score, readBest(id)) }
    })
  }, [])

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (ctx && gameRef.current) gameRef.current.draw(ctx)
  }, [])

  const boot = useCallback((id: GameId) => {
    const game = createGame(id)
    gameRef.current = game
    heldRef.current.clear()
    const { label, value } = game.stat()
    setHud({ score: 0, stat: value, best: readBest(id), label, badge: game.badge?.() ?? '' })
    draw()
  }, [draw])

  const insert = (id: GameId) => {
    setInserted(id)
    setStatus('idle')
    boot(id)
    consoleRef.current?.focus({ preventScroll: true })
  }

  const eject = () => {
    setInserted(null)
    setStatus('idle')
    gameRef.current = null
  }

  // Loop do jogo: acumula tempo e chama `tick` no ritmo que cada jogo pede.
  useEffect(() => {
    if (status !== 'running' || !inserted) return
    let frame = 0
    let last = performance.now()
    let acc = 0
    const loop = (now: number) => {
      const game = gameRef.current
      if (!game) return
      acc += Math.min(now - last, 250)
      last = now
      while (acc >= game.tickMs && !game.over) {
        acc -= game.tickMs
        game.tick(heldRef.current)
      }
      draw()
      syncHud(game, inserted)
      if (game.over) {
        if (game.score > readBest(inserted)) writeBest(inserted, game.score)
        setStatus('over')
        return
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [status, inserted, draw, syncHud])

  const press = (button: Button) => {
    if (!inserted) return
    if (status === 'running') {
      gameRef.current?.press(button)
      draw()
      return
    }
    if (button !== 'action') return
    if (status === 'over') boot(inserted)
    setStatus('running')
  }

  const hold = (button: Button) => {
    heldRef.current.add(button)
    press(button)
  }
  const release = (button: Button) => heldRef.current.delete(button)

  const onKeyDown = (event: React.KeyboardEvent) => {
    const button = KEY_TO_BUTTON[event.key.toLowerCase()]
    if (!button) return
    event.preventDefault()
    if (event.repeat) return
    hold(button)
  }
  const onKeyUp = (event: React.KeyboardEvent) => {
    const button = KEY_TO_BUTTON[event.key.toLowerCase()]
    if (button) release(button)
  }

  const game = inserted ? copy.games[inserted] : null
  const loose = GAME_IDS.filter((id) => id !== inserted)

  return (
    <section aria-labelledby="pocket-kawhan-title" className="py-10">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.095em] text-[#1a1a1a]">{copy.kicker}</p>
      <h2 id="pocket-kawhan-title" className="my-3 text-3xl font-extrabold leading-tight tracking-[-0.04em] md:text-5xl">
        {copy.title}
      </h2>
      <p className="max-w-[640px] font-serif text-lg leading-7">{copy.description}</p>

      <div className="relative mt-8 flex flex-col items-center gap-8 overflow-hidden border border-[#1a1a1a] bg-[#efece4] px-4 dark:border-[var(--dark-border)] dark:bg-[var(--dark-surface)] py-10 md:min-h-[680px] md:justify-center">
        {/* Console */}
        <div
          ref={consoleRef}
          tabIndex={0}
          role="application"
          aria-label={copy.consoleLabel}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          onBlur={() => heldRef.current.clear()}
          // Segurar um botão no celular não pode abrir seleção de texto nem menu de contexto.
          onContextMenu={(e) => e.preventDefault()}
          className="relative mt-6 touch-manipulation select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [-webkit-user-select:none] w-full max-w-[300px] rounded-[28px] bg-[#1f2a44] p-4 pb-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.08)] outline-none focus-visible:ring-4 focus-visible:ring-[#263CFF]/60"
        >
          {/* Slot de cartucho */}
          <div className="absolute -top-6 left-1/2 h-8 w-24 -translate-x-1/2 rounded-t-lg bg-[#151d31]">
            {inserted && (
              <button
                type="button"
                onClick={eject}
                aria-label={`${copy.eject} ${copy.games[inserted].name}`}
                title={copy.eject}
                className="pocket-kawhan-insert absolute inset-x-2 -top-3 h-9 overflow-hidden rounded-t-md border-2 border-b-0 border-[#151d31] bg-[#1f2a44]"
              >
                <CartridgeArt id={inserted} />
              </button>
            )}
          </div>

          {/* Tela */}
          <div className="rounded-2xl bg-[#121a2c] p-3 shadow-[inset_0_2px_6px_rgba(0,0,0,0.6)]">
            <div className="relative overflow-hidden rounded-md bg-[#0b120d] font-mono text-[#8fe09c]">
              <div className="flex items-center justify-between px-2 pt-2 text-[10px] font-bold uppercase tracking-[0.08em]">
                <span>{game ? game.name : 'Pocket Kawhan'}</span>
                <span aria-live="off">{String(hud.score).padStart(5, '0')}</span>
              </div>
              <canvas
                ref={canvasRef}
                width={SCREEN_W}
                height={SCREEN_H}
                className="block aspect-[4/3] w-full [image-rendering:pixelated]"
              />
              {game && (
                <div className="flex justify-between px-2 pb-2 text-[9px] uppercase tracking-[0.08em] text-[#3f7a4d]">
                  <span>{copy.stats[hud.label]} {hud.stat}</span>
                  {hud.badge && <span>{hud.badge}</span>}
                  <span>{copy.best} {String(hud.best).padStart(5, '0')}</span>
                </div>
              )}

              {status !== 'running' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0b120d]/80 px-4 text-center text-[11px] uppercase tracking-[0.08em]">
                  {!game && <p>{copy.insertPrompt}</p>}
                  {game && status === 'idle' && (
                    <>
                      <p className="font-bold">{game.name}</p>
                      <p className="text-[#3f7a4d]">{game.hint}</p>
                      <p className="animate-pulse">{copy.start}</p>
                    </>
                  )}
                  {game && status === 'over' && (
                    <>
                      <p className="font-bold">{copy.gameOver}</p>
                      <p>{String(hud.score).padStart(5, '0')}</p>
                      <p className="animate-pulse">{copy.restart}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between px-1 font-mono text-[#8f9cbc]">
            <span className="text-[11px] font-bold italic tracking-[0.04em] text-[#e4e9f5]">
              POCKET <span className="text-[8px] not-italic tracking-[0.15em]">KAWHAN</span>
            </span>
            <span className="text-[8px] tracking-[0.15em]">PK-01</span>
          </div>

          {/* Controles */}
          <div className="mt-6 flex items-center justify-between px-2">
            <div className="grid grid-cols-3 grid-rows-3 gap-0.5" aria-label={copy.controlsLabel} role="group">
              {([
                ['up', 'W', 'col-start-2 row-start-1'],
                ['left', 'A', 'col-start-1 row-start-2'],
                ['right', 'D', 'col-start-3 row-start-2'],
                ['down', 'S', 'col-start-2 row-start-3'],
              ] as const).map(([button, label, place]) => (
                <PadButton key={button} label={label} className={place} onHold={() => hold(button)} onRelease={() => release(button)} />
              ))}
              <span className="col-start-2 row-start-2 size-9 bg-[#1a2440]" />
            </div>
            <button
              type="button"
              aria-label={copy.actionLabel}
              onPointerDown={(e) => { e.preventDefault(); hold('action') }}
              onPointerUp={() => release('action')}
              onPointerLeave={() => release('action')}
              className="flex size-14 touch-none items-center justify-center rounded-2xl bg-[#263CFF] shadow-[0_5px_0_#1424a8,inset_0_2px_0_rgba(255,255,255,0.25)] transition-transform active:translate-y-1 active:shadow-[0_1px_0_#1424a8]"
            >
              <span className="h-1 w-5 rounded-full bg-[#c9d0ff]" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-between px-1">
            <span className="font-mono text-[7px] tracking-[0.2em] text-[#6d7a99]">WHOISKAWHAN</span>
            <span className="grid grid-cols-6 gap-1" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => <span key={i} className="size-1 rounded-full bg-[#0f1626]" />)}
            </span>
          </div>
        </div>

        {/* Cartuchos soltos na mesa */}
        <ul className="flex flex-wrap justify-center gap-6 md:contents">
          {loose.map((id) => (
            <li key={id} className={cn('md:absolute', CART_POSITION[id])}>
              <button
                type="button"
                onClick={() => insert(id)}
                aria-label={`${copy.insert} ${copy.games[id].name}`}
                className="group block w-24 rounded-xl bg-[#1f2a44] p-1.5 pb-4 shadow-[0_14px_24px_-10px_rgba(0,0,0,0.6)] transition-transform hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#263CFF]/60 md:w-28"
              >
                <span className="block overflow-hidden rounded-md">
                  <CartridgeArt id={id} />
                </span>
                <span className="mt-1.5 flex justify-center gap-[2px]" aria-hidden="true">
                  {Array.from({ length: 10 }, (_, i) => <span key={i} className="h-2 w-1 bg-[#c9a227]" />)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function PadButton({ label, className, onHold, onRelease }: {
  label: string
  className: string
  onHold: () => void
  onRelease: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(e) => { e.preventDefault(); onHold() }}
      onPointerUp={onRelease}
      onPointerLeave={onRelease}
      className={cn(
        'flex size-9 touch-none items-center justify-center rounded-md bg-[#2b3a5c] font-mono text-[11px] font-bold text-[#d3dbef] shadow-[0_3px_0_#0f1626] active:translate-y-0.5 active:shadow-none',
        className,
      )}
    >
      {label}
    </button>
  )
}
