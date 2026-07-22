// Character Development Records — data access layer (D1/D2).
// The anti-drift store behind /character/<slug>. See docs/plans/character-dev-records.md.
import { getDb } from '@/lib/db'
import type {
  CharacterRecord,
  CharacterRecordAsset,
  CharacterSlug,
  CharacterAssetKind,
} from '@/types'

// Canonical roster metadata. Pronouns are CANON-LOCKED (see the Pronoun Ledger in
// docs/panel-generation-sop.md) — misgendering is a blocking error. Do not edit lightly.
export type CharacterMeta = {
  slug: CharacterSlug
  name: string
  pronouns: string
  role: string
  // Default reference portrait shipped in the repo (used until a record overrides it).
  defaultImage: string
}

export const CHARACTERS: CharacterMeta[] = [
  { slug: 'static',  name: 'Static',  pronouns: 'she/her',   role: 'Noise Correspondent — Build Log narrator', defaultImage: '/lore/static.png' },
  { slug: 'beacon',  name: 'Beacon',  pronouns: 'she/her',   role: 'Signal Keeper — Build Log audience',        defaultImage: '/lore/beacon.png' },
  { slug: 'zclaude', name: 'zClaude', pronouns: 'they/them', role: 'Terminal — never "it"',                     defaultImage: '/lore/zclaude.png' },
  { slug: 'ag',      name: 'A.G.',    pronouns: 'they/them', role: 'AntiGravity — scene character',             defaultImage: '/lore/ag.png' },
  { slug: 'jules',   name: 'Jules',   pronouns: 'he/him',    role: 'Young Seagull — scene character',           defaultImage: '/lore/jules.png' },
  { slug: 'ernest',  name: 'Ernest',  pronouns: 'they/them', role: 'Human creator — brand/banner only',         defaultImage: '/lore/ernest.png' },
  { slug: 'command-center', name: 'Command Center', pronouns: 'it/its', role: 'The Setting — Location',         defaultImage: '/lore/header.png' },
]

const CHARACTER_BY_SLUG = new Map(CHARACTERS.map((c) => [c.slug, c]))

export function isCharacterSlug(slug: string): slug is CharacterSlug {
  return CHARACTER_BY_SLUG.has(slug as CharacterSlug)
}

export function getCharacterMeta(slug: string): CharacterMeta | undefined {
  return CHARACTER_BY_SLUG.get(slug as CharacterSlug)
}

// --- Records ---------------------------------------------------------------

export function getRecordsByCharacter(slug: string): CharacterRecord[] {
  return getDb()
    .prepare(
      `SELECT * FROM character_record WHERE character = ?
       ORDER BY (status = 'current') DESC, version DESC`
    )
    .all(slug) as CharacterRecord[]
}

export function getRecord(id: number): CharacterRecord | undefined {
  return getDb().prepare('SELECT * FROM character_record WHERE id = ?').get(id) as
    | CharacterRecord
    | undefined
}

export function getCurrentRecord(slug: string): CharacterRecord | undefined {
  return getDb()
    .prepare("SELECT * FROM character_record WHERE character = ? AND status = 'current' LIMIT 1")
    .get(slug) as CharacterRecord | undefined
}

// Public curated view: only is_public records, current first then newest version.
export function getPublicRecords(slug: string): CharacterRecord[] {
  return getDb()
    .prepare(
      `SELECT * FROM character_record WHERE character = ? AND is_public = 1
       ORDER BY (status = 'current') DESC, version DESC`
    )
    .all(slug) as CharacterRecord[]
}

export function nextVersion(slug: string): number {
  const row = getDb()
    .prepare('SELECT MAX(version) AS max FROM character_record WHERE character = ?')
    .get(slug) as { max: number | null }
  return (row.max ?? 0) + 1
}

export function createRecord(input: {
  character: CharacterSlug
  title: string
  summary?: string | null
  prompt_full?: string | null
  style_block?: string | null
  negative_block?: string | null
  seed?: string | null
  tool?: string | null
  reference_image?: string | null
}): number {
  const db = getDb()
  const version = nextVersion(input.character)
  const info = db
    .prepare(
      `INSERT INTO character_record
         (character, version, title, summary, prompt_full, style_block, negative_block, seed, tool, reference_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.character,
      version,
      input.title,
      input.summary ?? null,
      input.prompt_full ?? null,
      input.style_block ?? null,
      input.negative_block ?? null,
      input.seed ?? null,
      input.tool ?? null,
      input.reference_image ?? null
    )
  return Number(info.lastInsertRowid)
}

export function updateRecord(
  id: number,
  fields: Partial<
    Pick<
      CharacterRecord,
      | 'title'
      | 'summary'
      | 'prompt_full'
      | 'style_block'
      | 'negative_block'
      | 'seed'
      | 'tool'
      | 'reference_image'
    >
  >
): void {
  const keys = Object.keys(fields)
  if (keys.length === 0) return
  const set = keys.map((k) => `${k} = ?`).join(', ')
  const values = keys.map((k) => (fields as Record<string, unknown>)[k])
  getDb()
    .prepare(`UPDATE character_record SET ${set}, updated_at = datetime('now') WHERE id = ?`)
    .run(...values, id)
}

// Enforce "exactly one current per character" atomically: supersede any prior current
// for this character, then promote this record.
export function setCurrent(id: number): void {
  const db = getDb()
  const rec = getRecord(id)
  if (!rec) return
  const tx = db.transaction(() => {
    db.prepare(
      "UPDATE character_record SET status = 'superseded', updated_at = datetime('now') WHERE character = ? AND status = 'current' AND id != ?"
    ).run(rec.character, id)
    db.prepare(
      "UPDATE character_record SET status = 'current', updated_at = datetime('now') WHERE id = ?"
    ).run(id)
  })
  tx()
}

export function setPublic(id: number, isPublic: boolean): void {
  getDb()
    .prepare("UPDATE character_record SET is_public = ?, updated_at = datetime('now') WHERE id = ?")
    .run(isPublic ? 1 : 0, id)
}

export function deleteRecord(id: number): void {
  // assets cascade via FK (foreign_keys = ON in db.ts). File cleanup is handled by the route.
  getDb().prepare('DELETE FROM character_record WHERE id = ?').run(id)
}

// --- Assets ----------------------------------------------------------------

export function getAssets(recordId: number): CharacterRecordAsset[] {
  return getDb()
    .prepare('SELECT * FROM character_record_asset WHERE record_id = ? ORDER BY sort_order ASC, id ASC')
    .all(recordId) as CharacterRecordAsset[]
}

export function getPublicAssets(recordId: number): CharacterRecordAsset[] {
  return getDb()
    .prepare(
      'SELECT * FROM character_record_asset WHERE record_id = ? AND is_public = 1 ORDER BY sort_order ASC, id ASC'
    )
    .all(recordId) as CharacterRecordAsset[]
}

export function getAsset(id: number): CharacterRecordAsset | undefined {
  return getDb().prepare('SELECT * FROM character_record_asset WHERE id = ?').get(id) as
    | CharacterRecordAsset
    | undefined
}

export function addAsset(input: {
  record_id: number
  kind: CharacterAssetKind
  image_path: string
  caption?: string | null
  checklist_result?: string | null
  is_public?: boolean
}): number {
  const info = getDb()
    .prepare(
      `INSERT INTO character_record_asset (record_id, kind, image_path, caption, checklist_result, is_public)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.record_id,
      input.kind,
      input.image_path,
      input.caption ?? null,
      input.checklist_result ?? null,
      input.is_public ? 1 : 0
    )
  return Number(info.lastInsertRowid)
}

export function setAssetPublic(id: number, isPublic: boolean): void {
  getDb()
    .prepare('UPDATE character_record_asset SET is_public = ? WHERE id = ?')
    .run(isPublic ? 1 : 0, id)
}

export function deleteAsset(id: number): void {
  getDb().prepare('DELETE FROM character_record_asset WHERE id = ?').run(id)
}
