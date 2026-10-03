import { describe, expect, it } from 'vitest'
import {
  ADULT_AGE, Colony, inheritGenes, isNight, lifeStage, MAX_POPULATION, mutate, parseState, randomName, type Genes,
} from './colony'

// Gerador determinístico para os testes não dependerem da sorte.
function seeded(seed = 42) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const GENES: Genes = { speed: 1, sociability: 0.5, curiosity: 0.5, hue: 130 }

function emptyColony(rand = seeded()) {
  const colony = new Colony(rand)
  colony.creatures = []
  colony.food = []
  return colony
}

describe('Colony', () => {
  it('starts with a small founding population and some food', () => {
    const colony = new Colony(seeded())
    expect(colony.creatures).toHaveLength(6)
    expect(colony.food.length).toBeGreaterThan(0)
    expect(colony.extinct).toBe(false)
  })

  it('drops food around the clicked point', () => {
    const colony = emptyColony()
    colony.feed(100, 100)
    expect(colony.food).toHaveLength(3)
    for (const f of colony.food) {
      expect(Math.abs(f.x - 100)).toBeLessThanOrEqual(8)
      expect(Math.abs(f.y - 100)).toBeLessThanOrEqual(8)
    }
  })

  it('a hungry creature eats food it is standing on', () => {
    const colony = emptyColony()
    const c = colony.spawn(100, 100, GENES, 1)
    c.hunger = 0.8
    colony.food = [{ x: 100, y: 100 }]
    colony.tick()
    expect(colony.food).toHaveLength(0)
    expect(c.hunger).toBeLessThan(0.8)
  })

  it('a slightly hungry creature goes after food the visitor dropped, but ignores stray crumbs', () => {
    const colony = emptyColony()
    const c = colony.spawn(100, 100, GENES, 1)
    c.hunger = 0.2
    colony.dropFood(140, 100)
    for (let i = 0; i < 30; i++) colony.tick()
    // Migalhas que caem sozinhas podem aparecer no meio; o que importa é a de (140, 100).
    expect(colony.food.some((f) => f.x === 140 && f.y === 100)).toBe(true)

    colony.food = []
    c.x = 100
    c.y = 100
    c.vx = c.vy = 0
    c.hunger = 0.2
    colony.dropFood(140, 100, true)
    for (let i = 0; i < 150 && colony.food.some((f) => f.fresh); i++) colony.tick()
    expect(colony.food.some((f) => f.fresh)).toBe(false)
  })

  it('a creature dies when hunger reaches the limit', () => {
    const colony = emptyColony()
    const c = colony.spawn(100, 100, GENES, 1)
    c.hunger = 0.9995
    colony.tick()
    expect(colony.extinct).toBe(true)
  })

  it('a creature dies of old age', () => {
    const colony = emptyColony()
    const c = colony.spawn(100, 100, GENES, 1)
    c.age = c.lifespan - 1
    colony.tick()
    expect(colony.creatures).toHaveLength(0)
  })

  it('petting raises the mood of nearby creatures only', () => {
    const colony = emptyColony()
    const near = colony.spawn(100, 100, GENES, 1)
    const far = colony.spawn(400, 200, GENES, 1)
    near.mood = far.mood = 0.3
    expect(colony.pet(102, 100)).toBe(1)
    expect(near.mood).toBeGreaterThan(0.3)
    expect(far.mood).toBe(0.3)
  })

  it('two happy, fed adults side by side have a child of the next generation', () => {
    const colony = emptyColony()
    for (const x of [100, 104]) {
      const c = colony.spawn(x, 100, GENES, 2, ADULT_AGE + 100)
      c.cooldown = 0
      c.hunger = 0
      c.mood = 1
    }
    colony.tick()
    expect(colony.creatures).toHaveLength(3)
    expect(colony.births).toBe(1)
    expect(colony.stats().generation).toBe(3)
  })

  it('never grows beyond the population cap', () => {
    const colony = emptyColony()
    for (let i = 0; i < MAX_POPULATION; i++) {
      const c = colony.spawn(100, 100, GENES, 1, ADULT_AGE + 100)
      c.cooldown = 0
      c.hunger = 0
      c.mood = 1
    }
    colony.tick()
    expect(colony.creatures.length).toBeLessThanOrEqual(MAX_POPULATION)
  })

  it('at night creatures sleep: no eating, no children, slower hunger', () => {
    const colony = emptyColony()
    colony.night = true
    const pair = [100, 104].map((x) => {
      const c = colony.spawn(x, 100, GENES, 1, ADULT_AGE + 100)
      c.cooldown = 0
      c.hunger = 0.5
      c.mood = 1
      return c
    })
    colony.food = [{ x: 100, y: 100 }]
    colony.tick()
    expect(colony.food).toHaveLength(1)
    expect(colony.creatures).toHaveLength(2)
    expect(pair[0].hunger).toBeLessThan(0.5005)
  })

  it('waking the colony at night makes everyone hop and lets them eat again', () => {
    const colony = emptyColony()
    colony.night = true
    const c = colony.spawn(100, 100, GENES, 1)
    colony.wake()
    expect(colony.night).toBe(false)
    expect(c.hop).toBeGreaterThan(0)
  })

  it('calm mode (reduced motion) slows everyone down', () => {
    const run = (calm: boolean) => {
      const colony = emptyColony(seeded(5))
      colony.calm = calm
      const c = colony.spawn(100, 100, { ...GENES, speed: 2 }, 1)
      c.mood = 1
      c.hunger = 0.5
      // Dentro da visão (curiosidade 0.5 enxerga 120 px), para ele correr até lá.
      colony.dropFood(200, 100, true)
      let fastest = 0
      for (let i = 0; i < 60; i++) {
        colony.tick()
        fastest = Math.max(fastest, Math.hypot(c.vx, c.vy))
      }
      return fastest
    }
    expect(run(true)).toBeLessThan(run(false))
  })

  it('a fast pointer startles nearby creatures and pushes them away', () => {
    const colony = emptyColony()
    const c = colony.spawn(110, 100, GENES, 1)
    c.mood = 0.5
    expect(colony.startle(100, 100)).toBe(1)
    expect(c.startle).toBeGreaterThan(0)
    expect(c.vx).toBeGreaterThan(0)
    expect(c.mood).toBeLessThan(0.5)
  })

  it('dropping food makes hungry creatures that can see it hop', () => {
    const colony = emptyColony()
    const c = colony.spawn(100, 100, GENES, 1)
    c.hunger = 0.6
    colony.feed(120, 100)
    expect(c.hop).toBeGreaterThan(0)
  })

  it('finds the creature under the pointer', () => {
    const colony = emptyColony()
    const c = colony.spawn(100, 100, GENES, 1)
    expect(colony.creatureAt(104, 102)).toBe(c)
    expect(colony.creatureAt(200, 200)).toBeNull()
  })

  it('every creature gets a name and moves through life stages', () => {
    const colony = emptyColony()
    const c = colony.spawn(100, 100, GENES, 1)
    expect(c.name).toMatch(/^[A-Z][a-z]+$/)
    expect(lifeStage(c)).toBe('baby')
    c.age = ADULT_AGE
    expect(lifeStage(c)).toBe('adult')
    c.age = c.lifespan - 1
    expect(lifeStage(c)).toBe('elder')
  })
})

describe('helpers', () => {
  it('generates short capitalized names', () => {
    const rand = seeded(9)
    for (let i = 0; i < 20; i++) expect(randomName(rand)).toMatch(/^[A-Z][a-z]{3,5}$/)
  })

  it('night is from 22h to 6h', () => {
    expect(isNight(new Date(2026, 0, 1, 23))).toBe(true)
    expect(isNight(new Date(2026, 0, 1, 3))).toBe(true)
    expect(isNight(new Date(2026, 0, 1, 6))).toBe(false)
    expect(isNight(new Date(2026, 0, 1, 15))).toBe(false)
  })
})

describe('genes', () => {
  it('mutation stays inside the allowed range', () => {
    const rand = seeded(7)
    for (let i = 0; i < 200; i++) {
      const v = mutate(rand(), rand, 0, 1)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })

  it('children inherit genes close to one of the parents', () => {
    const a: Genes = { speed: 0.5, sociability: 0, curiosity: 0, hue: 100 }
    const b: Genes = { speed: 1.9, sociability: 1, curiosity: 1, hue: 200 }
    const child = inheritGenes(a, b, seeded(3))
    const closest = Math.min(Math.abs(child.sociability - a.sociability), Math.abs(child.sociability - b.sociability))
    expect(closest).toBeLessThanOrEqual(0.08)
    expect(child.hue).toBeGreaterThanOrEqual(0)
    expect(child.hue).toBeLessThan(360)
  })
})

describe('parseState', () => {
  it('round-trips a saved colony', () => {
    const colony = new Colony(seeded())
    for (let i = 0; i < 50; i++) colony.tick()
    const restored = new Colony(seeded(), parseState(JSON.stringify(colony.toJSON()))!)
    expect(restored.creatures).toHaveLength(colony.creatures.length)
    expect(restored.ticks).toBe(50)
  })

  it('upgrades saves from before names existed', () => {
    const colony = new Colony(seeded())
    const old = colony.toJSON()
    for (const c of old.creatures as Partial<(typeof old.creatures)[number]>[]) {
      delete c.name
      delete c.hop
      delete c.startle
    }
    const restored = new Colony(seeded(), parseState(JSON.stringify(old))!)
    for (const c of restored.creatures) {
      expect(c.name).toBeTruthy()
      expect(c.hop).toBe(0)
    }
  })

  it('rejects missing or corrupted data', () => {
    expect(parseState(null)).toBeNull()
    expect(parseState('not json')).toBeNull()
    expect(parseState('{"creatures": "x"}')).toBeNull()
    expect(parseState('{"creatures":[{"x":"a"}],"food":[],"nextId":1,"ticks":0}')).toBeNull()
  })
})
