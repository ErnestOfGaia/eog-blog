// ─────────────────────────────────────────────────────────────────────────────
// Single source of account-specific configuration.
//
// PORTABILITY PRINCIPLE (design plan 04): everything account-specific lives here
// or in env — nothing hardcoded in logic. To fork this blog for another client,
// change this file (+ the brand tokens in globals.css / tailwind.config.ts) and
// the .env — the rest of the app reads from here.
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  /** Public-facing site name (author brand). */
  name: process.env.SITE_NAME ?? 'Ernest of Gaia',
  /** Short label for admin chrome / tab titles. */
  shortName: process.env.SITE_SHORT_NAME ?? 'EOG Blog',
  /** Origin (no trailing slash). */
  url: (process.env.SITE_URL ?? 'https://ernestofgaia.xyz').replace(/\/$/, ''),
  /** Sub-path this app is served under (matches next.config basePath). */
  basePath: '/blog',
  description:
    process.env.SITE_DESCRIPTION ??
    'A human-centered approach to AI — notes on building, learning, and helping people put AI to work.',
  locale: process.env.SITE_LOCALE ?? 'en-US',

  author: {
    name: 'Ernest',
    // Canon-locked. Any prose-composing prompt must carry this rule explicitly.
    pronouns: 'they/them',
  },

  contact: {
    // Contact hierarchy: text first, email second. No other public channels.
    sms: process.env.CONTACT_SMS ?? '503-664-0546',
    email: process.env.CONTACT_EMAIL ?? 'eog@ernestofgaia.xyz',
  },

  social: {
    // Default LinkedIn URL used as the "Discuss on LinkedIn" fallback when a post
    // has no per-post thread link yet.
    linkedin: process.env.LINKEDIN_URL ?? 'https://www.linkedin.com/in/ernestofgaia',
  },

  // ── Scheduled-release cadence (design plan 04 §3.5) ────────────────────────
  schedule: {
    timezone: process.env.PUBLISH_TIMEZONE ?? 'America/Los_Angeles',
    /** Local hour posts release at (24h). Default 9am Pacific — before-9 rule. */
    hour: Number(process.env.PUBLISH_HOUR ?? 9),
    minute: Number(process.env.PUBLISH_MINUTE ?? 0),
    /** Days between auto-assigned slots. 1 = daily (the habit target). */
    cadenceDays: Number(process.env.PUBLISH_CADENCE_DAYS ?? 1),
  },
} as const

// ── Content-guard rules (advisory lint; design plan 04 §3.7) ─────────────────
// Config-driven so a client fork swaps its own rules. For EOG these are advisory
// (Ernest is the editorial gate); set CONTENT_GUARD_HARD=true to make failures
// block publish (the client-template escalation).
export const contentGuard = {
  hardGate: (process.env.CONTENT_GUARD_HARD ?? 'false') === 'true',
  /** Pronouns that must never appear for the author. */
  bannedPronouns: ['he/him', 'she/her', ' he ', ' him ', ' his ', ' she ', ' her '],
  /** Unfilled price tokens that must not ship. */
  priceTokens: ['[PRICE TBD]', 'PRICE TBD', '[TBD]'],
  /** The only approved public phone number; any other 10-digit number is flagged. */
  approvedPhone: process.env.CONTACT_SMS ?? '503-664-0546',
  /** Personal email domains / drive URLs that must never appear publicly. */
  bannedPatterns: [
    /\bdrive\.google\.com\//i,
    /\bdocs\.google\.com\//i,
  ],
} as const

export type SiteConfig = typeof siteConfig
