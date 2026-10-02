import type { GameId } from './games'

// Capas em pixel art desenhadas com <rect>, num grid de 48x48.
// `shapeRendering="crispEdges"` mantém os pixels duros em qualquer escala.

type Px = [x: number, y: number, w: number, h: number, fill: string]

const px = (list: Px[]) =>
  list.map(([x, y, w, h, fill], i) => <rect key={i} x={x} y={y} width={w} height={h} fill={fill} />)

function Title({ lines, fill, stroke }: { lines: string[]; fill: string; stroke: string }) {
  return (
    <g
      fontFamily="Anton, Impact, sans-serif"
      fontSize="10"
      textAnchor="middle"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.6"
      paintOrder="stroke"
      style={{ letterSpacing: '0.04em' }}
    >
      {lines.map((line, i) => (
        <text key={line} x="24" y={22 + i * 10}>{line}</text>
      ))}
    </g>
  )
}

function BlockTowerArt() {
  const blocks: Px[] = []
  // Pilha de tetrominós no rodapé, em tons de cinza.
  const rows = ['##.###.###', '#######.##', '##########']
  rows.forEach((row, r) => [...row].forEach((c, i) => {
    if (c === '#') blocks.push([4 + i * 4, 36 + r * 4, 3, 3, r % 2 ? '#9a9a9a' : '#c7c7c7'])
  }))
  return (
    <>
      <rect width="48" height="48" fill="#5b5b5d" />
      {px([
        [6, 4, 3, 3, '#d9d9d9'], [9, 4, 3, 3, '#d9d9d9'], [9, 7, 3, 3, '#d9d9d9'],
        [36, 3, 3, 3, '#bdbdbd'], [36, 6, 3, 3, '#bdbdbd'], [39, 6, 3, 3, '#bdbdbd'],
        ...blocks,
      ])}
      <Title lines={['BLOCK', 'TOWER']} fill="#e6e6e6" stroke="#2b2b2d" />
    </>
  )
}

function GrassSnakeArt() {
  const snake: Px[] = []
  const path = [[4, 40], [8, 40], [12, 40], [12, 36], [16, 36], [20, 36], [24, 36], [24, 40], [28, 40], [32, 40], [36, 40], [36, 36], [40, 36]]
  path.forEach(([x, y]) => snake.push([x, y, 4, 4, '#e8c12c'], [x + 1, y + 1, 2, 2, '#3f8a2a']))
  return (
    <>
      <rect width="48" height="48" fill="#1f3d1c" />
      {px([
        [4, 4, 2, 2, '#e5484d'], [5, 3, 1, 1, '#ffd166'], [40, 8, 2, 2, '#f78fb3'], [41, 7, 1, 1, '#ffd166'],
        [8, 30, 2, 2, '#f78fb3'], [38, 28, 2, 2, '#e5484d'], [20, 4, 2, 2, '#ffd166'],
        ...snake,
        [43, 37, 1, 1, '#111'], [44, 38, 2, 1, '#e5484d'],
      ])}
      <Title lines={['GRASS', 'SNAKE']} fill="#ffcf3d" stroke="#7a2a12" />
    </>
  )
}

function StarPatrolArt() {
  const invader = (x: number, y: number, fill: string): Px[] => [
    [x + 1, y, 4, 1, fill], [x, y + 1, 6, 2, fill], [x, y + 3, 1, 1, fill], [x + 5, y + 3, 1, 1, fill],
  ]
  return (
    <>
      <rect width="48" height="48" fill="#141633" />
      {px([
        [5, 3, 1, 1, '#fff'], [14, 7, 1, 1, '#fff'], [30, 4, 1, 1, '#fff'], [44, 12, 1, 1, '#fff'], [3, 30, 1, 1, '#fff'],
        [36, 3, 5, 5, '#f4e9b8'], [38, 3, 4, 4, '#141633'],
        ...invader(6, 8, '#ff5d73'), ...invader(18, 8, '#ff5d73'), ...invader(30, 8, '#ff5d73'),
        [22, 37, 4, 3, '#4cc9f0'], [23, 35, 2, 2, '#4cc9f0'], [23, 31, 2, 3, '#f4e9b8'],
        [0, 42, 48, 6, '#2a2f6b'], [6, 40, 4, 2, '#2a2f6b'], [32, 39, 6, 3, '#2a2f6b'],
      ])}
      <Title lines={['STAR', 'PATROL']} fill="#ff4d6d" stroke="#fff3c4" />
    </>
  )
}

function SkyHopperArt() {
  return (
    <>
      <rect width="48" height="48" fill="#6cc4f0" />
      {px([
        [4, 6, 10, 3, '#fff'], [6, 4, 6, 2, '#fff'], [30, 9, 12, 3, '#fff'], [33, 7, 6, 2, '#fff'],
        [34, 26, 8, 22, '#3aa64a'], [32, 26, 12, 3, '#2a7d36'],
        [8, 32, 7, 6, '#ffd23f'], [12, 33, 2, 2, '#fff'], [13, 34, 1, 1, '#111'], [15, 35, 3, 2, '#f2742b'], [7, 34, 3, 2, '#f0b429'],
        [0, 44, 48, 4, '#d9b26a'], [0, 43, 48, 1, '#8bc34a'],
      ])}
      <Title lines={['SKY', 'HOPPER']} fill="#fff" stroke="#1d4f91" />
    </>
  )
}

function WallSmashArt() {
  // Muro colorido sendo quebrado, com a bola atravessando e a raquete embaixo.
  const colors = ['#e5484d', '#f2a541', '#ffd23f', '#3aa64a']
  const bricks: Px[] = []
  colors.forEach((fill, r) => {
    for (let c = 0; c < 6; c++) {
      if ((r === 2 && c === 3) || (r === 3 && (c === 2 || c === 3))) continue
      bricks.push([2 + c * 7.5, 3 + r * 4, 6.5, 3, fill])
    }
  })
  return (
    <>
      <rect width="48" height="48" fill="#2b1d4f" />
      {px([
        ...bricks,
        [26, 30, 3, 3, '#fff'], [23, 25, 2, 2, '#ffffff66'],
        [16, 43, 16, 2, '#4cc9f0'],
      ])}
      <Title lines={['WALL', 'SMASH']} fill="#4cc9f0" stroke="#160d2e" />
    </>
  )
}

function BlastMazeArt() {
  // Labirinto visto de cima com uma bomba de pavio aceso no meio da explosão.
  const pillars: Px[] = []
  for (let y = 4; y < 36; y += 8) for (let x = 4; x < 48; x += 8) pillars.push([x, y, 4, 4, '#2d4a3a'])
  return (
    <>
      <rect width="48" height="48" fill="#7bbf6a" />
      {px([
        ...pillars,
        [8, 8, 4, 4, '#b07a43'], [32, 16, 4, 4, '#b07a43'], [16, 24, 4, 4, '#b07a43'],
        [14, 18, 20, 4, '#ffd23f'], [22, 10, 4, 20, '#ffd23f'], [16, 19, 16, 2, '#fff3c4'], [23, 12, 2, 16, '#fff3c4'],
        [20, 16, 8, 8, '#171717'], [21, 17, 2, 2, '#555'], [26, 13, 1, 3, '#b07a43'], [26, 12, 2, 1, '#e5484d'],
      ])}
      <Title lines={['BLAST', 'MAZE']} fill="#ffd23f" stroke="#7a2a12" />
    </>
  )
}

function RockStormArt() {
  // Espaço profundo, pedras cinzentas e a nave atirando.
  return (
    <>
      <rect width="48" height="48" fill="#0d1b2a" />
      {px([
        [3, 4, 1, 1, '#fff'], [40, 6, 1, 1, '#fff'], [20, 2, 1, 1, '#fff'], [44, 40, 1, 1, '#fff'], [6, 42, 1, 1, '#fff'],
        [4, 28, 10, 8, '#8d99ae'], [6, 26, 6, 2, '#8d99ae'], [6, 36, 7, 2, '#8d99ae'], [7, 30, 2, 2, '#5c677d'],
        [34, 26, 8, 7, '#8d99ae'], [35, 24, 5, 2, '#8d99ae'], [37, 28, 2, 2, '#5c677d'],
        [26, 38, 5, 4, '#8d99ae'],
        [21, 36, 6, 2, '#e0fbfc'], [22, 34, 4, 2, '#e0fbfc'], [23, 32, 2, 2, '#e0fbfc'], [23, 38, 2, 2, '#ff9f1c'],
        [23, 27, 2, 2, '#ffd23f'], [23, 22, 2, 2, '#ffd23f'],
      ])}
      <Title lines={['ROCK', 'STORM']} fill="#e0fbfc" stroke="#3d5a80" />
    </>
  )
}

const ART: Record<GameId, () => React.JSX.Element> = {
  'rock-storm': RockStormArt,
  'blast-maze': BlastMazeArt,
  'wall-smash': WallSmashArt,
  'sky-hopper': SkyHopperArt,
  'block-tower': BlockTowerArt,
  'grass-snake': GrassSnakeArt,
  'star-patrol': StarPatrolArt,
}

export function CartridgeArt({ id }: { id: GameId }) {
  const Art = ART[id]
  return (
    <svg viewBox="0 0 48 48" shapeRendering="crispEdges" className="block size-full" aria-hidden="true">
      <Art />
    </svg>
  )
}
