import { withBase } from '@/lib/paths'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const error = params.error

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-eog-navy">Admin Login</h1>
        </div>

        <form action={withBase('/api/admin/login')} method="POST" className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-eog-teal focus:outline-none focus:ring-1 focus:ring-eog-teal sm:text-sm"
            />
          </div>

          {error === '1' && <div className="text-red-600 text-sm">Incorrect password.</div>}
          {error === 'locked' && (
            <div className="text-red-600 text-sm">Too many attempts. Try again later.</div>
          )}

          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-eog-navy px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-eog-navy focus:ring-offset-2"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  )
}
