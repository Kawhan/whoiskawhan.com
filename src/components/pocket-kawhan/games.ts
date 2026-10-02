// Lógica pura dos jogos do Pocket Kawhan. Nada aqui conhece React:
// o console chama `tick` no ritmo de `tickMs`, repassa botões via `press`
// e pede para o jogo se desenhar num canvas de SCREEN_W x SCREEN_H.

export type Button = 'up' | 'down' | 'left' | 'right' | 'action'
export type GameId = 'block-tower' | 'grass-snake' | 'star-patrol' | 'sky-hopper'
export type Rand = () => number

export const SCREEN_W = 240
export const SCREEN_H = 180

export const LCD = {
  bg: '#0b120d',
  dim: '#1d3324',
  mid: '#3f7a4d',
  fg: '#8fe09c',
}

export interface Game {
  readonly score: number
  readonly over: boolean
  readonly tickMs: number
  /** Valores extras exibidos ao lado da tela (ex.: linhas, vidas). */
  stat(): { label: 'lines' | 'length' | 'lives' | 'pipes'; value: number }
  tick(held: ReadonlySet<Button>): void
  press(button: Button): void
  draw(ctx: CanvasRenderingContext2D): void
}

function clearScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = LCD.bg
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H)
}

/* ------------------------------------------------------------------ */
/* Block Tower                                                         */
/* ------------------------------------------------------------------ */

type Matrix = number[][]

const PIECES: Matrix[] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0, 0], [1, 1, 1]],
  [[0, 0, 1], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
]

const LINE_POINTS = [0, 100, 300, 500, 800]

export function rotate(m: Matrix): Matrix {
  return m[0].map((_, col) => m.map((row) => row[col]).reverse())
}

export class BlockTower implements Game {
  static readonly COLS = 10
  static readonly ROWS = 18

  board: number[][] = Array.from({ length: BlockTower.ROWS }, () => Array(BlockTower.COLS).fill(0))
  piece: { m: Matrix; x: number; y: number }
  next: Matrix
  score = 0
  lines = 0
  over = false
  private readonly rand: Rand

  constructor(rand: Rand = Math.random) {
    this.rand = rand
    this.next = this.randomPiece()
    this.piece = this.spawn()
  }

  get tickMs() {
    return Math.max(90, 520 - Math.floor(this.lines / 5) * 50)
  }

  stat() {
    return { label: 'lines' as const, value: this.lines }
  }

  private randomPiece() {
    return PIECES[Math.floor(this.rand() * PIECES.length)]
  }

  private spawn() {
    const m = this.next
    this.next = this.randomPiece()
    const piece = { m, x: Math.floor((BlockTower.COLS - m[0].length) / 2), y: 0 }
    if (this.collides(m, piece.x, piece.y)) this.over = true
    return piece
  }

  collides(m: Matrix, x: number, y: number) {
    return m.some((row, dy) =>
      row.some((cell, dx) => {
        if (!cell) return false
        const bx = x + dx
        const by = y + dy
        return bx < 0 || bx >= BlockTower.COLS || by >= BlockTower.ROWS || (by >= 0 && this.board[by][bx] !== 0)
      }),
    )
  }

  private lock() {
    const { m, x, y } = this.piece
    m.forEach((row, dy) => row.forEach((cell, dx) => {
      if (cell && y + dy >= 0) this.board[y + dy][x + dx] = 1
    }))
    const kept = this.board.filter((row) => row.some((c) => c === 0))
    const cleared = BlockTower.ROWS - kept.length
    while (kept.length < BlockTower.ROWS) kept.unshift(Array(BlockTower.COLS).fill(0))
    this.board = kept
    this.lines += cleared
    this.score += LINE_POINTS[cleared]
    this.piece = this.spawn()
  }

  private move(dx: number, dy: number) {
    const { m, x, y } = this.piece
    if (this.collides(m, x + dx, y + dy)) return false
    this.piece = { m, x: x + dx, y: y + dy }
    return true
  }

  tick() {
    if (this.over) return
    if (!this.move(0, 1)) this.lock()
  }

  press(button: Button) {
    if (this.over) return
    if (button === 'left') this.move(-1, 0)
    else if (button === 'right') this.move(1, 0)
    else if (button === 'down') {
      if (this.move(0, 1)) this.score += 1
      else this.lock()
    } else {
      const m = rotate(this.piece.m)
      // Wall kick simples: tenta no lugar e depois deslocando para os lados.
      for (const kick of [0, -1, 1, -2, 2]) {
        if (!this.collides(m, this.piece.x + kick, this.piece.y)) {
          this.piece = { m, x: this.piece.x + kick, y: this.piece.y }
          break
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    clearScreen(ctx)
    const cell = 9
    const ox = Math.floor((SCREEN_W - BlockTower.COLS * cell) / 2)
    const oy = Math.floor((SCREEN_H - BlockTower.ROWS * cell) / 2)
    ctx.strokeStyle = LCD.mid
    ctx.lineWidth = 1
    ctx.strokeRect(ox - 2.5, oy - 2.5, BlockTower.COLS * cell + 4, BlockTower.ROWS * cell + 4)

    const block = (bx: number, by: number, color: string, x0 = ox, y0 = oy) => {
      ctx.fillStyle = color
      ctx.fillRect(x0 + bx * cell + 1, y0 + by * cell + 1, cell - 2, cell - 2)
    }

    this.board.forEach((row, y) => row.forEach((c, x) => block(x, y, c ? LCD.mid : LCD.dim)))
    if (!this.over) {
      const { m, x, y } = this.piece
      m.forEach((row, dy) => row.forEach((c, dx) => c && y + dy >= 0 && block(x + dx, y + dy, LCD.fg)))
    }

    const nx = ox + BlockTower.COLS * cell + 18
    this.next.forEach((row, dy) => row.forEach((c, dx) => c && block(dx, dy, LCD.mid, nx, oy + 12)))
  }
}

/* ------------------------------------------------------------------ */
/* Grass Snake                                                         */
/* ------------------------------------------------------------------ */

type Point = { x: number; y: number }

const DIRS: Record<Exclude<Button, 'action'>, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

export class GrassSnake implements Game {
  static readonly COLS = 24
  static readonly ROWS = 18

  body: Point[] = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }]
  dir: Point = DIRS.right
  private queued: Point[] = []
  food: Point
  score = 0
  over = false
  private readonly rand: Rand

  constructor(rand: Rand = Math.random) {
    this.rand = rand
    this.food = this.placeFood()
  }

  get tickMs() {
    return Math.max(60, 150 - this.body.length * 2)
  }

  stat() {
    return { label: 'length' as const, value: this.body.length }
  }

  private placeFood(): Point {
    const free: Point[] = []
    for (let y = 0; y < GrassSnake.ROWS; y++) {
      for (let x = 0; x < GrassSnake.COLS; x++) {
        if (!this.body.some((p) => p.x === x && p.y === y)) free.push({ x, y })
      }
    }
    return free[Math.floor(this.rand() * free.length)] ?? { x: -1, y: -1 }
  }

  press(button: Button) {
    if (button === 'action' || this.over) return
    const next = DIRS[button]
    const last = this.queued[this.queued.length - 1] ?? this.dir
    // Ignora meia-volta e repetições; guarda até duas curvas por tick.
    if (next.x === -last.x && next.y === -last.y) return
    if (next === last || this.queued.length >= 2) return
    this.queued.push(next)
  }

  tick() {
    if (this.over) return
    this.dir = this.queued.shift() ?? this.dir
    const head = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y }
    const eats = head.x === this.food.x && head.y === this.food.y
    const body = eats ? this.body : this.body.slice(0, -1)
    const hitsWall = head.x < 0 || head.y < 0 || head.x >= GrassSnake.COLS || head.y >= GrassSnake.ROWS
    if (hitsWall || body.some((p) => p.x === head.x && p.y === head.y)) {
      this.over = true
      return
    }
    this.body = [head, ...body]
    if (eats) {
      this.score += 10
      this.food = this.placeFood()
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    clearScreen(ctx)
    const cell = 9
    const ox = Math.floor((SCREEN_W - GrassSnake.COLS * cell) / 2)
    const oy = Math.floor((SCREEN_H - GrassSnake.ROWS * cell) / 2)
    ctx.strokeStyle = LCD.mid
    ctx.strokeRect(ox - 2.5, oy - 2.5, GrassSnake.COLS * cell + 4, GrassSnake.ROWS * cell + 4)

    ctx.fillStyle = LCD.fg
    ctx.fillRect(ox + this.food.x * cell + 2, oy + this.food.y * cell + 2, cell - 4, cell - 4)
    this.body.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? LCD.fg : LCD.mid
      ctx.fillRect(ox + p.x * cell + 1, oy + p.y * cell + 1, cell - 2, cell - 2)
    })
  }
}

/* ------------------------------------------------------------------ */
/* Star Patrol                                                         */
/* ------------------------------------------------------------------ */

type Box = { x: number; y: number; w: number; h: number }

const hit = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

const ALIEN = { w: 12, h: 8, gapX: 20, gapY: 14, cols: 8, rows: 4 }
const PLAYER = { w: 14, h: 6, y: SCREEN_H - 14 }

export class StarPatrol implements Game {
  readonly tickMs = 30

  playerX = SCREEN_W / 2 - PLAYER.w / 2
  aliens: Box[] = []
  shot: Box | null = null
  bombs: Box[] = []
  formationDir = 1
  stepCounter = 0
  wave = 0
  lives = 3
  score = 0
  over = false
  private readonly rand: Rand

  constructor(rand: Rand = Math.random) {
    this.rand = rand
    this.spawnWave()
  }

  stat() {
    return { label: 'lives' as const, value: this.lives }
  }

  private spawnWave() {
    this.wave += 1
    this.formationDir = 1
    this.aliens = []
    const ox = (SCREEN_W - (ALIEN.cols - 1) * ALIEN.gapX - ALIEN.w) / 2
    for (let r = 0; r < ALIEN.rows; r++) {
      for (let c = 0; c < ALIEN.cols; c++) {
        this.aliens.push({ x: ox + c * ALIEN.gapX, y: 14 + r * ALIEN.gapY, w: ALIEN.w, h: ALIEN.h })
      }
    }
  }

  /** Quanto menos aliens, mais rápido a formação anda. */
  private get stepEvery() {
    return Math.max(2, Math.ceil(this.aliens.length / 2.5) - this.wave)
  }

  press(button: Button) {
    if (this.over || button !== 'action' || this.shot) return
    this.shot = { x: this.playerX + PLAYER.w / 2 - 1, y: PLAYER.y - 4, w: 2, h: 5 }
  }

  tick(held: ReadonlySet<Button>) {
    if (this.over) return
    if (held.has('left')) this.playerX = Math.max(2, this.playerX - 3)
    if (held.has('right')) this.playerX = Math.min(SCREEN_W - PLAYER.w - 2, this.playerX + 3)

    if (this.shot) {
      this.shot.y -= 6
      const target = this.aliens.findIndex((a) => hit(a, this.shot!))
      if (target >= 0) {
        this.aliens.splice(target, 1)
        this.score += 10 * this.wave
        this.shot = null
      } else if (this.shot.y < 0) this.shot = null
    }

    this.stepCounter += 1
    if (this.stepCounter >= this.stepEvery) {
      this.stepCounter = 0
      const edge = this.aliens.some((a) =>
        this.formationDir > 0 ? a.x + a.w + 4 > SCREEN_W - 2 : a.x - 4 < 2,
      )
      if (edge) {
        this.formationDir *= -1
        this.aliens.forEach((a) => { a.y += 6 })
      } else {
        this.aliens.forEach((a) => { a.x += 4 * this.formationDir })
      }
    }

    if (this.aliens.length && this.rand() < 0.02 + this.wave * 0.005) {
      const shooter = this.aliens[Math.floor(this.rand() * this.aliens.length)]
      this.bombs.push({ x: shooter.x + ALIEN.w / 2 - 1, y: shooter.y + ALIEN.h, w: 2, h: 4 })
    }

    const player = { x: this.playerX, y: PLAYER.y, w: PLAYER.w, h: PLAYER.h }
    this.bombs = this.bombs.filter((b) => {
      b.y += 3
      if (hit(b, player)) {
        this.lives -= 1
        return false
      }
      return b.y < SCREEN_H
    })

    if (this.lives <= 0 || this.aliens.some((a) => a.y + a.h >= PLAYER.y)) {
      this.lives = Math.max(0, this.lives)
      this.over = true
      return
    }
    if (this.aliens.length === 0) {
      this.bombs = []
      this.spawnWave()
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    clearScreen(ctx)
    ctx.fillStyle = LCD.dim
    ctx.fillRect(0, SCREEN_H - 5, SCREEN_W, 1)

    ctx.fillStyle = LCD.mid
    for (const a of this.aliens) {
      ctx.fillRect(a.x + 2, a.y, a.w - 4, 2)
      ctx.fillRect(a.x, a.y + 2, a.w, 3)
      ctx.fillRect(a.x, a.y + 5, 2, 3)
      ctx.fillRect(a.x + a.w - 2, a.y + 5, 2, 3)
    }

    ctx.fillStyle = LCD.fg
    ctx.fillRect(this.playerX, PLAYER.y + 2, PLAYER.w, PLAYER.h - 2)
    ctx.fillRect(this.playerX + PLAYER.w / 2 - 1, PLAYER.y, 2, 2)
    if (this.shot) ctx.fillRect(this.shot.x, this.shot.y, this.shot.w, this.shot.h)
    for (const b of this.bombs) ctx.fillRect(b.x, b.y, b.w, b.h)
  }
}

/* ------------------------------------------------------------------ */
/* Sky Hopper                                                          */
/* ------------------------------------------------------------------ */

const BIRD = { x: 56, size: 7 }
const PIPE = { w: 18, gap: 54, every: 84, speed: 1.6 }
const GROUND = SCREEN_H - 8

export class SkyHopper implements Game {
  readonly tickMs = 16

  birdY = SCREEN_H / 2
  vy = 0
  pipes: { x: number; gapY: number; passed: boolean }[] = []
  ticks = 0
  score = 0
  over = false
  private readonly rand: Rand

  constructor(rand: Rand = Math.random) {
    this.rand = rand
  }

  stat() {
    return { label: 'pipes' as const, value: this.score }
  }

  press(button: Button) {
    if (this.over || (button !== 'action' && button !== 'up')) return
    this.vy = -3.1
  }

  tick() {
    if (this.over) return
    this.vy = Math.min(this.vy + 0.22, 4)
    this.birdY += this.vy

    this.ticks += 1
    if (this.ticks % PIPE.every === 1) {
      const gapY = 18 + this.rand() * (GROUND - PIPE.gap - 36)
      this.pipes.push({ x: SCREEN_W, gapY, passed: false })
    }

    const bird = { x: BIRD.x, y: this.birdY, w: BIRD.size, h: BIRD.size }
    for (const pipe of this.pipes) {
      pipe.x -= PIPE.speed
      if (!pipe.passed && pipe.x + PIPE.w < BIRD.x) {
        pipe.passed = true
        this.score += 1
      }
      const top = { x: pipe.x, y: 0, w: PIPE.w, h: pipe.gapY }
      const bottom = { x: pipe.x, y: pipe.gapY + PIPE.gap, w: PIPE.w, h: SCREEN_H }
      if (hit(bird, top) || hit(bird, bottom)) this.over = true
    }
    this.pipes = this.pipes.filter((p) => p.x + PIPE.w > 0)

    if (this.birdY < 0 || this.birdY + BIRD.size > GROUND) this.over = true
  }

  draw(ctx: CanvasRenderingContext2D) {
    clearScreen(ctx)
    ctx.fillStyle = LCD.dim
    ctx.fillRect(0, GROUND, SCREEN_W, SCREEN_H - GROUND)

    ctx.fillStyle = LCD.mid
    for (const p of this.pipes) {
      ctx.fillRect(p.x, 0, PIPE.w, p.gapY)
      ctx.fillRect(p.x - 2, p.gapY - 5, PIPE.w + 4, 5)
      ctx.fillRect(p.x, p.gapY + PIPE.gap, PIPE.w, GROUND - p.gapY - PIPE.gap)
      ctx.fillRect(p.x - 2, p.gapY + PIPE.gap, PIPE.w + 4, 5)
    }

    ctx.fillStyle = LCD.fg
    ctx.fillRect(BIRD.x, this.birdY, BIRD.size, BIRD.size)
    ctx.fillStyle = LCD.bg
    ctx.fillRect(BIRD.x + 4, this.birdY + 1, 2, 2)
  }
}

export function createGame(id: GameId, rand: Rand = Math.random): Game {
  if (id === 'block-tower') return new BlockTower(rand)
  if (id === 'grass-snake') return new GrassSnake(rand)
  if (id === 'sky-hopper') return new SkyHopper(rand)
  return new StarPatrol(rand)
}
