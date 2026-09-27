// Livros recomendados na página /books.
//
// Aqui fica só o que NÃO muda com o idioma: a capa e o link de compra.
// Título e autor são traduzidos — ficam em `books.items.<id>` nos dois
// locales (src/locales/pt-BR.ts e src/locales/en.ts), e o build falha se
// faltar em um deles.
//
// Para adicionar um livro:
//   1. inclua o id na union abaixo
//   2. adicione o objeto em `books`
//   3. escreva título e autor em `books.items.<id>` nos DOIS locales
export type Book = {
  id: 'pragmatico'
  image: string
  amazonLink: string
}

export const books: Book[] = [
  {
    id: 'pragmatico',
    image: '/books/programador-pragmatico.jpg',
    // Busca comum, sem link de afiliado.
    amazonLink: 'https://www.amazon.com.br/s?k=o+programador+pragm%C3%A1tico',
  },
]
