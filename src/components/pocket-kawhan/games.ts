// Lógica pura dos jogos do Pocket Kawhan. Nada aqui conhece React:
// o console chama `tick` no ritmo de `tickMs`, repassa botões via `press`
// e pede para o jogo se desenhar num canvas de SCREEN_W x SCREEN_H.

export type Button = 'up' | 'down' | 'left' | 'right' | 'action'
export type GameId = 'block-tower' | 'grass-snake' | 'star-patrol' | 'sky-hopper' | 'wall-smash' | 'blast-maze' | 'rock-storm'
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
  /** Texto curto extra para o HUD (ex.: power-ups). */
  badge?(): string
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

/* ------------------------------------------------------------------ */
/* Wall Smash                                                          */
/* ------------------------------------------------------------------ */

const PADDLE = { w: 36, h: 4, y: SCREEN_H - 12, speed: 4 }
const BALL = 4
const WALL = { cols: 10, rows: 5, w: 21, h: 7, gap: 2, top: 18 }

export class WallSmash implements Game {
  readonly tickMs = 16

  paddleX = (SCREEN_W - PADDLE.w) / 2
  ball = { x: 0, y: 0, vx: 0, vy: 0 }
  /** Bola presa na raquete até o jogador lançar. */
  stuck = true
  bricks: Box[] = []
  speed = 2.4
  lives = 3
  score = 0
  over = false

  constructor() {
    this.buildWall()
    this.resetBall()
  }

  stat() {
    return { label: 'lives' as const, value: this.lives }
  }

  private buildWall() {
    const width = WALL.cols * (WALL.w + WALL.gap) - WALL.gap
    const ox = (SCREEN_W - width) / 2
    this.bricks = []
    for (let r = 0; r < WALL.rows; r++) {
      for (let c = 0; c < WALL.cols; c++) {
        this.bricks.push({ x: ox + c * (WALL.w + WALL.gap), y: WALL.top + r * (WALL.h + WALL.gap), w: WALL.w, h: WALL.h })
      }
    }
  }

  private resetBall() {
    this.stuck = true
    this.ball = { x: this.paddleX + PADDLE.w / 2 - BALL / 2, y: PADDLE.y - BALL, vx: 0, vy: 0 }
  }

  press(button: Button) {
    if (this.over || !this.stuck || (button !== 'action' && button !== 'up')) return
    this.stuck = false
    this.ball.vx = this.speed * 0.6
    this.ball.vy = -this.speed
  }

  tick(held: ReadonlySet<Button>) {
    if (this.over) return
    if (held.has('left')) this.paddleX = Math.max(0, this.paddleX - PADDLE.speed)
    if (held.has('right')) this.paddleX = Math.min(SCREEN_W - PADDLE.w, this.paddleX + PADDLE.speed)

    const b = this.ball
    if (this.stuck) {
      b.x = this.paddleX + PADDLE.w / 2 - BALL / 2
      return
    }

    b.x += b.vx
    b.y += b.vy
    if (b.x < 0 || b.x + BALL > SCREEN_W) {
      b.vx *= -1
      b.x = Math.min(Math.max(b.x, 0), SCREEN_W - BALL)
    }
    if (b.y < 0) {
      b.vy = Math.abs(b.vy)
      b.y = 0
    }

    const box = { x: b.x, y: b.y, w: BALL, h: BALL }
    const paddle = { x: this.paddleX, y: PADDLE.y, w: PADDLE.w, h: PADDLE.h }
    if (b.vy > 0 && hit(box, paddle)) {
      // O ângulo depende de onde a bola bate na raquete: centro sobe reto, pontas abrem.
      const offset = (b.x + BALL / 2 - (this.paddleX + PADDLE.w / 2)) / (PADDLE.w / 2)
      b.vx = this.speed * Math.max(-1, Math.min(1, offset)) * 1.2
      b.vy = -this.speed
      b.y = PADDLE.y - BALL
    }

    const target = this.bricks.findIndex((brick) => hit(box, brick))
    if (target >= 0) {
      this.bricks.splice(target, 1)
      b.vy *= -1
      this.score += 10
      if (this.bricks.length === 0) {
        this.speed += 0.4
        this.buildWall()
        this.resetBall()
      }
    }

    if (b.y > SCREEN_H) {
      this.lives -= 1
      if (this.lives <= 0) this.over = true
      else this.resetBall()
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    clearScreen(ctx)
    this.bricks.forEach((brick, i) => {
      ctx.fillStyle = Math.floor(i / WALL.cols) % 2 ? LCD.mid : LCD.fg
      ctx.fillRect(brick.x, brick.y, brick.w, brick.h)
    })
    ctx.fillStyle = LCD.fg
    ctx.fillRect(this.paddleX, PADDLE.y, PADDLE.w, PADDLE.h)
    ctx.fillRect(this.ball.x, this.ball.y, BALL, BALL)
  }
}

/* ------------------------------------------------------------------ */
/* Blast Maze                                                          */
/* ------------------------------------------------------------------ */

const Tile = { Empty: 0, Pillar: 1, Block: 2 } as const
type Tile = (typeof Tile)[keyof typeof Tile]

const MAZE = { cols: 15, rows: 11, cell: 16 }
const FUSE_TICKS = 120
const FLAME_TICKS = 30
const ITEM_CHANCE = 0.2

// Power-ups: valor inicial, teto e quanto cada item soma.
const POWER = {
  bomb: { base: 1, max: 4 },
  fire: { base: 2, max: 5 },
  speed: { base: 0, max: 3 },
} as const
type PowerKind = keyof typeof POWER
const POWER_KINDS = Object.keys(POWER) as PowerKind[]

type Cell = { x: number; y: number }
type Enemy = Cell & { dir: Point }
type Item = Cell & { kind: PowerKind; safe: number }

export class BlastMaze implements Game {
  readonly tickMs = 16

  grid: Tile[][] = []
  player: Cell = { x: 1, y: 1 }
  enemies: Enemy[] = []
  bombs: (Cell & { timer: number })[] = []
  flames: (Cell & { timer: number })[] = []
  items: Item[] = []
  door: Cell = { x: 1, y: 1 }
  power: Record<PowerKind, number> = { bomb: POWER.bomb.base, fire: POWER.fire.base, speed: POWER.speed.base }
  /** Ordem em que os itens foram pegos: ao morrer, perde o último. */
  taken: PowerKind[] = []
  level = 0
  lives = 3
  score = 0
  over = false
  private ticks = 0
  private moveCooldown = 0
  private readonly rand: Rand

  constructor(rand: Rand = Math.random) {
    this.rand = rand
    this.nextLevel()
  }

  stat() {
    return { label: 'lives' as const, value: this.lives }
  }

  badge() {
    return `B${this.power.bomb} F${this.power.fire} S${this.power.speed}`
  }

  /** Passos repetidos ficam mais curtos a cada nível de velocidade. */
  private get moveRepeat() {
    return 9 - this.power.speed * 2
  }

  private nextLevel() {
    this.level += 1
    const { cols, rows } = MAZE
    // Borda e pilares fixos em xadrez; blocos quebráveis espalhados, livrando o canto de saída.
    this.grid = Array.from({ length: rows }, (_, y) =>
      Array.from({ length: cols }, (_, x) => {
        if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1 || (x % 2 === 0 && y % 2 === 0)) return Tile.Pillar
        if (x + y <= 3) return Tile.Empty
        return this.rand() < 0.45 ? Tile.Block : Tile.Empty
      }),
    )

    const blocks = this.cells((c) => this.grid[c.y][c.x] === Tile.Block)
    this.door = blocks[Math.floor(this.rand() * blocks.length)] ?? { x: cols - 2, y: rows - 2 }
    this.grid[this.door.y][this.door.x] = Tile.Block

    const spots = this.cells((c) => this.grid[c.y][c.x] === Tile.Empty && c.x + c.y > 8)
    this.enemies = []
    for (let i = 0; i < Math.min(2 + this.level, 6) && spots.length; i++) {
      const [spot] = spots.splice(Math.floor(this.rand() * spots.length), 1)
      this.enemies.push({ ...spot, dir: DIRS.left })
    }
    this.items = []
    this.respawn()
  }

  private respawn() {
    this.player = { x: 1, y: 1 }
    this.bombs = []
    this.flames = []
  }

  private cells(match: (c: Cell) => boolean) {
    const out: Cell[] = []
    for (let y = 0; y < MAZE.rows; y++) for (let x = 0; x < MAZE.cols; x++) if (match({ x, y })) out.push({ x, y })
    return out
  }

  private bombAt(x: number, y: number) {
    return this.bombs.find((b) => b.x === x && b.y === y)
  }

  private walkable(x: number, y: number) {
    if (this.grid[y]?.[x] !== Tile.Empty) return false
    return !this.bombAt(x, y)
  }

  private move(button: Button) {
    if (button === 'action') return
    const d = DIRS[button]
    const nx = this.player.x + d.x
    const ny = this.player.y + d.y
    if (!this.walkable(nx, ny)) return
    this.player = { x: nx, y: ny }

    const item = this.items.findIndex((i) => i.x === nx && i.y === ny)
    if (item >= 0) this.collect(this.items.splice(item, 1)[0].kind)
  }

  collect(kind: PowerKind) {
    this.score += 50
    if (this.power[kind] >= POWER[kind].max) return
    this.power[kind] += 1
    this.taken.push(kind)
  }

  press(button: Button) {
    if (this.over) return
    if (button === 'action') {
      const { x, y } = this.player
      if (this.bombs.length < this.power.bomb && !this.bombAt(x, y)) this.bombs.push({ x, y, timer: FUSE_TICKS })
      return
    }
    this.move(button)
    this.moveCooldown = this.moveRepeat * 2
  }

  private explode(bomb: Cell) {
    this.flames.push({ ...bomb, timer: FLAME_TICKS })
    for (const d of Object.values(DIRS)) {
      for (let r = 1; r <= this.power.fire; r++) {
        const x = bomb.x + d.x * r
        const y = bomb.y + d.y * r
        const tile = this.grid[y][x]
        if (tile === Tile.Pillar) break
        this.flames.push({ x, y, timer: FLAME_TICKS })

        // Reação em cadeia: o fogo acende o pavio de outra bomba no caminho.
        const other = this.bombAt(x, y)
        if (other) other.timer = Math.min(other.timer, 1)

        if (tile === Tile.Block) {
          this.grid[y][x] = Tile.Empty
          this.score += 10
          const isDoor = x === this.door.x && y === this.door.y
          if (!isDoor && this.rand() < ITEM_CHANCE) {
            const kind = POWER_KINDS[Math.floor(this.rand() * POWER_KINDS.length)]
            // `safe` protege o item do mesmo fogo que acabou de revelá-lo.
            this.items.push({ x, y, kind, safe: FLAME_TICKS + 1 })
          }
          break
        }
      }
    }
  }

  private die() {
    this.lives -= 1
    // Morrer custa o último power-up pego, sem zerar a progressão toda.
    const lost = this.taken.pop()
    if (lost) this.power[lost] -= 1
    if (this.lives <= 0) this.over = true
    else this.respawn()
  }

  tick(held: ReadonlySet<Button>) {
    if (this.over) return
    this.ticks += 1

    // Segurar a direção repete o passo, como num direcional de verdade.
    if (this.moveCooldown > 0) this.moveCooldown -= 1
    const dir = (['up', 'down', 'left', 'right'] as const).find((b) => held.has(b))
    if (dir && this.moveCooldown === 0) {
      this.move(dir)
      this.moveCooldown = this.moveRepeat
    }

    // Explode em ondas até não sobrar pavio zerado: assim a cadeia acontece no mesmo tick.
    let ready = this.bombs.filter((b) => --b.timer <= 0)
    while (ready.length) {
      this.bombs = this.bombs.filter((b) => !ready.includes(b))
      ready.forEach((b) => this.explode(b))
      ready = this.bombs.filter((b) => b.timer <= 1)
    }
    this.flames = this.flames.filter((f) => --f.timer > 0)

    const onFire = (c: Cell) => this.flames.some((f) => f.x === c.x && f.y === c.y)
    this.items = this.items.filter((i) => (i.safe > 0 ? i.safe-- >= 0 : !onFire(i)))
    const before = this.enemies.length
    this.enemies = this.enemies.filter((e) => !onFire(e))
    this.score += (before - this.enemies.length) * 100

    const enemyStep = Math.max(14, 34 - this.level * 3)
    if (this.ticks % enemyStep === 0) {
      for (const e of this.enemies) {
        const options = Object.values(DIRS).filter((d) => this.walkable(e.x + d.x, e.y + d.y))
        if (!options.length) continue
        const keep = options.includes(e.dir) && this.rand() > 0.25
        e.dir = keep ? e.dir : options[Math.floor(this.rand() * options.length)]
        e.x += e.dir.x
        e.y += e.dir.y
      }
    }

    const p = this.player
    if (onFire(p) || this.enemies.some((e) => e.x === p.x && e.y === p.y)) {
      this.die()
      return
    }

    const doorOpen = this.grid[this.door.y][this.door.x] === Tile.Empty
    if (doorOpen && this.enemies.length === 0 && p.x === this.door.x && p.y === this.door.y) {
      this.score += 500
      this.nextLevel()
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    clearScreen(ctx)
    const { cell } = MAZE
    const oy = Math.floor((SCREEN_H - MAZE.rows * cell) / 2)
    const at = (c: Cell) => [c.x * cell, oy + c.y * cell] as const

    this.grid.forEach((row, y) => row.forEach((tile, x) => {
      const [px, py] = at({ x, y })
      if (tile === Tile.Pillar) {
        ctx.fillStyle = LCD.mid
        ctx.fillRect(px, py, cell, cell)
      } else if (tile === Tile.Block) {
        ctx.fillStyle = LCD.dim
        ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2)
        ctx.fillStyle = LCD.mid
        ctx.fillRect(px + 1, py + cell / 2, cell - 2, 1)
        ctx.fillRect(px + cell / 2, py + 1, 1, cell / 2)
      }
    }))

    if (this.grid[this.door.y][this.door.x] === Tile.Empty) {
      const [px, py] = at(this.door)
      ctx.strokeStyle = this.enemies.length ? LCD.mid : LCD.fg
      ctx.strokeRect(px + 3.5, py + 2.5, cell - 7, cell - 4)
    }

    // Itens: moldura com um ícone simples por tipo.
    for (const item of this.items) {
      const [px, py] = at(item)
      ctx.strokeStyle = LCD.fg
      ctx.strokeRect(px + 2.5, py + 2.5, cell - 5, cell - 5)
      ctx.fillStyle = LCD.fg
      if (item.kind === 'bomb') {
        ctx.fillRect(px + 6, py + 6, 5, 5)
        ctx.fillRect(px + 9, py + 4, 1, 2)
      } else if (item.kind === 'fire') {
        ctx.fillRect(px + 7, py + 5, 2, 7)
        ctx.fillRect(px + 5, py + 8, 6, 2)
      } else {
        ctx.fillRect(px + 5, py + 7, 6, 2)
        ctx.fillRect(px + 9, py + 5, 2, 6)
      }
    }

    ctx.fillStyle = LCD.fg
    for (const f of this.flames) {
      const [px, py] = at(f)
      ctx.fillRect(px + 2, py + 2, cell - 4, cell - 4)
    }
    for (const bomb of this.bombs) {
      if (Math.floor(bomb.timer / 8) % 2 !== 0) continue
      const [px, py] = at(bomb)
      ctx.fillRect(px + 4, py + 4, cell - 8, cell - 8)
      ctx.fillRect(px + cell / 2, py + 1, 2, 3)
    }

    ctx.fillStyle = LCD.mid
    for (const e of this.enemies) {
      const [px, py] = at(e)
      ctx.fillRect(px + 3, py + 4, cell - 6, cell - 6)
      ctx.fillStyle = LCD.bg
      ctx.fillRect(px + 5, py + 7, 2, 2)
      ctx.fillRect(px + cell - 7, py + 7, 2, 2)
      ctx.fillStyle = LCD.mid
    }

    const [px, py] = at(this.player)
    ctx.fillStyle = LCD.fg
    ctx.fillRect(px + 4, py + 2, cell - 8, 5)
    ctx.fillRect(px + 3, py + 7, cell - 6, 7)
  }
}

/* ------------------------------------------------------------------ */
/* Rock Storm                                                          */
/* ------------------------------------------------------------------ */

const SHIP = { r: 6, turn: 0.09, thrust: 0.09, drag: 0.985, maxSpeed: 3.5 }
const SHOT = { speed: 4.5, life: 45, max: 4 }
// Raio e pontos por tamanho de pedra: grandes valem menos, pequenas valem mais.
const ROCK_SIZES = { 3: { r: 15, points: 20 }, 2: { r: 9, points: 50 }, 1: { r: 5, points: 100 } } as const
const RESPAWN_SHIELD = 90

type Body = { x: number; y: number; vx: number; vy: number }
type Rock = Body & { size: 1 | 2 | 3; shape: number[] }
type Shot = Body & { life: number }

const wrap = (b: Body) => {
  b.x = (b.x + SCREEN_W) % SCREEN_W
  b.y = (b.y + SCREEN_H) % SCREEN_H
}
const dist = (a: Body, b: Body) => Math.hypot(a.x - b.x, a.y - b.y)

export class RockStorm implements Game {
  readonly tickMs = 16

  ship = { x: SCREEN_W / 2, y: SCREEN_H / 2, vx: 0, vy: 0, angle: -Math.PI / 2 }
  rocks: Rock[] = []
  shots: Shot[] = []
  shield = RESPAWN_SHIELD
  thrusting = false
  wave = 0
  lives = 3
  score = 0
  over = false
  private readonly rand: Rand

  constructor(rand: Rand = Math.random) {
    this.rand = rand
    this.nextWave()
  }

  stat() {
    return { label: 'lives' as const, value: this.lives }
  }

  makeRock(x: number, y: number, size: Rock['size']): Rock {
    const angle = this.rand() * Math.PI * 2
    const speed = 0.4 + this.rand() * 0.5 + (3 - size) * 0.25 + this.wave * 0.05
    // Contorno irregular: 9 vértices com raio entre 75% e 100%.
    const shape = Array.from({ length: 9 }, () => 0.75 + this.rand() * 0.25)
    return { x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size, shape }
  }

  private nextWave() {
    this.wave += 1
    this.rocks = []
    for (let i = 0; i < Math.min(2 + this.wave, 8); i++) {
      // Nasce nas bordas, longe da nave.
      const edge = this.rand() < 0.5
      const x = edge ? 0 : this.rand() * SCREEN_W
      const y = edge ? this.rand() * SCREEN_H : 0
      this.rocks.push(this.makeRock(x, y, 3))
    }
  }

  private respawn() {
    this.ship = { x: SCREEN_W / 2, y: SCREEN_H / 2, vx: 0, vy: 0, angle: -Math.PI / 2 }
    this.shield = RESPAWN_SHIELD
  }

  press(button: Button) {
    if (this.over || button !== 'action' || this.shots.length >= SHOT.max) return
    const { x, y, vx, vy, angle } = this.ship
    this.shots.push({
      x: x + Math.cos(angle) * SHIP.r,
      y: y + Math.sin(angle) * SHIP.r,
      vx: vx + Math.cos(angle) * SHOT.speed,
      vy: vy + Math.sin(angle) * SHOT.speed,
      life: SHOT.life,
    })
  }

  private split(rock: Rock) {
    this.score += ROCK_SIZES[rock.size].points
    if (rock.size === 1) return []
    const size = (rock.size - 1) as Rock['size']
    return [this.makeRock(rock.x, rock.y, size), this.makeRock(rock.x, rock.y, size)]
  }

  tick(held: ReadonlySet<Button>) {
    if (this.over) return
    const s = this.ship
    if (held.has('left')) s.angle -= SHIP.turn
    if (held.has('right')) s.angle += SHIP.turn
    this.thrusting = held.has('up')
    if (this.thrusting) {
      s.vx += Math.cos(s.angle) * SHIP.thrust
      s.vy += Math.sin(s.angle) * SHIP.thrust
    }
    s.vx *= SHIP.drag
    s.vy *= SHIP.drag
    const speed = Math.hypot(s.vx, s.vy)
    if (speed > SHIP.maxSpeed) {
      s.vx *= SHIP.maxSpeed / speed
      s.vy *= SHIP.maxSpeed / speed
    }
    s.x += s.vx
    s.y += s.vy
    wrap(s)
    if (this.shield > 0) this.shield -= 1

    for (const body of [...this.rocks, ...this.shots]) {
      body.x += body.vx
      body.y += body.vy
      wrap(body)
    }
    this.shots = this.shots.filter((shot) => --shot.life > 0)

    // Tiro x pedra: a pedra se divide e o tiro some.
    const survivors: Rock[] = []
    for (const rock of this.rocks) {
      const shot = this.shots.find((sh) => dist(sh, rock) < ROCK_SIZES[rock.size].r)
      if (shot) {
        this.shots = this.shots.filter((sh) => sh !== shot)
        survivors.push(...this.split(rock))
      } else survivors.push(rock)
    }
    this.rocks = survivors

    if (this.shield === 0 && this.rocks.some((rock) => dist(rock, s) < ROCK_SIZES[rock.size].r + SHIP.r - 2)) {
      this.lives -= 1
      if (this.lives <= 0) {
        this.over = true
        return
      }
      this.respawn()
    }

    if (this.rocks.length === 0) this.nextWave()
  }

  draw(ctx: CanvasRenderingContext2D) {
    clearScreen(ctx)
    ctx.lineWidth = 1
    ctx.strokeStyle = LCD.mid
    for (const rock of this.rocks) {
      const r = ROCK_SIZES[rock.size].r
      ctx.beginPath()
      rock.shape.forEach((k, i) => {
        const a = (i / rock.shape.length) * Math.PI * 2
        const x = rock.x + Math.cos(a) * r * k
        const y = rock.y + Math.sin(a) * r * k
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()
      ctx.stroke()
    }

    ctx.fillStyle = LCD.fg
    for (const shot of this.shots) ctx.fillRect(shot.x - 1, shot.y - 1, 2, 2)

    // Pisca enquanto o escudo de renascimento está ativo.
    if (this.shield > 0 && Math.floor(this.shield / 6) % 2 === 0) return
    const { x, y, angle } = this.ship
    const point = (a: number, r: number) => [x + Math.cos(angle + a) * r, y + Math.sin(angle + a) * r] as const
    ctx.strokeStyle = LCD.fg
    ctx.beginPath()
    ctx.moveTo(...point(0, SHIP.r + 2))
    ctx.lineTo(...point(2.5, SHIP.r))
    ctx.lineTo(...point(Math.PI, SHIP.r * 0.4))
    ctx.lineTo(...point(-2.5, SHIP.r))
    ctx.closePath()
    ctx.stroke()
    if (this.thrusting) {
      ctx.beginPath()
      ctx.moveTo(...point(2.8, SHIP.r * 0.7))
      ctx.lineTo(...point(Math.PI, SHIP.r + 4))
      ctx.lineTo(...point(-2.8, SHIP.r * 0.7))
      ctx.stroke()
    }
  }
}

export function createGame(id: GameId, rand: Rand = Math.random): Game {
  if (id === 'rock-storm') return new RockStorm(rand)
  if (id === 'blast-maze') return new BlastMaze(rand)
  if (id === 'wall-smash') return new WallSmash()
  if (id === 'block-tower') return new BlockTower(rand)
  if (id === 'grass-snake') return new GrassSnake(rand)
  if (id === 'sky-hopper') return new SkyHopper(rand)
  return new StarPatrol(rand)
}
