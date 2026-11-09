import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const apiKey = process.env.NEAR_AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "NEAR AI key is not configured. Add NEAR_AI_API_KEY in your environment." }, { status: 503 });

  try {
    const { holdings } = await req.json();
    if (!Array.isArray(holdings) || holdings.length === 0) {
      return NextResponse.json({ error: "Add at least one holding before analysis." }, { status: 400 });
    }
    const safeHoldings = holdings.map((h: any) => ({
      symbol: String(h.symbol || "").slice(0, 12),
      quantity: Number(h.quantity),
      valueUsd: Number(h.valueUsd)
    }));
   if (holdings.length > 50) {
  return NextResponse.json(
    { error: "A maximum of 50 holdings is allowed." },
    { status: 400 }
  );
}

if (safeHoldings.some((h: any) =>
  !h.symbol.trim() ||
  !Number.isFinite(h.quantity) ||
  h.quantity <= 0 ||
  !Number.isFinite(h.valueUsd) ||
  h.valueUsd < 0
)) {
  return NextResponse.json(
    { error: "One or more holdings are invalid. Quantities must be positive and values cannot be negative." },
    { status: 400 }
  );
}

    const upstream = await fetch("https://cloud-api.near.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.NEAR_AI_MODEL || "Qwen/Qwen3.8-27B",
        messages: [
          { role: "system", content: "You are a cautious portfolio research assistant. Analyze only the supplied portfolio data. Do not give personalized financial advice or guarantee returns. Return concise plain English with sections: Portfolio snapshot, Concentration observations, Risks to consider, Questions before rebalancing. Distinguish observations from assumptions. Do not invent live prices." },
          { role: "user", content: `Analyze this portfolio. Values are user-supplied estimates in USD: ${JSON.stringify(safeHoldings)}. Do not assume these are live balances.` }
        ],
        temperature: 0.3
      }),
      cache: "no-store"
    });
    const body = await upstream.json().catch(() => ({}));
    if (!upstream.ok) return NextResponse.json({ error: body?.error?.message || body?.message || `NEAR AI request failed (${upstream.status}).` }, { status: upstream.status });
    const text = body?.choices?.[0]?.message?.content;
    if (!text) return NextResponse.json({ error: "NEAR AI returned an unexpected response." }, { status: 502 });
    return NextResponse.json({ analysis: text, model: body.model || process.env.NEAR_AI_MODEL || "NEAR AI Cloud", provider: "NEAR AI Cloud", attestation: "Response received. Hardware attestation has not yet been independently verified in this app." });
  } catch {
    return NextResponse.json({ error: "Could not complete the analysis request." }, { status: 500 });
  }
}
