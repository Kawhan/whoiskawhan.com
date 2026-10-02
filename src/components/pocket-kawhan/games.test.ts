import { describe, expect, it } from 'vitest'
import { BlockTower, GrassSnake, StarPatrol, rotate, SkyHopper, WallSmash, BlastMaze, RockStorm } from './games'

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

describe('Rock Storm', () => {
  it('a shot splits a big rock into two smaller ones', () => {
    const game = new RockStorm(fixed(0.5))
    game.rocks = [game.makeRock(game.ship.x, game.ship.y - 30, 3)]
    game.rocks[0].vx = 0
    game.rocks[0].vy = 0
    game.press('action') // nave começa apontando para cima
    for (let i = 0; i < 10 && game.score === 0; i++) game.tick(none)
    expect(game.score).toBe(20)
    expect(game.rocks.map((r) => r.size)).toEqual([2, 2])
  })

  it('limits shots on screen', () => {
    const game = new RockStorm(fixed(0.5))
    for (let i = 0; i < 10; i++) game.press('action')
    expect(game.shots).toHaveLength(4)
  })

  it('thrust moves the ship and turning rotates it', () => {
    const game = new RockStorm(fixed(0.5))
    game.rocks = []
    const { y, angle } = game.ship
    game.tick(new Set(['up', 'right']))
    expect(game.ship.y).toBeLessThan(y)
    expect(game.ship.angle).toBeGreaterThan(angle)
  })

  it('loses a life on collision only after the respawn shield', () => {
    const game = new RockStorm(fixed(0.5))
    const rock = () => ({ ...game.makeRock(game.ship.x, game.ship.y, 3), vx: 0, vy: 0 })
    game.rocks = [rock()]
    game.tick(none)
    expect(game.lives).toBe(3)
    game.shield = 0
    game.rocks = [rock()]
    game.tick(none)
    expect(game.lives).toBe(2)
  })
})

describe('Blast Maze', () => {
  const tick = (game: BlastMaze, n: number) => { for (let i = 0; i < n; i++) game.tick(none) }

  it('builds a walled maze with a free starting corner', () => {
    const game = new BlastMaze(fixed(0.1))
    expect(game.grid[0].every((t) => t === 1)).toBe(true)
    expect(game.grid[1][1]).toBe(0)
    expect(game.grid[2][2]).toBe(1)
  })

  it('a bomb destroys the first block in each direction and scores', () => {
    // Com rand 0.1 o mapa nasce cheio: há blocos em (3,1) e (1,3), a 2 casas da bomba.
    const game = new BlastMaze(fixed(0.1))
    game.enemies = []
    game.press('action')
    game.player = { x: 3, y: 3 } // fora do alcance, atrás do pilar
    tick(game, 121)
    expect(game.grid[1][3]).toBe(0)
    expect(game.grid[3][1]).toBe(0)
    expect(game.score).toBe(20)
    expect(game.lives).toBe(3)
  })

  it('loses a life when caught by its own blast', () => {
    const game = new BlastMaze(fixed(0.1))
    game.enemies = []
    game.press('action')
    tick(game, 121)
    expect(game.lives).toBe(2)
    expect(game.player).toEqual({ x: 1, y: 1 })
  })

  it('kills enemies caught in the blast', () => {
    const game = new BlastMaze(fixed(0.1))
    game.enemies = [{ x: 1, y: 2, dir: { x: 0, y: 0 } }]
    game.bombs = [{ x: 1, y: 1, timer: 1 }]
    game.player = { x: 3, y: 3 }
    game.tick(none)
    expect(game.enemies).toHaveLength(0)
    expect(game.score).toBe(100 + 20) // inimigo + os dois blocos do alcance
  })

  it('power-ups raise their stat up to the cap', () => {
    const game = new BlastMaze(fixed(0.1))
    for (let i = 0; i < 10; i++) game.collect('fire')
    expect(game.power.fire).toBe(5)
    game.collect('bomb')
    expect(game.power.bomb).toBe(2)
    expect(game.badge()).toBe('B2 F5 S0')
  })

  it('allows as many bombs as the bomb power', () => {
    const game = new BlastMaze(fixed(0.1))
    game.enemies = []
    game.press('action')
    game.press('right')
    game.press('action')
    expect(game.bombs).toHaveLength(1)
    game.collect('bomb')
    game.press('action')
    expect(game.bombs).toHaveLength(2)
  })

  it('a blast sets off another bomb in its path', () => {
    const game = new BlastMaze(fixed(0.1))
    game.enemies = []
    game.player = { x: 5, y: 5 }
    game.bombs = [{ x: 1, y: 1, timer: 1 }, { x: 2, y: 1, timer: 999 }]
    game.tick(none)
    expect(game.bombs).toHaveLength(0)
  })

  it('dying loses the last power-up taken', () => {
    const game = new BlastMaze(fixed(0.1))
    game.enemies = []
    game.collect('fire')
    game.collect('speed')
    game.press('action')
    tick(game, 121)
    expect(game.lives).toBe(2)
    expect(game.power.speed).toBe(0)
    expect(game.power.fire).toBe(3)
  })
})

describe('Wall Smash', () => {
  it('keeps the ball on the paddle until launch', () => {
    const game = new WallSmash()
    game.tick(new Set(['right']))
    expect(game.stuck).toBe(true)
    game.press('action')
    game.tick(none)
    expect(game.stuck).toBe(false)
    expect(game.ball.vy).toBeLessThan(0)
  })

  it('breaks a brick and scores', () => {
    const game = new WallSmash()
    const brick = game.bricks[game.bricks.length - 1]
    game.stuck = false
    game.ball = { x: brick.x + 4, y: brick.y + brick.h + 1, vx: 0, vy: -2 }
    game.tick(none)
    expect(game.score).toBe(10)
    expect(game.bricks).toHaveLength(49)
  })

  it('loses a life when the ball falls', () => {
    const game = new WallSmash()
    game.stuck = false
    game.ball = { x: 2, y: 179, vx: 0, vy: 3 }
    game.tick(none)
    expect(game.lives).toBe(2)
    expect(game.stuck).toBe(true)
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
