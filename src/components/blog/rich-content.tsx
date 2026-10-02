import { CodeBlock } from './code-block'
import { buildTableOfContents, type MarkdownBlock } from '@/lib/markdown'

type RichContentProps = {
  blocks: MarkdownBlock[]
}

export function RichContent({ blocks }: RichContentProps) {
  const headingAnchors = buildTableOfContents(blocks)
  // Índice do bloco -> âncora, calculado antes do render para não mutar contador dentro do map.
  const anchorByBlock = new Map<number, (typeof headingAnchors)[number]>()
  blocks.forEach((block, index) => {
    if (block.type === 'heading') anchorByBlock.set(index, headingAnchors[anchorByBlock.size])
  })

  return (
    <div className="min-w-0 max-w-full break-words font-serif text-lg leading-8 text-ink">
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') return <p key={index} className="mb-6 break-words">{block.text}</p>
        if (block.type === 'heading') {
          const anchor = anchorByBlock.get(index)
          return <h2 key={index} id={anchor?.id} className="scroll-mt-24 mb-4 mt-10 break-words font-sans text-3xl font-extrabold leading-tight tracking-[-0.035em]">{block.text}</h2>
        }
        if (block.type === 'list') {
          return (
            <ul key={index} className="mb-6 list-disc pl-6">
              {block.items.map((item) => <li key={item} className="mb-2 break-words">{item}</li>)}
            </ul>
          )
        }
        return <CodeBlock key={index} language={block.language} code={block.code} />
      })}
    </div>
  )
}
