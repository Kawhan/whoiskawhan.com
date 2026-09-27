// Projetos exibidos na home e no portfolio.
//
// Para adicionar um projeto:
//   1. inclua o id na union `OpenSourceProject['id']`
//   2. adicione o objeto em `openSourceProjects`
//   3. escreva a descrição em `openSource.projects.<id>` nos DOIS locales
//      (src/locales/pt-BR.ts e src/locales/en.ts) — o build falha se faltar
export type OpenSourceProject = {
  id: 'springMicroservices' | 'opportunity' | 'libft' | 'controleContatos' | 'journeyApi'
  name: string
  repo: string
  docs: string
  technologies: Array<
    'Java' | 'Spring' | 'Go' | 'Docker' | 'Rust' | 'Python' | 'C' | 'CSharp' | 'DotNet' | 'PostgreSQL' | 'MySQL' | 'Django'
  >
  year: string
}

export const openSourceProjects: OpenSourceProject[] = [
  {
    id: 'springMicroservices',
    name: 'Opportunity Microservices',
    repo: 'https://github.com/Kawhan/SpringMicroservices',
    docs: 'https://github.com/Kawhan/SpringMicroservices#readme',
    technologies: ['Java', 'Spring', 'Docker'],
    year: '2023',
  },
  {
    id: 'opportunity',
    name: 'Opportunity',
    repo: 'https://github.com/Kawhan/opportunity',
    docs: 'https://github.com/Kawhan/opportunity#readme',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    year: '2022',
  },
  {
    id: 'journeyApi',
    name: 'NLW Journey API',
    repo: 'https://github.com/Kawhan/NLW_JOURNEY_.NET_API',
    docs: 'https://github.com/Kawhan/NLW_JOURNEY_.NET_API#readme',
    technologies: ['CSharp', 'DotNet'],
    year: '2024',
  },
  {
    id: 'controleContatos',
    name: 'Controle de Contatos',
    repo: 'https://github.com/Kawhan/controleContatos.NetMVC',
    docs: 'https://github.com/Kawhan/controleContatos.NetMVC#readme',
    technologies: ['CSharp', 'DotNet', 'MySQL'],
    year: '2024',
  },
  {
    id: 'libft',
    name: 'libft',
    repo: 'https://github.com/Kawhan/libft_c',
    docs: 'https://github.com/Kawhan/libft_c#readme',
    technologies: ['C'],
    year: '2022',
  },
]

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
}
