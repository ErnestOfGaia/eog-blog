import Link from 'next/link'
import { siteConfig } from '@/lib/config'

export default function Header() {
  return (
    <header className="bg-eog-cream/60 border-b border-eog-navy/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-baseline justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-eog-navy hover:text-eog-teal transition-colors">
          {siteConfig.blogName}
        </Link>
        <a
          href={siteConfig.url}
          className="text-sm font-medium text-eog-teal hover:underline"
        >
          ernestofgaia.xyz &rarr;
        </a>
      </div>
    </header>
  )
}
