'use client'
// Renders Markdown body with react-markdown + remark-gfm, EOG light prose.

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

type Props = { content: string }

export default function MarkdownRenderer({ content }: Props) {
  return (
    <div className="prose prose-eog max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img({ src, alt, title }) {
            return (
              <>
                <img
                  src={typeof src === 'string' ? src : ''}
                  alt={alt ?? ''}
                  className="w-full rounded-md my-6"
                />
                {title ? (
                  <span className="block -mt-4 mb-6 text-sm text-stone-500 text-center italic">
                    {title}
                  </span>
                ) : null}
              </>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
