import { contentGuard, siteConfig } from './config'

// Advisory content lint (design plan 04 §3.7). Config-driven. For EOG this is
// advisory (surfaced in the admin review UI); a client fork can set
// CONTENT_GUARD_HARD=true to make findings block publish.

export interface GuardFinding {
  rule: 'pronoun' | 'price-token' | 'phone' | 'banned-pattern'
  severity: 'error' | 'warn'
  message: string
  match: string
}

export interface GuardResult {
  ok: boolean // true = no findings
  findings: GuardFinding[]
  hardGate: boolean // whether findings should BLOCK (client-template escalation)
}

export function runContentGuard(fields: {
  title?: string | null
  body?: string | null
  excerpt?: string | null
}): GuardResult {
  const haystack = [fields.title, fields.excerpt, fields.body]
    .filter(Boolean)
    .join('\n')
  const lower = haystack.toLowerCase()
  const findings: GuardFinding[] = []

  // Pronoun rule (author is they/them — never he/him or she/her).
  for (const p of contentGuard.bannedPronouns) {
    if (lower.includes(p.toLowerCase())) {
      findings.push({
        rule: 'pronoun',
        severity: 'error',
        match: p.trim(),
        message: `Possible wrong pronoun for ${siteConfig.author.name} ("${p.trim()}"). Author is ${siteConfig.author.pronouns}.`,
      })
    }
  }

  // Unfilled price tokens.
  for (const t of contentGuard.priceTokens) {
    if (haystack.includes(t)) {
      findings.push({
        rule: 'price-token',
        severity: 'error',
        match: t,
        message: `Unfilled price token "${t}" — set a real price or remove before publishing.`,
      })
    }
  }

  // Any 10-digit phone that isn't the approved public number.
  const approvedDigits = contentGuard.approvedPhone.replace(/\D/g, '')
  const phoneMatches = haystack.match(/\b\d{3}[.\-\s]?\d{3}[.\-\s]?\d{4}\b/g) ?? []
  for (const m of phoneMatches) {
    if (m.replace(/\D/g, '') !== approvedDigits) {
      findings.push({
        rule: 'phone',
        severity: 'warn',
        match: m,
        message: `Phone number "${m}" is not the approved public number (${contentGuard.approvedPhone}).`,
      })
    }
  }

  // Banned URL/data patterns (drive/docs links, etc.).
  for (const re of contentGuard.bannedPatterns) {
    const m = haystack.match(re)
    if (m) {
      findings.push({
        rule: 'banned-pattern',
        severity: 'error',
        match: m[0],
        message: `Disallowed link/pattern "${m[0]}" must not appear in public content.`,
      })
    }
  }

  return { ok: findings.length === 0, findings, hardGate: contentGuard.hardGate }
}
