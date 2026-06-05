#!/usr/bin/env node
// Validates that every JSON-LD block in a rendered page is a well-formed
// schema.org object. Reads the URL(s) passed on the command line, extracts
// every <script type="application/ld+json"> block, JSON.parses it, and
// asserts: @context is https://schema.org, @type is a non-empty string, and
// the object round-trips through JSON. Exits 1 on any failure.

import { argv, exit } from 'node:process'

const SCHEMA_CONTEXT = 'https://schema.org'
const SCRIPT_RE = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g

function extractBlocks(html) {
  const blocks = []
  let match
  while ((match = SCRIPT_RE.exec(html)) !== null) {
    blocks.push(match[1])
  }
  return blocks
}

function validateBlock(raw, sourceUrl, blockIndex) {
  const label = `${sourceUrl} block #${blockIndex + 1}`
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error(`✗ ${label}: invalid JSON (${err.message})`)
    return false
  }
  const items = Array.isArray(parsed) ? parsed : [parsed]
  let ok = true
  for (const [i, item] of items.entries()) {
    const itemLabel = `${label} item #${i + 1}`
    if (item['@context'] !== SCHEMA_CONTEXT) {
      console.error(`✗ ${itemLabel}: @context is ${JSON.stringify(item['@context'])}, expected ${SCHEMA_CONTEXT}`)
      ok = false
    }
    if (typeof item['@type'] !== 'string' || item['@type'].length === 0) {
      console.error(`✗ ${itemLabel}: @type must be a non-empty string, got ${JSON.stringify(item['@type'])}`)
      ok = false
    }
    try {
      const round = JSON.parse(JSON.stringify(item))
      if (JSON.stringify(round) !== JSON.stringify(item)) {
        console.error(`✗ ${itemLabel}: JSON round-trip changed the value`)
        ok = false
      }
    } catch (err) {
      console.error(`✗ ${itemLabel}: not JSON-serializable (${err.message})`)
      ok = false
    }
  }
  if (ok) {
    const types = items.map((it) => it['@type']).join(', ')
    console.log(`✓ ${label}: ${items.length} schema(s) (${types})`)
  }
  return ok
}

async function lint(url) {
  const res = await fetch(url, { headers: { 'user-agent': 'emvy-jsonld-lint/1.0' } })
  if (!res.ok) {
    console.error(`✗ ${url}: HTTP ${res.status}`)
    return false
  }
  const html = await res.text()
  const blocks = extractBlocks(html)
  if (blocks.length === 0) {
    console.error(`✗ ${url}: no <script type="application/ld+json"> blocks found`)
    return false
  }
  return blocks.every((b, i) => validateBlock(b, url, i))
}

const urls = argv.slice(2)
if (urls.length === 0) {
  console.error('usage: node scripts/lint-jsonld.mjs <url> [url ...]')
  exit(2)
}

let allOk = true
for (const url of urls) {
  const ok = await lint(url)
  if (!ok) allOk = false
}

if (!allOk) {
  console.error('\nJSON-LD lint failed')
  exit(1)
}
console.log(`\nAll ${urls.length} URL(s) passed JSON-LD lint`)
