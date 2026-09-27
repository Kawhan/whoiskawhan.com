export type Author = {
  username: string
  name: string
  avatar: string
  bio: string
}

export const authors: Record<string, Author> = {
  kawhan: {
    username: 'kawhan',
    name: 'Kawhan Laurindo de Lima',
    avatar: '/profile/kawhan.jpg',
    bio: 'Engenheiro de software com foco em back-end .NET, sistemas industriais e arquitetura orientada a eventos.',
  },
}

export function getAuthorByUsername(username: string): Author | undefined {
  return authors[username]
}
