import type { ContentAuthor } from '@/types'

interface Chip {
  label: string
  className: string
}

export function authorChip(author: ContentAuthor): Chip {
  switch (author) {
    case 'ernest':
      return { label: 'Ernest', className: 'bg-emerald-100 text-emerald-800' }
    case 'publishing_agent':
      return { label: 'Agent', className: 'bg-blue-100 text-blue-800' }
    default:
      return { label: String(author), className: 'bg-stone-100 text-stone-700' }
  }
}
