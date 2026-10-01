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

function BrickStackArt() {
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
      <Title lines={['BRICK', 'STACK']} fill="#e6e6e6" stroke="#2b2b2d" />
    </>
  )
}

function GardenSnakeArt() {
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
      <Title lines={['GARDEN', 'SNAKE']} fill="#ffcf3d" stroke="#7a2a12" />
    </>
  )
}

function NightPatrolArt() {
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
      <Title lines={['NIGHT', 'PATROL']} fill="#ff4d6d" stroke="#fff3c4" />
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

const ART: Record<GameId, () => React.JSX.Element> = {
  'sky-hopper': SkyHopperArt,
  'brick-stack': BrickStackArt,
  'garden-snake': GardenSnakeArt,
  'night-patrol': NightPatrolArt,
}

export function CartridgeArt({ id }: { id: GameId }) {
  const Art = ART[id]
  return (
    <svg viewBox="0 0 48 48" shapeRendering="crispEdges" className="block size-full" aria-hidden="true">
      <Art />
    </svg>
  )
}
