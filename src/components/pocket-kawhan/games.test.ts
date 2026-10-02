import { describe, expect, it } from 'vitest'
import { BlockTower, GrassSnake, StarPatrol, rotate, SkyHopper } from './games'

const none = new Set<never>()
const fixed = (value: number) => () => value

describe('Block Tower', () => {
  it('rotates a piece clockwise', () => {
    expect(rotate([[1, 0, 0], [1, 1, 1]])).toEqual([[1, 1], [1, 0], [1, 0]])
  })

  it('clears a full line and scores it', () => {
    const game = new BlockTower(fixed(0)) // sempre a peça I
    game.board[BlockTower.ROWS - 1] = [1, 1, 1, 1, 1, 1, 0, 0, 0, 0]
    game.piece = { m: [[1, 1, 1, 1]], x: 6, y: BlockTower.ROWS - 1 }
    game.tick()
    expect(game.lines).toBe(1)
    expect(game.score).toBe(100)
    expect(game.board[BlockTower.ROWS - 1].every((c) => c === 0)).toBe(true)
  })

  it('ends when a new piece cannot spawn', () => {
    const game = new BlockTower(fixed(0))
    // Duas colunas vazias: nenhuma linha fecha, e o topo fica bloqueado.
    game.board = game.board.map(() => [1, 1, 1, 1, 1, 1, 1, 1, 0, 0])
    game.piece = { m: [[1]], x: 9, y: BlockTower.ROWS - 1 }
    game.tick()
    expect(game.over).toBe(true)
  })
})

describe('Grass Snake', () => {
  it('grows and scores when eating', () => {
    const game = new GrassSnake(fixed(0))
    game.food = { x: 9, y: 9 }
    game.tick()
    expect(game.body).toHaveLength(4)
    expect(game.score).toBe(10)
  })

  it('ignores a direct reversal', () => {
    const game = new GrassSnake(fixed(0))
    game.press('left')
    game.tick()
    expect(game.body[0]).toEqual({ x: 9, y: 9 })
  })

  it('dies on the wall', () => {
    const game = new GrassSnake(fixed(0.99))
    for (let i = 0; i < GrassSnake.COLS; i++) game.tick()
    expect(game.over).toBe(true)
  })
})

describe('Sky Hopper', () => {
  it('falls to the ground without flapping', () => {
    const game = new SkyHopper(fixed(0.5))
    for (let i = 0; i < 200 && !game.over; i++) game.tick()
    expect(game.over).toBe(true)
  })

  it('flapping pushes the bird up', () => {
    const game = new SkyHopper(fixed(0.5))
    const start = game.birdY
    game.press('action')
    game.tick()
    expect(game.birdY).toBeLessThan(start)
  })
})

describe('Star Patrol', () => {
  it('shoots down an alien', () => {
    const game = new StarPatrol(fixed(0.99)) // sem bombas
    const target = game.aliens[game.aliens.length - 1]
    game.playerX = target.x - 1
    game.press('action')
    for (let i = 0; i < 40 && game.score === 0; i++) game.tick(none)
    expect(game.score).toBe(10)
    expect(game.aliens).toHaveLength(31)
  })

  it('loses a life when hit by a bomb', () => {
    const game = new StarPatrol(fixed(0.99))
    game.bombs.push({ x: game.playerX + 4, y: 160, w: 2, h: 4 })
    game.tick(none)
    expect(game.lives).toBe(2)
  })
})
