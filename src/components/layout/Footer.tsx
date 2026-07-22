import { siteConfig } from '@/lib/config'

export default function Footer() {
  return (
    <footer className="border-t border-eog-navy/10 mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-sm text-stone-500">
        <p>
          © 2026 {siteConfig.name} · Text{' '}
          <a href={`sms:${siteConfig.contact.sms}`} className="text-eog-teal hover:underline">
            {siteConfig.contact.sms}
          </a>{' '}
          ·{' '}
          <a href={`mailto:${siteConfig.contact.email}`} className="text-eog-teal hover:underline">
            {siteConfig.contact.email}
          </a>{' '}
          ·{' '}
          <a href={siteConfig.url} className="text-eog-teal hover:underline">
            ernestofgaia.xyz
          </a>
        </p>
      </div>
    </footer>
  )
}
