import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    { error: "Checkout is not enabled in this template yet." },
    { status: 501 }
  );
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

