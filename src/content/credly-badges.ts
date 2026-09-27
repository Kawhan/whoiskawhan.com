// Badges exibidas na página "Sobre".
//
// A lista está vazia porque seu CV não cita nenhuma credencial no Credly.
// Duas opções:
//   a) você tem perfil no Credly → preencha aqui (nome, emissor, imagem, url)
//   b) não tem → dá para reaproveitar a seção para prêmios e cursos reais
//      (42 São Paulo, INOVA HACK CAGEPA, Láurea Acadêmica UFPB, CS50x)
//
// Enquanto estiver vazia, a seção de badges não renderiza.
export type CredlyBadge = {
  name: string
  issuer: string
  image: string
  url: string
  issuedAt: string
}

export const credlyBadges: CredlyBadge[] = []
