// Certificados exibidos na página "Sobre".
//
// Gerado a partir da exportação do LinkedIn (docs/XP.json na raiz do
// workspace), com estes ajustes:
//   - URL real extraída do redirecionador `linkedin.com/safety/go`
//   - fora: links com e-mail pessoal e links fracos (prnt.sc, Google Drive)
//   - duplicados mantidos uma vez só, preferindo o link do Coursera/Harvard
//
// `featured` aparece em card; o resto vai na lista agrupada por emissor.
export type Certification = {
  name: string
  issuer: string
  /** Ano e mês, `YYYY-MM`. */
  issuedAt: string
  url: string
  featured?: boolean
}

export const certifications: Certification[] = [
  { name: 'NLW Journey - Csharp', issuer: 'Rocketseat', issuedAt: '2024-07', url: 'https://app.rocketseat.com.br/certificates/bd68e399-e6c9-4591-aa61-0404ea1b220c', featured: true },
  { name: 'Propriedades, Métodos e Construtores com C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/8R41EOHY/share' },
  { name: 'Manipulando Valores com C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/L4NFJ6CK/share' },
  { name: 'Introdução ao .NET', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/HIDGKKZ0/share' },
  { name: 'Introdução as IDEs e Configuração de Ambiente .NET', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/WTSNANEC/share' },
  { name: 'Sintaxe e Tipos de Dados em C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/J3KVS777/share' },
  { name: 'Tipos de Operadores em C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/MTWQDWEB/share' },
  { name: 'Operadores Aritméticos em C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/Z9CDM5SP/share' },
  { name: 'Conhecendo as Estruturas de Repetição em C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/JBA4O2JA/share' },
  { name: 'Array e Listas em C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/F85BVIGA/share' },
  { name: 'Conhecendo a Organização de um Programa C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/MWJANCIR/share' },
  { name: 'Construindo um Sistema para um Estacionamento com C#', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/5Q3OUYV6/share' },
  { name: 'Desafios de Código: Aperfeiçoe Sua Lógica e Pensamento Computacional', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/PZD1E5RJ/share' },
  { name: 'Fundamentos do .NET', issuer: 'DIO', issuedAt: '2024-04', url: 'https://www.dio.me/certificate/NEJLYRQT/share' },
  { name: 'Django: templates e boas práticas 2023', issuer: 'Alura', issuedAt: '2023-05', url: 'https://cursos.alura.com.br/certificate/a467fc90-0c6d-49c2-adc9-354a0371ea53' },
  { name: 'Go: desenvolvendo uma API Rest', issuer: 'Alura', issuedAt: '2023-02', url: 'https://cursos.alura.com.br/certificate/3d1a9f7a-b206-4ecf-8069-69265456dca1' },
  { name: 'Go: crie uma aplicação web', issuer: 'Alura', issuedAt: '2023-02', url: 'https://cursos.alura.com.br/certificate/83c6d15c-0994-4b14-9464-f9b9bba91801' },
  { name: 'API com Django 3: Versionamento, cabeçalhos e CORS', issuer: 'Alura', issuedAt: '2023-02', url: 'https://cursos.alura.com.br/certificate/bfa92ca2-8cf7-4ffa-9e9e-b24d88ad38dd' },
  { name: 'Go: Orientação a Objetos', issuer: 'Alura', issuedAt: '2023-02', url: 'https://cursos.alura.com.br/certificate/66cd1ccc-b2db-437d-840e-06c357cb0593' },
  { name: 'Go: a linguagem do Google', issuer: 'Alura', issuedAt: '2023-01', url: 'https://cursos.alura.com.br/certificate/b234707c-4c0e-4e38-98a6-429d33b65fd3' },
  { name: 'API com Django 3: Validações, buscas, filtros e deploy', issuer: 'Alura', issuedAt: '2023-01', url: 'https://cursos.alura.com.br/certificate/3196ed3c-03ee-444c-a4e5-c9de312878b3' },
  { name: 'Orientação a Objetos com C++: trabalhando com herança', issuer: 'Alura', issuedAt: '2022-12', url: 'https://cursos.alura.com.br/certificate/e46d879e-e000-4b8d-8621-00406b3faf6d' },
  { name: 'Orientação a Objetos com C++: Classes, métodos e atributos', issuer: 'Alura', issuedAt: '2022-11', url: 'https://cursos.alura.com.br/certificate/ad5d63d9-88b6-4ad5-b4ca-ea3217358031' },
  { name: 'Avançando com C++: entenda melhor a linguagem', issuer: 'Alura', issuedAt: '2022-11', url: 'https://cursos.alura.com.br/certificate/89887d01-9920-4ea5-bd86-8960ee19c977' },
  { name: 'C++: Conhecendo a linguagem e a STL', issuer: 'Alura', issuedAt: '2022-11', url: 'https://cursos.alura.com.br/certificate/784c44e7-b4f3-4ae9-8d13-b28fecc42da5' },
  { name: 'C: recursos avançados da linguagem', issuer: 'Alura', issuedAt: '2022-10', url: 'https://cursos.alura.com.br/certificate/fa8109f7-3fd1-40e3-a097-5231e8bfc849' },
  { name: 'C: conhecendo a Linguagem das Linguagens', issuer: 'Alura', issuedAt: '2022-10', url: 'https://cursos.alura.com.br/certificate/0eb4fb07-94ba-428a-a34c-d0ed41793a93' },
  { name: 'C: avançando na linguagem', issuer: 'Alura', issuedAt: '2022-10', url: 'https://cursos.alura.com.br/certificate/781e0847-0cbe-43c6-a3a2-52aace3a4fab' },
  { name: 'Formação Django', issuer: 'Alura', issuedAt: '2022-09', url: 'https://cursos.alura.com.br/degree/certificate/99c7ccd7-bc2e-46a5-a39b-472f4d23cd3b', featured: true },
  { name: 'API com Django 3: Django Rest Framework', issuer: 'Alura', issuedAt: '2022-09', url: 'https://cursos.alura.com.br/certificate/cf5694cd-a79d-4bf8-bf9d-7a93a825f9e4' },
  { name: "CS50x: CS50's Introduction to Computer Science", issuer: 'HarvardX', issuedAt: '2022-09', url: 'https://cs50.harvard.edu/certificates/51bede6a-51da-4b34-9e2b-4605668b152d', featured: true },
  { name: 'TDD no Django 3: Desenvolvimento guiado por testes', issuer: 'Alura', issuedAt: '2022-09', url: 'https://cursos.alura.com.br/certificate/47efffec-ea3b-4769-a679-460df40648c2' },
  { name: 'Autenticação no Django: formulários, requisições e mensagens', issuer: 'Alura', issuedAt: '2022-09', url: 'https://cursos.alura.com.br/certificate/5ab2ff1f-2cfc-42e9-b780-9eff3851f10b' },
  { name: 'Boas práticas no Django: apps, pastas e paginação', issuer: 'Alura', issuedAt: '2022-09', url: 'https://cursos.alura.com.br/certificate/6f8b5a15-8247-45e2-8b95-9e130285ba9b' },
  { name: 'Integração de modelos no Django: Filtros, buscas e admin', issuer: 'Alura', issuedAt: '2022-09', url: 'https://cursos.alura.com.br/certificate/a68bb2f2-1eac-4eff-a984-7c7de6cc6084' },
  { name: 'Django: modelo, rotas e views', issuer: 'Alura', issuedAt: '2022-08', url: 'https://cursos.alura.com.br/certificate/14af6833-454c-4129-8e83-f9c3cc16bf8a' },
  { name: 'HTTP: Entendendo a web por baixo dos panos', issuer: 'Alura', issuedAt: '2022-08', url: 'https://cursos.alura.com.br/certificate/03a889cc-8120-47cc-b96e-ad390f566154' },
  { name: 'Inovahack Cagepa hackathon', issuer: 'OPENCADD Advanced Technology', issuedAt: '2022-07', url: 'https://organizador.sympla.com.br/baixar-certificado/WQYpa41SFcoPA9HekOyRnYMYytQabSBExJIXp_lwz2Q', featured: true },
  { name: 'Flask: crie uma webapp com Python', issuer: 'Alura', issuedAt: '2022-07', url: 'https://cursos.alura.com.br/certificate/bfa0d3fa-4bf2-4ad1-8b11-4f45940b00d0' },
  { name: 'Docker: criando e gerenciando containers', issuer: 'Alura', issuedAt: '2022-07', url: 'https://cursos.alura.com.br/certificate/22eeaa0a-0cd9-412b-b4a0-7e48bbbe7f78' },
  { name: 'SQL com MySQL: manipule e consulte dados', issuer: 'Alura', issuedAt: '2022-07', url: 'https://cursos.alura.com.br/certificate/113db1c1-14a5-48dd-a4a2-b8983cfa6ccd' },
  { name: 'Formação Python e orientação a objetos', issuer: 'Alura', issuedAt: '2022-06', url: 'https://cursos.alura.com.br/degree/certificate/6f8042dd-c415-473a-b09e-9fa3f2fae2d2' },
  { name: 'Python Brasil: validação de dados no padrão nacional', issuer: 'Alura', issuedAt: '2022-06', url: 'https://cursos.alura.com.br/certificate/4b447118-fb23-4a26-9dcb-147ac3fd0cd4' },
  { name: 'Python Collections parte 2: conjuntos e dicionários', issuer: 'Alura', issuedAt: '2022-06', url: 'https://cursos.alura.com.br/certificate/ce1a65dd-1fea-43ec-ba4c-ab5da705de2b' },
  { name: 'Python Collections parte 1: listas e tuplas', issuer: 'Alura', issuedAt: '2022-06', url: 'https://cursos.alura.com.br/certificate/502f216f-cbdd-4021-a724-07c382b7fcdd' },
  { name: 'String em Python: extraindo informações de uma URL', issuer: 'Alura', issuedAt: '2022-06', url: 'https://cursos.alura.com.br/certificate/123d4df2-2a5a-49a3-8d18-f8ca75865d2c' },
  { name: 'Python 3: avançando na orientação a objetos', issuer: 'Alura', issuedAt: '2022-06', url: 'https://cursos.alura.com.br/certificate/13c76630-f6e4-4655-aa61-8ce4df8084f4' },
  { name: 'Python 3: Entendendo a Orientação a objetos', issuer: 'Alura', issuedAt: '2022-05', url: 'https://cursos.alura.com.br/certificate/0673c083-439e-4769-a93c-7641ff9afeea' },
  { name: 'Python 3 parte 2: avançando na linguagem', issuer: 'Alura', issuedAt: '2022-05', url: 'https://cursos.alura.com.br/certificate/68cdd95c-418d-479b-a61a-6fd9047be0e6' },
  { name: 'Python 3 parte 1: Trabalhando com a nova versão da linguagem', issuer: 'Alura', issuedAt: '2022-05', url: 'https://cursos.alura.com.br/certificate/fb9df863-0c46-43d2-a78f-677db248316f' },
  { name: 'Linux I: conhecendo e utilizando o terminal', issuer: 'Alura', issuedAt: '2022-05', url: 'https://cursos.alura.com.br/certificate/1a207b4b-6cdf-4230-89ef-da181019f737' },
  { name: 'OKR: construindo metas ágeis', issuer: 'Alura', issuedAt: '2022-05', url: 'https://cursos.alura.com.br/certificate/9dc3bedb-33e6-4811-b7f3-afe90a5d2bde' },
  { name: 'Princípios do trabalho em equipe: relações colaborativas', issuer: 'Alura', issuedAt: '2022-05', url: 'https://cursos.alura.com.br/certificate/2a670816-1446-4f02-b00d-36074a96fad1' },
  { name: 'Certificação em Liderança saudável: transformando pessoas e empresas', issuer: 'Developer AI', issuedAt: '2022-03', url: 'https://api.accredible.com/v1/frontend/credential_website_embed_image/certificate/48808880' },
  { name: 'JavaScript: programando na linguagem da web', issuer: 'Alura', issuedAt: '2022-03', url: 'https://cursos.alura.com.br/certificate/18067fe2-a23b-40f0-bd79-06777be6210e' },
  { name: 'Comunicação não violenta parte 2: mantendo a empatia', issuer: 'Alura', issuedAt: '2022-03', url: 'https://cursos.alura.com.br/certificate/ec75ea30-697c-4269-abc1-572938b0dae6' },
  { name: 'Comunicação não violenta: consciência para agir', issuer: 'Alura', issuedAt: '2022-03', url: 'https://cursos.alura.com.br/certificate/911c0c29-661a-4954-8121-bcef2900d5af' },
  { name: 'Scrum: Agilidade em seu projeto', issuer: 'Alura', issuedAt: '2022-03', url: 'https://cursos.alura.com.br/certificate/e0d96813-d0f9-4259-bda9-ba98ec5343df' },
  { name: 'Fundamentos do JavaScript: Arrays', issuer: 'Alura', issuedAt: '2022-03', url: 'https://cursos.alura.com.br/certificate/b3e0d575-0e58-4acc-9e63-b307c5cc464c' },
  { name: 'Fundamentos do JavaScript: Tipos, variáveis e funções', issuer: 'Alura', issuedAt: '2022-02', url: 'https://cursos.alura.com.br/certificate/47ca3fb4-c3bb-44bb-a103-6170fefc2f16' },
  { name: 'HTML5 e CSS3 parte 4: Avançando no CSS', issuer: 'Alura', issuedAt: '2022-02', url: 'https://cursos.alura.com.br/certificate/e2ae314a-2963-45a1-876d-da35d4b60472' },
  { name: 'HTML5 e CSS3 parte 3: Trabalhando com formulários e tabelas', issuer: 'Alura', issuedAt: '2022-02', url: 'https://cursos.alura.com.br/certificate/858a4740-8f7b-4272-9c7e-3ac6753d522a' },
  { name: 'HTML5 e CSS3 parte 2: Posicionamento, listas e navegação', issuer: 'Alura', issuedAt: '2022-02', url: 'https://cursos.alura.com.br/certificate/84e2c852-95b5-47bd-8dcf-0348f916ae79' },
  { name: 'HTML5 e CSS3 parte 1: A primeira página da Web', issuer: 'Alura', issuedAt: '2022-02', url: 'https://cursos.alura.com.br/certificate/08fd92bf-0f70-4fa8-86f9-357cbdd18322' },
  { name: 'Git e Github: Estratégias de ramificação, Conflitos e Pull Requests', issuer: 'Alura', issuedAt: '2022-01', url: 'https://cursos.alura.com.br/certificate/323b6960-d89a-4a52-8961-00f91fdad23b' },
  { name: 'Python Basics', issuer: 'Ada', issuedAt: '2021-11', url: 'https://certificates-prd.s3.sa-east-1.amazonaws.com/ifood-python-basics-dac39b25-e6be-4d79-a6b3-2430c1b83fe8.pdf' },
  { name: 'Mathematical Thinking in Computer Science', issuer: 'Coursera', issuedAt: '2021-04', url: 'https://www.coursera.org/account/accomplishments/certificate/U8DNKH6EEFSJ' },
  { name: 'Crash Course on Python', issuer: 'Coursera', issuedAt: '2021-04', url: 'https://www.coursera.org/account/accomplishments/certificate/NKHJXXFKRA3C' },
  { name: 'Python for Data Science and AI', issuer: 'Coursera', issuedAt: '2021-04', url: 'https://www.credly.com/badges/7cfb9d1d-2741-4f97-9d8b-013ce70e335e' },
  { name: 'Python for Data Science, AI & Development', issuer: 'Coursera', issuedAt: '2021-03', url: 'https://www.coursera.org/account/accomplishments/certificate/SVFJ62Y5THTX' },
  { name: 'Cybersecurity Roles, Processes & Operating System Security', issuer: 'Coursera', issuedAt: '2021-03', url: 'https://www.coursera.org/account/accomplishments/certificate/AHDJUTR5GRL5' },
  { name: 'Data Science Methodology', issuer: 'Coursera', issuedAt: '2021-02', url: 'https://www.coursera.org/account/accomplishments/certificate/HMSLXHVDGY9M' },
  { name: 'Tools for Data Science', issuer: 'Coursera', issuedAt: '2021-01', url: 'https://www.coursera.org/account/accomplishments/certificate/ZBNKHXK9RJ2K' },
  { name: 'Cybersecurity Compliance Framework & System Administration', issuer: 'Coursera', issuedAt: '2021-01', url: 'https://www.coursera.org/account/accomplishments/certificate/BRLRFB6ED48R' },
  { name: 'Data Science Orientation', issuer: 'Coursera', issuedAt: '2020-12', url: 'https://www.credly.com/badges/824ca5b8-28ef-4601-979b-722ae7557aa6' },
  { name: 'What is Data Science?', issuer: 'Coursera', issuedAt: '2020-12', url: 'https://www.coursera.org/account/accomplishments/certificate/L3LW6VD8AQJG' },
  { name: 'Python for Everybody', issuer: 'Coursera', issuedAt: '2020-11', url: 'https://www.coursera.org/account/accomplishments/specialization/certificate/KKWUGLDZV9N6', featured: true },
  { name: 'Using Databases with Python', issuer: 'Coursera', issuedAt: '2020-11', url: 'https://www.coursera.org/account/accomplishments/certificate/AVVVSEZAF4RH' },
  { name: 'Capstone: Retrieving, Processing, and Visualizing Data with Python', issuer: 'Coursera', issuedAt: '2020-11', url: 'https://www.coursera.org/account/accomplishments/certificate/PU38NMDN89AM' },
  { name: 'Using Python to Access Web Data', issuer: 'Coursera', issuedAt: '2020-11', url: 'https://www.coursera.org/account/accomplishments/certificate/JK2J78FAY6Y3' },
  { name: 'Python Data Structures', issuer: 'Coursera', issuedAt: '2020-11', url: 'https://www.coursera.org/account/accomplishments/certificate/M4KGYAFHM9UE' },
  { name: 'Aprendendo a aprender: ferramentas mentais poderosas para ajudá-lo a dominar assuntos difíceis (em Português) [Learning How to Learn]', issuer: 'Coursera', issuedAt: '2020-10', url: 'https://www.coursera.org/account/accomplishments/certificate/RR8SMPAVWFUC' },
  { name: 'Programming for Everybody (Getting Started with Python)', issuer: 'Coursera', issuedAt: '2020-10', url: 'https://www.coursera.org/account/accomplishments/certificate/545ARUCZFASJ' },
  { name: 'Introdução à Ciência da Computação com Python Parte 2', issuer: 'Coursera', issuedAt: '2020-09', url: 'https://www.coursera.org/account/accomplishments/certificate/22MXQGBNNZ2V', featured: true },
  { name: 'Introdução à Ciência da Computação com Python Parte 1', issuer: 'Coursera', issuedAt: '2020-08', url: 'https://www.coursera.org/account/accomplishments/certificate/ZF5BLKXGALXQ', featured: true },
  { name: 'HTML - Básico', issuer: 'Fundação Bradesco', issuedAt: '2020-06', url: 'https://lms.ev.org.br/mpls/Web/Lms/Student/PrintCertificateDialog.aspx?Z3QxKwCClpQKQpdgQ%2bG2xUevQJTRvHpQ' },
]

export const featuredCertifications = certifications.filter((certification) => certification.featured)

/** Linguagem (ícone do devicon) ou ícone genérico do lucide quando não há uma. */
export type HighlightIcon = 'C' | 'Python' | 'Django' | 'CSharp' | 'trophy' | 'code'

export type CertificationHighlight = {
  /** Chave da frase em `about.highlights.<id>` nos locales. */
  id: 'cs50' | 'inovahack' | 'usp' | 'py4e' | 'django' | 'nlw'
  name: string
  issuer: string
  issuedAt: string
  icon: HighlightIcon
  /** Mais de uma URL = curso em partes; o card mostra um link por parte. */
  urls: string[]
}

function byName(name: string) {
  const certification = certifications.find((item) => item.name === name && item.featured)
  if (!certification) throw new Error(`Destaque sem certificado correspondente: ${name}`)
  return certification
}

const uspPart1 = byName('Introdução à Ciência da Computação com Python Parte 1')
const uspPart2 = byName('Introdução à Ciência da Computação com Python Parte 2')

/** Os cards do topo: 6 destaques, com as duas partes da USP num card só. */
export const certificationHighlights: CertificationHighlight[] = [
  { id: 'cs50', ...pick(byName("CS50x: CS50's Introduction to Computer Science")), name: 'CS50x', icon: 'C' },
  { id: 'inovahack', ...pick(byName('Inovahack Cagepa hackathon')), name: 'Inovahack Cagepa', icon: 'trophy' },
  {
    id: 'usp',
    name: 'Introdução à Ciência da Computação com Python',
    issuer: 'USP · Coursera',
    issuedAt: uspPart2.issuedAt,
    icon: 'Python',
    urls: [uspPart1.url, uspPart2.url],
  },
  { id: 'py4e', ...pick(byName('Python for Everybody')), icon: 'Python' },
  { id: 'django', ...pick(byName('Formação Django')), icon: 'Django' },
  { id: 'nlw', ...pick(byName('NLW Journey - Csharp')), name: 'NLW Journey C#', icon: 'CSharp' },
]

function pick({ name, issuer, issuedAt, url }: Certification) {
  return { name, issuer, issuedAt, urls: [url] }
}

/** Os demais, agrupados por emissor — grupos maiores primeiro, datas mais recentes primeiro. */
export const certificationsByIssuer = Object.entries(
  certifications
    .filter((certification) => !certification.featured)
    .reduce<Record<string, Certification[]>>((groups, certification) => {
      ;(groups[certification.issuer] ??= []).push(certification)
      return groups
    }, {}),
).sort(([, a], [, b]) => b.length - a.length)
