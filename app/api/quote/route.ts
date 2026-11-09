import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    const input = await req.json();

if (!input || typeof input !== "object" || Array.isArray(input)) {
  return NextResponse.json(
    { error: "Invalid request body." },
    { status: 400 }
  );
}

const required = [
  "originAsset",
  "destinationAsset",
  "amount",
  "recipient",
  "refundTo"
];

for (const key of required) {
  if (
    typeof input[key] !== "string" ||
    !input[key].trim() ||
    input[key].length > 256
  ) {
    return NextResponse.json(
      { error: `Invalid or missing field: ${key}` },
      { status: 400 }
    );
  }
}

if (!/^[1-9]\d{0,77}$/.test(input.amount)) {
  return NextResponse.json(
    { error: "Amount must be a positive integer in the token's smallest unit." },
    { status: 400 }
  );
}

if (input.originAsset === input.destinationAsset) {
  return NextResponse.json(
    { error: "Choose two different tokens." },
    { status: 400 }
  );
}
        const payload = {
      dry: true,
      swapType: "EXACT_INPUT",
      originAsset: input.originAsset,
      destinationAsset: input.destinationAsset,
      amount: input.amount,

      depositType: "ORIGIN_CHAIN",
      refundType: "ORIGIN_CHAIN",
      recipientType: "DESTINATION_CHAIN",

      recipient: input.recipient,
      refundTo: input.refundTo,

      deadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),

      slippageTolerance: 100,
      quoteWaitingTimeMs: 3000
    };
    const headers: Record<string,string> = { "Content-Type": "application/json" };
    if (process.env.NEAR_INTENTS_API_KEY) headers["Authorization"] = `Bearer ${process.env.NEAR_INTENTS_API_KEY}`;
    const res = await fetch("https://1click.chaindefuser.com/v0/quote", {
      method: "POST", headers, body: JSON.stringify(payload), cache: "no-store"
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ error: data?.message || data?.error || `1Click quote failed (${res.status}).`, details: data }, { status: res.status });
    return NextResponse.json({ ...data, dry: true, execution: "Not executed. This is a quote preview only." });
  } catch {
    return NextResponse.json({ error: "Could not create a swap quote." }, { status: 500 });
  }
}
