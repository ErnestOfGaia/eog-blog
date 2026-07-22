import type { Metadata } from 'next'
import Link from 'next/link'
import { checkAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Settings — News Hub World',
  description: 'Account and appearance settings for the Coastal Command Center.',
}

const THEMES = [
  { key: 'dark', label: 'Dark', active: true },
  { key: 'light', label: 'Light', active: false },
  { key: 'system', label: 'System', active: false },
]

export default async function SettingsPage() {
  const isAdmin = await checkAdminSession()

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-10">
      <header className="flex flex-col gap-2 border-l-2 border-nhw-cyan pl-4">
        <h1 className="text-headline-lg text-nhw-cyan uppercase">Settings</h1>
        <p className="text-body-md text-white/60">Account and appearance.</p>
      </header>

      {/* Account */}
      <section className="flex flex-col gap-4">
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest">Account</h2>
        {isAdmin ? (
          <div className="flex flex-col gap-4 border border-nhw-cyan/20 bg-nhw-surface p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-body-md text-white/70">Signed in as admin.</p>
              <form action="/api/admin/logout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 text-label-sm uppercase tracking-widest text-nhw-amber border border-nhw-amber/40 hover:bg-nhw-amber/10 transition-colors"
                >
                  Log out
                </button>
              </form>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-label-sm uppercase tracking-widest text-nhw-bg bg-nhw-cyan hover:opacity-90 transition-opacity font-medium"
            >
              Enter Publishing Command Center &rarr;
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 border border-nhw-cyan/20 bg-nhw-surface p-4">
            <p className="text-body-md text-white/70">Not signed in.</p>
            <Link
              href="/login"
              className="px-4 py-2 text-label-sm uppercase tracking-widest text-nhw-cyan border border-nhw-cyan/40 hover:bg-nhw-cyan/10 transition-colors"
            >
              Log in
            </Link>
          </div>
        )}
      </section>

      {/* Appearance */}
      <section className="flex flex-col gap-4">
        <h2 className="text-label-lg text-nhw-cyan uppercase tracking-widest">Appearance</h2>
        <div className="flex gap-3">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              disabled={!t.active}
              aria-pressed={t.active}
              className={
                t.active
                  ? 'px-4 py-2 text-label-sm uppercase tracking-widest text-nhw-bg bg-nhw-cyan'
                  : 'px-4 py-2 text-label-sm uppercase tracking-widest text-nhw-cyan/40 border border-nhw-cyan/20 cursor-not-allowed'
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="text-label-sm text-nhw-cyan/40">
          The Command Center runs dark-first. Light &amp; System themes are coming soon.
        </p>
      </section>
    </main>
  )
}
