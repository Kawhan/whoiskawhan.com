import { Button } from './button'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.4-4-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.36-1.85c3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13Zm1.78 13.02H3.56V9h3.56v11.45ZM22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
    </svg>
  )
}

function SteamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.98 0C5.67 0 .5 4.87 0 11.06l6.44 2.66a3.4 3.4 0 0 1 1.92-.6l2.86-4.14v-.06a4.55 4.55 0 1 1 4.55 4.56h-.11l-4.08 2.9v.23a3.42 3.42 0 0 1-6.78.66L.12 15.09A12 12 0 1 0 11.98 0Zm-4.4 18.2-1.48-.61a2.56 2.56 0 0 0 4.4-1.18 2.56 2.56 0 0 0-3.5-2.65l1.53.63a1.88 1.88 0 1 1-1.44 3.48l.49.33Zm11.23-8.66a3.03 3.03 0 1 0-6.07 0 3.03 3.03 0 0 0 6.07 0Zm-5.31 0a2.28 2.28 0 1 1 4.56 0 2.28 2.28 0 0 1-4.56 0Z" />
    </svg>
  )
}

// Para adicionar uma rede: desenhe o ícone SVG acima e inclua a entrada aqui.
// Os ícones de Substack, YouTube e Dribbble continuam no arquivo, sem uso,
// caso você queira essas redes depois.
const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/Kawhan', Icon: GithubIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kawhan/', Icon: LinkedinIcon },
  { label: 'Steam', href: 'https://steamcommunity.com/profiles/76561198841570916/', Icon: SteamIcon },
]

export function SocialLinks({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {socialLinks.map(({ label, href, Icon }) => (
        <Button key={label} variant="outline" size="icon" asChild>
          <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
            <Icon className="h-4 w-4" />
          </a>
        </Button>
      ))}
    </div>
  )
}
