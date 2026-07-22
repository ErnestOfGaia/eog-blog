import type { NextConfig } from 'next'

// Served under ernestofgaia.xyz/blog (subdirectory, design plan 04 §3.2). basePath
// makes Next emit all routes/assets under /blog and expect that prefix inbound
// (NPM path-routes /blog → this container).
const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/blog',
  // SQLite is server-only — keep it out of the webpack bundle.
  serverExternalPackages: ['better-sqlite3'],
}

export default nextConfig
