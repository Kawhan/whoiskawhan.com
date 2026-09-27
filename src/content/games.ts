// Jogos exibidos na página /hobbies, em duas galerias.
//
// Título de jogo é nome próprio e NÃO é traduzido — por isso mora aqui e não
// nos locales. Os títulos das duas seções sim são traduzidos
// (`hobbies.nowPlayingTitle` e `hobbies.allTimeTitle`).
//
// `image` é opcional: sem capa, o card mostra só o texto. As capas ficam em
// `public/games/` e devem ser quadradas.
export type Game = {
  title: string
  /** Linha pequena acima do título: plataforma, horas, estado. Opcional. */
  meta?: string
  /** Caminho em public/, ex: '/games/dragonwilds.jpg'. Opcional. */
  image?: string
}

/** O que está rodando agora. Mantenha curto — 1 a 3 jogos. */
export const nowPlaying: Game[] = [
  { title: 'RuneScape: Dragonwilds' },
]

/** Os que marcaram. Lista estável, muda raramente. */
export const allTimeGames: Game[] = [
  { title: 'Red Dead Redemption 2' },
  { title: 'ARC Raiders' },
  { title: 'Path of Exile 2' },
]
