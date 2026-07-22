# eog-blog

A small, self-hosted blog with an editorial review queue and scheduled release.
Forked from the News Hub World publishing pattern, stripped to a generic blog, and
built as a **portable, config-driven template** (fork per client).

Full design: `../V 2.0 Mastra Based Website/…/EOG Backoffice/04 - DESIGN-PLAN - EOG Blog & Editorial Flow.md`.

## What it does

- **Editorial flow:** `draft → pending_review → changes_requested / approved → published → draft`.
- **Batch-draft → pre-approve → scheduled release.** The publishing agent can only
  create `pending_review` drafts (Bearer `PUBLISHING_AGENT_API_KEY`). The editor approves
  → the post gets a `publish_at` (auto next daily 9am-Pacific slot) → a cron endpoint
  (`/api/cron/publish-due`, Bearer `CRON_API_KEY`, hit by VPS cron) promotes it live.
- **Admin** (`/admin`, password + session cookie) — Kanban board + editor + preview.
- **Public** — `/blog` index, `/blog/[slug]` posts, RSS, sitemap, robots, JSON-LD, OG/canonical.
- **Content-guard** advisory lint (pronouns / contact-data / price-tokens), config-driven.

Served under `basePath: /blog` (NPM path-routes `ernestofgaia.xyz/blog` → this container).

## Stack

Next.js 15 (App Router, TS strict) · Tailwind · SQLite (`better-sqlite3`, WAL) · Docker.

## Configure

Everything account-specific is in `src/lib/config.ts` + env (see `.env.example`) and the
brand tokens in `tailwind.config.ts` / `globals.css`. To fork for a client: change those.

## Run

> ⚠️ `better-sqlite3` is a native module. Local dev needs a C++ toolchain (and a Node
> version with prebuilt binaries). The Docker image builds it in Linux — that is the
> supported path.

```bash
# Docker (supported)
cp .env.example .env   # fill secrets
docker compose up -d --build

# Local dev (needs build toolchain / Node LTS)
npm install
npm run dev            # http://localhost:3000/blog
```

## Deploy (VPS)

1. Build & push image (GH Actions → GHCR) or `build: .` locally.
2. `docker compose pull && up -d` in the compose dir (manual checkpoint — no auto-deploy).
3. NPM: add custom location `/blog` on the `ernestofgaia.xyz` host → `eog_blog:3000`.
4. VPS cron: `*/15 * * * * curl -fsS -X POST -H "Authorization: Bearer $CRON_API_KEY" https://ernestofgaia.xyz/blog/api/cron/publish-due`
5. Brave: add the DNS TXT verification record for `ernestofgaia.xyz`.
