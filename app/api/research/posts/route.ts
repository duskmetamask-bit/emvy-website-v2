import { NextResponse } from 'next/server'
import { getLatestResearch } from '@/lib/research'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ posts: getLatestResearch() })
}

