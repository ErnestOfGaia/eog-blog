import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/config'
import { BASE_PATH } from '@/lib/paths'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login', '/api'],
    },
    sitemap: `${siteConfig.url}${BASE_PATH}/sitemap.xml`,
  }
}
