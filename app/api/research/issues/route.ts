import { NextResponse } from 'next/server'
import { newsletterIssues } from '@/lib/research'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ issues: newsletterIssues })
}

