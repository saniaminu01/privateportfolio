import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET() {
  try {
    const headers: Record<string,string> = {};
    if (process.env.NEAR_INTENTS_API_KEY) headers["Authorization"] = `Bearer ${process.env.NEAR_INTENTS_API_KEY}`;
    const res = await fetch("https://1click.chaindefuser.com/v0/tokens", { headers, next: { revalidate: 300 } });
    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: "Token directory is temporarily unavailable." }, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to load supported tokens." }, { status: 502 });
  }
}
