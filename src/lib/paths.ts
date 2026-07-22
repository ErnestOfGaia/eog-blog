// The app is served under a sub-path (basePath). Next's <Link>, router.push, and
// redirect() apply basePath automatically — but plain HTML form `action` attributes
// and client `fetch()` URLs do NOT. Use withBase() for those.
export const BASE_PATH = '/blog'

export function withBase(p: string): string {
  const path = p.startsWith('/') ? p : `/${p}`
  return `${BASE_PATH}${path}`
}
