// Generic blog content model (design plan 04 §3.3). Fiction fields removed.
export type ContentStatus =
  | 'draft'
  | 'pending_review'
  | 'changes_requested'
  | 'approved'
  | 'published'

// Common authors; free text at the DB layer (no CHECK) so a fork can add its own.
export type ContentAuthor = 'ernest' | 'publishing_agent' | (string & {})

export interface Content {
  id: number
  slug: string
  title: string
  body: string // markdown
  excerpt: string | null
  tags: string // JSON array string in the DB — use parseTags() to read
  cover_image: string | null
  cover_image_alt: string | null
  status: ContentStatus
  author: ContentAuthor
  review_notes: string | null
  seo_title: string | null
  seo_description: string | null
  canonical_url: string | null
  discuss_linkedin_url: string | null
  publish_at: string | null // ISO8601 UTC — scheduled release instant
  published_at: string | null // ISO8601 UTC — stamped when promoted
  created_at: string
  updated_at: string
}

// List views exclude the (large) body column.
export type ContentSummary = Omit<Content, 'body'>
