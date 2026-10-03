// Lógica pura dos Bandoletes. Nada aqui conhece React: o componente chama
// `tick` num passo fixo, repassa cliques via `feed`/`pet` e pede para a
// colônia se desenhar num canvas de WORLD_W x WORLD_H.

export type Rand = () => number

export const WORLD_W = 480
export const WORLD_H = 270
export const TICK_MS = 50
export const MAX_POPULATION = 40
const MAX_FOOD = 30

export const PALETTE = {
  bg: '#0b120d',
  grid: '#13201a',
  nightBg: '#05080a',
  nightGrid: '#0b1216',
  zzz: '#7f9cc4',
  ring: '#8fe09c',
  food: '#f2c14e',
  heart: '#ff6f91',
  eye: '#0b120d',
}

export interface Genes {
  /** Velocidade máxima, em px por tick. */
  speed: number
  /** Quanto o bichinho quer ficar perto dos outros (0–1). */
  sociability: number
  /** Alcance da visão para achar comida (0–1). */
  curiosity: number
  /** Cor do corpo, em graus HSL. */
  hue: number
}

export interface Creature {
  id: number
  name: string
  x: number
  y: number
  vx: number
  vy: number
  /** 0 = saciado, 1 = morre de fome. */
  hunger: number
  /** 0 = triste, 1 = radiante. */
  mood: number
  age: number
  lifespan: number
  cooldown: number
  generation: number
  genes: Genes
  /** Ticks restantes de pulinho (viu ou comeu comida). */
  hop: number
  /** Ticks restantes de susto (ponteiro passou rápido). */
  startle: number
}

export type LifeStage = 'baby' | 'adult' | 'elder'

export interface Food {
  x: number
  y: number
  /** Jogada pelo visitante: atrai até quem está só um pouco com fome. */
  fresh?: boolean
}

export interface Heart {
  x: number
  y: number
  ttl: number
}

export interface ColonyState {
  creatures: Creature[]
  food: Food[]
  nextId: number
  ticks: number
  births: number
}

export interface ColonyStats {
  population: number
  generation: number
  mood: number
  hunger: number
  births: number
}

// Equilíbrio (1 tick = 50 ms): uma comida segura um bichinho por ~45 s e a
// comida que cai sozinha sustenta uns 10 — acima disso, a colônia depende de visitas.
export const ADULT_AGE = 1200
const LIFESPAN_MIN = 12000
const LIFESPAN_RANGE = 6000
const MATE_COOLDOWN = 1800
const EAT_RADIUS = 7
const PET_RADIUS = 18
const STARTLE_RADIUS = 36
const MATE_RADIUS = 14
const HUNGER_PER_TICK = 0.0005
// Fome a partir da qual vão atrás de comida: qualquer uma, ou só a do visitante.
const SEEK_ANY_HUNGER = 0.35
const SEEK_FRESH_HUNGER = 0.1
const FULL_HUNGER = 0.05
const AUTO_FOOD_CHANCE = 0.012
const MUTATION = 0.08

const SYLLABLES = ['bo', 'li', 'na', 'to', 'ru', 'mi', 'ze', 'ka', 'pu', 'lo', 'fi', 'te', 'nu', 'da', 'xi', 'go']

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function randomName(rand: Rand) {
  const count = rand() < 0.6 ? 2 : 3
  let name = ''
  for (let i = 0; i < count; i++) name += SYLLABLES[Math.floor(rand() * SYLLABLES.length)]
  return name[0].toUpperCase() + name.slice(1)
}

/** Até onde enxerga comida: os curiosos veem mais longe. */
function sight(c: Creature) {
  return 40 + c.genes.curiosity * 160
}

export function lifeStage(c: Creature): LifeStage {
  if (c.age < ADULT_AGE) return 'baby'
  return c.age > c.lifespan * 0.75 ? 'elder' : 'adult'
}

/** Noite no relógio do visitante: das 22h às 6h a colônia dorme. */
export function isNight(date: Date) {
  const h = date.getHours()
  return h >= 22 || h < 6
}

export function mutate(value: number, rand: Rand, min: number, max: number, amount = MUTATION) {
  return clamp(value + (rand() * 2 - 1) * amount * (max - min), min, max)
}

export function inheritGenes(a: Genes, b: Genes, rand: Rand): Genes {
  const pick = (x: number, y: number) => (rand() < 0.5 ? x : y)
  return {
    speed: mutate(pick(a.speed, b.speed), rand, 0.4, 2),
    sociability: mutate(pick(a.sociability, b.sociability), rand, 0, 1),
    curiosity: mutate(pick(a.curiosity, b.curiosity), rand, 0, 1),
    hue: (pick(a.hue, b.hue) + (rand() * 2 - 1) * 18 + 360) % 360,
  }
}

export class Colony {
  creatures: Creature[] = []
  food: Food[] = []
  hearts: Heart[] = []
  nextId = 1
  ticks = 0
  births = 0
  /** Quando true, todos dormem: quase não andam, gastam menos e não têm filhotes. */
  night = false
  /** `prefers-reduced-motion`: sem pulinhos, tremidas nem corações, e todo mundo mais devagar. */
  calm = false
  private readonly rand: Rand

  constructor(rand: Rand = Math.random, state?: ColonyState) {
    this.rand = rand
    if (state) {
      // Saves antigos não tinham nome nem reações.
      this.creatures = state.creatures.map((c) => ({
        ...c,
        name: c.name || randomName(rand),
        hop: c.hop ?? 0,
        startle: c.startle ?? 0,
      }))
      this.food = state.food
      this.nextId = state.nextId
      this.ticks = state.ticks
      this.births = state.births
    } else {
      this.seed()
    }
  }

  get extinct() {
    return this.creatures.length === 0
  }

  /** Funda uma colônia nova com alguns bichinhos e um pouco de comida. */
  seed(count = 6) {
    this.creatures = []
    this.food = []
    this.hearts = []
    this.ticks = 0
    this.births = 0
    for (let i = 0; i < count; i++) {
      this.spawn(
        WORLD_W / 2 + (this.rand() - 0.5) * 120,
        WORLD_H / 2 + (this.rand() - 0.5) * 80,
        {
          speed: 0.8 + this.rand() * 0.6,
          sociability: this.rand(),
          curiosity: this.rand(),
          hue: 110 + this.rand() * 60,
        },
        1,
        ADULT_AGE + Math.floor(this.rand() * 200),
      )
    }
    for (let i = 0; i < 8; i++) this.dropFood(this.rand() * WORLD_W, this.rand() * WORLD_H)
  }

  spawn(x: number, y: number, genes: Genes, generation: number, age = 0): Creature {
    const creature = this.newCreature(x, y, genes, generation)
    creature.age = age
    creature.hunger = 0.2
    creature.mood = 0.6
    creature.cooldown = 200
    this.creatures.push(creature)
    return creature
  }

  private newCreature(x: number, y: number, genes: Genes, generation: number): Creature {
    return {
      id: this.nextId++,
      name: randomName(this.rand),
      x: clamp(x, 0, WORLD_W),
      y: clamp(y, 0, WORLD_H),
      vx: 0,
      vy: 0,
      hunger: 0.3,
      mood: 0.7,
      age: 0,
      lifespan: LIFESPAN_MIN + Math.floor(this.rand() * LIFESPAN_RANGE),
      cooldown: 0,
      generation,
      genes,
      hop: 0,
      startle: 0,
    }
  }

  /** Quem está debaixo do ponteiro (para abrir a fichinha). */
  creatureAt(x: number, y: number, radius = 10): Creature | null {
    let best: Creature | null = null
    let bestDist = radius
    for (const c of this.creatures) {
      const d = Math.hypot(c.x - x, c.y - y)
      if (d < bestDist) {
        best = c
        bestDist = d
      }
    }
    return best
  }

  dropFood(x: number, y: number, fresh = false) {
    if (this.food.length >= MAX_FOOD) this.food.shift()
    this.food.push({ x: clamp(x, 4, WORLD_W - 4), y: clamp(y, 4, WORLD_H - 4), fresh })
  }

  /** Clique do visitante: espalha um punhado de comida em volta do ponto. */
  feed(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.dropFood(x + (this.rand() - 0.5) * 16, y + (this.rand() - 0.5) * 16, true)
    }
    if (this.night) return
    // Quem tem fome e enxerga a comida dá um pulinho de animação.
    for (const c of this.creatures) {
      if (c.hunger > SEEK_FRESH_HUNGER && Math.hypot(c.x - x, c.y - y) < sight(c)) c.hop = 12
    }
  }

  /** Visitante noturno chamou: todo mundo acorda num pulo. */
  wake() {
    this.night = false
    for (const c of this.creatures) c.hop = 12
  }

  /** Ponteiro passou rápido: quem estiver perto se assusta e foge. Devolve quantos. */
  startle(x: number, y: number) {
    let scared = 0
    for (const c of this.creatures) {
      const d = Math.hypot(c.x - x, c.y - y)
      if (d > STARTLE_RADIUS) continue
      const away = d || 1
      c.vx = ((c.x - x) / away) * 3
      c.vy = ((c.y - y) / away) * 3
      c.startle = 20
      c.mood = clamp(c.mood - 0.03, 0, 1)
      scared++
    }
    return scared
  }

  /** Carinho: quem estiver perto do ponteiro fica mais feliz. Devolve quantos receberam. */
  pet(x: number, y: number) {
    let petted = 0
    for (const c of this.creatures) {
      if (Math.hypot(c.x - x, c.y - y) > PET_RADIUS) continue
      if (c.mood < 0.98 && this.rand() < 0.3) this.hearts.push({ x: c.x, y: c.y - 8, ttl: 20 })
      c.mood = clamp(c.mood + 0.05, 0, 1)
      petted++
    }
    return petted
  }

  tick() {
    this.ticks++
    // Uma migalha aparece sozinha de vez em quando, para a colônia não
    // depender só de visitas — mas sem fartura.
    if (!this.night && this.rand() < AUTO_FOOD_CHANCE) this.dropFood(this.rand() * WORLD_W, this.rand() * WORLD_H)

    const born: Creature[] = []
    for (const c of this.creatures) {
      c.hop = Math.max(0, c.hop - 1)
      c.startle = Math.max(0, c.startle - 1)
      c.age++
      c.cooldown = Math.max(0, c.cooldown - 1)
      if (this.night) {
        // Dormindo: só escorrega o que sobrou do último passo e gasta bem menos.
        this.drift(c)
        c.hunger = clamp(c.hunger + HUNGER_PER_TICK * 0.4, 0, 1)
        continue
      }
      this.move(c)
      this.eat(c)
      c.hunger = clamp(c.hunger + HUNGER_PER_TICK, 0, 1)
      // Fome derruba o humor; companhia levanta.
      const company = this.neighbors(c, 40).length
      const target = clamp(1 - c.hunger * 1.2 + Math.min(company, 4) * 0.06 * c.genes.sociability, 0, 1)
      c.mood += (target - c.mood) * 0.004
      const child = this.tryMate(c)
      if (child) born.push(child)
    }
    this.creatures.push(...born)
    this.creatures = this.creatures.filter((c) => c.hunger < 1 && c.age < c.lifespan)

    this.hearts = this.hearts
      .map((h) => ({ ...h, y: h.y - 0.6, ttl: h.ttl - 1 }))
      .filter((h) => h.ttl > 0)
  }

  stats(): ColonyStats {
    const n = this.creatures.length
    const avg = (f: (c: Creature) => number) => (n ? this.creatures.reduce((s, c) => s + f(c), 0) / n : 0)
    return {
      population: n,
      generation: this.creatures.reduce((m, c) => Math.max(m, c.generation), 0),
      mood: avg((c) => c.mood),
      hunger: avg((c) => c.hunger),
      births: this.births,
    }
  }

  toJSON(): ColonyState {
    return {
      creatures: this.creatures,
      food: this.food,
      nextId: this.nextId,
      ticks: this.ticks,
      births: this.births,
    }
  }

  private neighbors(c: Creature, radius: number) {
    return this.creatures.filter((o) => o !== c && Math.hypot(o.x - c.x, o.y - c.y) < radius)
  }

  private nearestFood(c: Creature) {
    if (c.hunger <= SEEK_FRESH_HUNGER) return null
    const any = c.hunger > SEEK_ANY_HUNGER
    let best: Food | null = null
    let bestDist = sight(c)
    for (const f of this.food) {
      if (!any && !f.fresh) continue
      const d = Math.hypot(f.x - c.x, f.y - c.y)
      if (d < bestDist) {
        best = f
        bestDist = d
      }
    }
    return best
  }

  private move(c: Creature) {
    let ax = (this.rand() - 0.5) * 0.3
    let ay = (this.rand() - 0.5) * 0.3

    const food = this.nearestFood(c)
    if (food) {
      const d = Math.hypot(food.x - c.x, food.y - c.y) || 1
      ax += ((food.x - c.x) / d) * 0.25
      ay += ((food.y - c.y) / d) * 0.25
    } else {
      // Bando: chega perto de quem está em volta, mas sem se amontoar.
      const near = this.neighbors(c, 60)
      if (near.length) {
        const cx = near.reduce((s, o) => s + o.x, 0) / near.length
        const cy = near.reduce((s, o) => s + o.y, 0) / near.length
        ax += (cx - c.x) * 0.002 * c.genes.sociability
        ay += (cy - c.y) * 0.002 * c.genes.sociability
        for (const o of near) {
          const d = Math.hypot(o.x - c.x, o.y - c.y) || 1
          if (d < 12) {
            ax -= ((o.x - c.x) / d) * 0.15
            ay -= ((o.y - c.y) / d) * 0.15
          }
        }
      }
    }

    // Bichinho triste anda devagar; assustado, dispara.
    const max = c.genes.speed * (0.5 + c.mood * 0.5) * (c.startle > 0 ? 2.5 : 1) * (this.calm ? 0.6 : 1)
    c.vx = (c.vx + ax) * 0.92
    c.vy = (c.vy + ay) * 0.92
    const v = Math.hypot(c.vx, c.vy)
    if (v > max) {
      c.vx = (c.vx / v) * max
      c.vy = (c.vy / v) * max
    }
    this.drift(c)
  }

  private drift(c: Creature) {
    if (this.night) {
      c.vx *= 0.8
      c.vy *= 0.8
    }
    c.x += c.vx
    c.y += c.vy
    if (c.x < 6 || c.x > WORLD_W - 6) c.vx *= -1
    if (c.y < 6 || c.y > WORLD_H - 6) c.vy *= -1
    c.x = clamp(c.x, 6, WORLD_W - 6)
    c.y = clamp(c.y, 6, WORLD_H - 6)
  }

  private eat(c: Creature) {
    if (c.hunger < FULL_HUNGER) return
    const i = this.food.findIndex((f) => Math.hypot(f.x - c.x, f.y - c.y) < EAT_RADIUS)
    if (i === -1) return
    this.food.splice(i, 1)
    c.hunger = clamp(c.hunger - 0.45, 0, 1)
    c.mood = clamp(c.mood + 0.1, 0, 1)
    c.hop = 8
  }

  private fertile(c: Creature) {
    return c.age >= ADULT_AGE && c.cooldown === 0 && c.hunger < 0.4 && c.mood > 0.55
  }

  private tryMate(c: Creature): Creature | null {
    if (this.creatures.length >= MAX_POPULATION || !this.fertile(c)) return null
    const partner = this.neighbors(c, MATE_RADIUS).find((o) => this.fertile(o))
    if (!partner) return null
    for (const p of [c, partner]) {
      p.cooldown = MATE_COOLDOWN
      p.hunger = clamp(p.hunger + 0.2, 0, 1)
    }
    this.births++
    this.hearts.push({ x: (c.x + partner.x) / 2, y: (c.y + partner.y) / 2 - 8, ttl: 30 })
    return this.newCreature(
      (c.x + partner.x) / 2,
      (c.y + partner.y) / 2,
      inheritGenes(c.genes, partner.genes, this.rand),
      Math.max(c.generation, partner.generation) + 1,
    )
  }
}

/** Valida o que veio do localStorage; qualquer coisa estranha vira `null`. */
export function parseState(raw: string | null): ColonyState | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<ColonyState>
    const num = (v: unknown) => typeof v === 'number' && Number.isFinite(v)
    if (!Array.isArray(data.creatures) || !Array.isArray(data.food) || !num(data.nextId) || !num(data.ticks)) return null
    const creaturesOk = data.creatures.every(
      (c) => c && num(c.x) && num(c.y) && num(c.hunger) && num(c.mood) && num(c.age) && c.genes && num(c.genes.speed) && num(c.genes.hue),
    )
    if (!creaturesOk || data.creatures.length > MAX_POPULATION) return null
    return {
      creatures: data.creatures,
      food: data.food.filter((f) => f && num(f.x) && num(f.y)).slice(0, MAX_FOOD),
      nextId: data.nextId!,
      ticks: data.ticks!,
      births: num(data.births) ? data.births! : 0,
    }
  } catch {
    return null
  }
}

/* ------------------------------------------------------------------ */
/* Desenho                                                             */
/* ------------------------------------------------------------------ */

function drawCreature(ctx: CanvasRenderingContext2D, c: Creature, ticks: number, asleep: boolean, calm: boolean) {
  const adult = c.age >= ADULT_AGE
  const size = adult ? 7 : 4 + (c.age / ADULT_AGE) * 3
  // Balanço enquanto anda, cada um no seu ritmo; pulinho quando vê comida;
  // tremidinha quando se assusta. No modo calmo, nada disso.
  const bob = calm ? 0 : Math.sin((ticks + c.id * 7) / 4) * Math.min(1.5, Math.hypot(c.vx, c.vy))
  const hop = !calm && c.hop > 0 ? -Math.abs(Math.sin((c.hop / 12) * Math.PI * 2)) * 4 : 0
  const shake = !calm && c.startle > 0 ? (c.startle % 2 ? 1 : -1) : 0
  const x = Math.round(c.x + shake)
  const y = Math.round(c.y + bob + hop)
  // Idosos desbotam um pouco.
  const sat = lifeStage(c) === 'elder' ? 30 : 60
  const light = (asleep ? 25 : 35) + c.mood * 25

  ctx.fillStyle = `hsl(${c.genes.hue} ${sat}% ${light}%)`
  ctx.beginPath()
  ctx.ellipse(x, y, size, size * 0.85, 0, 0, Math.PI * 2)
  ctx.fill()

  // Anteninha — a marca dos Bandoletes.
  ctx.strokeStyle = ctx.fillStyle
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.8)
  ctx.lineTo(x + 2, y - size - 3)
  ctx.stroke()
  ctx.fillRect(x + 1, y - size - 4, 2, 2)

  const eyeY = y - size * 0.15
  ctx.fillStyle = PALETTE.eye
  ctx.strokeStyle = PALETTE.eye

  if (asleep) {
    // Olhos fechados e um "z" que sobe devagar.
    ctx.fillRect(x - size * 0.4 - 1, eyeY, 3, 1)
    ctx.fillRect(x + size * 0.4 - 1, eyeY, 3, 1)
    const phase = (ticks + c.id * 13) % 60
    ctx.globalAlpha = 1 - phase / 60
    ctx.fillStyle = PALETTE.zzz
    ctx.font = '8px monospace'
    ctx.fillText('z', x + size, y - size - phase / 6)
    ctx.globalAlpha = 1
    return
  }

  // Olhos olham para onde está indo; arregalados no susto, miúdos na fome.
  const dir = Math.hypot(c.vx, c.vy) > 0.1 ? Math.sign(c.vx) : 0
  const eye = c.startle > 0 ? 3 : c.hunger > 0.7 ? 1 : 2
  ctx.fillRect(x - size * 0.4 + dir - eye / 2, eyeY - eye / 2, eye, eye)
  ctx.fillRect(x + size * 0.4 + dir - eye / 2, eyeY - eye / 2, eye, eye)

  if (c.startle > 0) {
    // Boquinha de "oh!".
    ctx.fillRect(x - 1, y + size * 0.3, 2, 2)
    return
  }

  // Boca: sorriso, reta ou triste conforme o humor.
  const curve = (c.mood - 0.5) * 3
  ctx.beginPath()
  ctx.moveTo(x - size * 0.3, y + size * 0.35)
  ctx.quadraticCurveTo(x, y + size * 0.35 + curve, x + size * 0.3, y + size * 0.35)
  ctx.stroke()
}

function drawHeart(ctx: CanvasRenderingContext2D, h: Heart) {
  const x = Math.round(h.x)
  const y = Math.round(h.y)
  ctx.globalAlpha = Math.min(1, h.ttl / 10)
  ctx.fillStyle = PALETTE.heart
  ctx.fillRect(x - 3, y - 2, 2, 2)
  ctx.fillRect(x + 1, y - 2, 2, 2)
  ctx.fillRect(x - 3, y, 6, 1)
  ctx.fillRect(x - 2, y + 1, 4, 1)
  ctx.fillRect(x - 1, y + 2, 2, 1)
  ctx.globalAlpha = 1
}

export function drawColony(ctx: CanvasRenderingContext2D, colony: Colony, selectedId: number | null = null) {
  ctx.fillStyle = colony.night ? PALETTE.nightBg : PALETTE.bg
  ctx.fillRect(0, 0, WORLD_W, WORLD_H)
  ctx.fillStyle = colony.night ? PALETTE.nightGrid : PALETTE.grid
  for (let x = 0; x < WORLD_W; x += 24) ctx.fillRect(x, 0, 1, WORLD_H)
  for (let y = 0; y < WORLD_H; y += 24) ctx.fillRect(0, y, WORLD_W, 1)

  ctx.fillStyle = PALETTE.food
  for (const f of colony.food) ctx.fillRect(Math.round(f.x) - 1, Math.round(f.y) - 1, 3, 3)

  for (const c of colony.creatures) drawCreature(ctx, c, colony.ticks, colony.night, colony.calm)
  if (!colony.calm) for (const h of colony.hearts) drawHeart(ctx, h)

  const selected = selectedId === null ? undefined : colony.creatures.find((c) => c.id === selectedId)
  if (selected) {
    ctx.strokeStyle = PALETTE.ring
    ctx.setLineDash([2, 2])
    ctx.beginPath()
    ctx.arc(Math.round(selected.x), Math.round(selected.y), 12, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }
}
