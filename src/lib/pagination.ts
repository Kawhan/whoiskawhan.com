// Paginação no cliente, compartilhada por blog, TIL e portfólio.

export type PaginatedItems<T> = {
  items: T[]
  currentPage: number
  totalPages: number
  totalItems: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

/** Fatia `items` na página pedida. Página inválida ou fora do intervalo cai na mais próxima. */
export function paginate<T>(items: T[], requestedPage: number, perPage: number): PaginatedItems<T> {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const currentPage = Math.min(
    Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1),
    totalPages,
  )
  const start = (currentPage - 1) * perPage

  return {
    items: items.slice(start, start + perPage),
    currentPage,
    totalPages,
    totalItems,
    hasPreviousPage: currentPage > 1,
    hasNextPage: currentPage < totalPages,
  }
}
