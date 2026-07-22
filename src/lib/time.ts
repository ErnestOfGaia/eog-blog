// Timezone helpers. ⚠️ The main site shipped a 7–8h-wrong-slots bug by treating
// container-local (UTC) time as Pacific. Here: store UTC everywhere, and do all
// wall-clock↔UTC conversion through these Intl-based helpers.

import { siteConfig } from './config'

/**
 * The UTC instant whose wall-clock time in `timeZone` is (y, m0, d, hh, mm).
 * m0 is 0-indexed (JS convention). Uses the format-and-diff technique to find
 * the zone offset at that instant — correct across DST except in the ~1h fold,
 * which we don't hit (posts release at 9am, not 2am).
 */
export function wallTimeToUtc(
  y: number,
  m0: number,
  d: number,
  hh: number,
  mm: number,
  timeZone: string = siteConfig.schedule.timezone
): Date {
  const utcGuess = Date.UTC(y, m0, d, hh, mm, 0)
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
  })
  const parts = dtf.formatToParts(new Date(utcGuess))
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  const hour = map.hour === '24' ? 0 : Number(map.hour)
  const zoneWallAsUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second)
  )
  const offset = zoneWallAsUtc - utcGuess
  return new Date(utcGuess - offset)
}

/** The Y/M/D of `instant` as seen in `timeZone`. */
export function zonedYmd(
  instant: Date,
  timeZone: string = siteConfig.schedule.timezone
): { y: number; m0: number; d: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(instant)
  const map: Record<string, string> = {}
  for (const p of parts) map[p.type] = p.value
  return { y: Number(map.year), m0: Number(map.month) - 1, d: Number(map.day) }
}

/** Format an ISO/UTC timestamp for display in the site timezone. */
export function formatInZone(
  isoUtc: string,
  opts: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
  return new Intl.DateTimeFormat(siteConfig.locale, {
    timeZone: siteConfig.schedule.timezone,
    ...opts,
  }).format(new Date(isoUtc))
}
