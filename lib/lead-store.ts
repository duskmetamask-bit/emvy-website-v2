import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'

export type LeadEntry = {
  name: string
  company?: string
  email?: string
  phone?: string
  source: string
  stage: string
  message?: string
  addedAt: string
  contactName?: string
  industry?: string
  suburb?: string
  website?: string
  sent?: boolean
  sentAt?: string | null
  reply_received?: boolean
  emails_sent?: number
}

const DATA_PATH = path.join(process.cwd(), 'data', 'leads.json')

export function appendLead(entry: LeadEntry): void {
  try {
    let leads: LeadEntry[] = []
    if (existsSync(DATA_PATH)) {
      const raw = readFileSync(DATA_PATH, 'utf-8')
      leads = JSON.parse(raw)
    }
    leads.push(entry)
    writeFileSync(DATA_PATH, JSON.stringify(leads, null, 2))
  } catch (err) {
    console.error('Failed to append lead:', err)
  }
}
