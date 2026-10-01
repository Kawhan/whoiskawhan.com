// Projetos exibidos na home e no portfolio.
//
// Para adicionar um projeto:
//   1. inclua o id na union `OpenSourceProject['id']`
//   2. adicione o objeto em `openSourceProjects`
//   3. escreva a descrição em `openSource.projects.<id>` e o detalhe em
//      `openSource.details.<id>` nos DOIS locales
//      (src/locales/pt-BR.ts e src/locales/en.ts) — o build falha se faltar
export type OpenSourceProject = {
  id:
    | 'salesProject'
    | 'goodHamburger'
    | 'springMicroservices'
    | 'opportunity'
    | 'libft'
    | 'journeyApi'
    | 'pokedexAngular'
    | 'controleContatos'
  name: string
  repo: string
  docs: string
  technologies: Array<
    | 'Java'
    | 'Spring'
    | 'Go'
    | 'Docker'
    | 'Rust'
    | 'Python'
    | 'C'
    | 'CSharp'
    | 'DotNet'
    | 'PostgreSQL'
    | 'MySQL'
    | 'Django'
    | 'Angular'
    | 'TypeScript'
    | 'RabbitMQ'
  >
  year: string
  /** Caminho em public/, ex: '/projects/opportunity.png'. Opcional: sem logo, o card da home mostra um ícone genérico. */
  logo?: string
  /** Aparece na home. Os destaques vêm primeiro no array; o portfólio lista todos. */
  featured?: boolean
}

export const openSourceProjects: OpenSourceProject[] = [
  {
    id: 'salesProject',
    name: 'Sales Project',
    repo: 'https://github.com/Kawhan/SalesProjectNET',
    docs: 'https://github.com/Kawhan/SalesProjectNET#readme',
    technologies: ['CSharp', 'DotNet', 'PostgreSQL', 'RabbitMQ', 'Docker'],
    year: '2026',
    logo: '/projects/generic.png',
    featured: true,
  },
  {
    id: 'goodHamburger',
    name: 'Good Hamburger',
    repo: 'https://github.com/Kawhan/GoodHamburgerTEST',
    docs: 'https://github.com/Kawhan/GoodHamburgerTEST#readme',
    technologies: ['CSharp', 'DotNet', 'PostgreSQL', 'Docker'],
    year: '2026',
    logo: '/projects/generic.png',
    featured: true,
  },
  {
    id: 'springMicroservices',
    name: 'Opportunity Microservices',
    repo: 'https://github.com/Kawhan/SpringMicroservices',
    docs: 'https://github.com/Kawhan/SpringMicroservices#readme',
    technologies: ['Java', 'Spring', 'Docker'],
    year: '2023',
    logo: '/projects/opportunity.png',
    featured: true,
  },
  {
    id: 'opportunity',
    name: 'Opportunity',
    repo: 'https://github.com/Kawhan/opportunity',
    docs: 'https://github.com/Kawhan/opportunity#readme',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    year: '2022',
    logo: '/projects/opportunity.png',
    featured: true,
  },
  {
    id: 'libft',
    name: 'libft',
    repo: 'https://github.com/Kawhan/libft_c',
    docs: 'https://github.com/Kawhan/libft_c#readme',
    technologies: ['C'],
    year: '2022',
    logo: '/projects/generic.png',
    featured: true,
  },
  {
    id: 'journeyApi',
    name: 'NLW Journey API',
    repo: 'https://github.com/Kawhan/NLW_JOURNEY_.NET_API',
    docs: 'https://github.com/Kawhan/NLW_JOURNEY_.NET_API#readme',
    technologies: ['CSharp', 'DotNet'],
    year: '2024',
    logo: '/projects/generic.png',
    featured: true,
  },
  {
    id: 'pokedexAngular',
    name: 'Pokédex Angular',
    repo: 'https://github.com/Kawhan/pokedex-angular',
    docs: 'https://github.com/Kawhan/pokedex-angular#readme',
    technologies: ['Angular', 'TypeScript'],
    year: '2026',
    logo: '/projects/generic.png',
  },
  {
    id: 'controleContatos',
    name: 'Controle de Contatos',
    repo: 'https://github.com/Kawhan/controleContatos.NetMVC',
    docs: 'https://github.com/Kawhan/controleContatos.NetMVC#readme',
    technologies: ['CSharp', 'DotNet', 'MySQL'],
    year: '2024',
    logo: '/projects/generic.png',
  },
]

export const featuredProjects = openSourceProjects.filter((project) => project.featured)

export const PROJECTS_PER_PAGE = 6

/** Link para uma página da lista de projetos do portfólio, ancorado na seção. */
export function portfolioProjectsPath(page: number) {
  return `/portfolio${page > 1 ? `?page=${page}` : ''}#projects`
}

const devicon = (path: string) => `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${path}`

export const technologyIcons: Record<OpenSourceProject['technologies'][number], string> = {
  Java: devicon('java/java-original.svg'),
  Spring: devicon('spring/spring-original.svg'),
  Go: devicon('go/go-original-wordmark.svg'),
  Docker: devicon('docker/docker-original.svg'),
  Rust: devicon('rust/rust-original.svg'),
  Python: devicon('python/python-original.svg'),
  C: devicon('c/c-original.svg'),
  CSharp: devicon('csharp/csharp-original.svg'),
  DotNet: devicon('dotnetcore/dotnetcore-original.svg'),
  PostgreSQL: devicon('postgresql/postgresql-original.svg'),
  MySQL: devicon('mysql/mysql-original.svg'),
  Django: devicon('django/django-plain.svg'),
  Angular: devicon('angular/angular-original.svg'),
  TypeScript: devicon('typescript/typescript-original.svg'),
  RabbitMQ: devicon('rabbitmq/rabbitmq-original.svg'),
}
