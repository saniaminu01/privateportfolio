# PrivatePortfolio

A privacy-aware portfolio analysis prototype for the NEAR Hackathon. It combines NEAR AI Cloud inference with NEAR Intents 1Click quote previews.

## Current implementation status

- Portfolio dashboard with editable, browser-session holdings and clearly labelled sample data.
- Server-side NEAR AI Cloud chat-completions route.
- NEAR Intents supported-token proxy.
- NEAR Intents quote route with `dry: true` enforced server-side.
- No live swap execution and no wallet signing.
- Hardware attestation and response-signature verification are **not yet implemented**. The UI does not claim otherwise.

## Run locally

1. Install Node.js 20 or newer.
2. Extract this project and open a terminal in the `privateportfolio` folder.
3. Run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Add your NEAR AI Cloud API key as `NEAR_AI_API_KEY` in `.env.local`.
6. Run `npm run dev`.
7. Open http://localhost:3000.

## Environment variables

- `NEAR_AI_API_KEY` — required for live private AI inference. Create/manage it through the NEAR AI Cloud dashboard. Keep it server-side.
- `NEAR_AI_MODEL` — optional; defaults to `Qwen/Qwen3.8-27B`.
- `NEAR_INTENTS_API_KEY` — optional partner key for 1Click API access and applicable fee treatment. A dry-run quote can be requested without a key, subject to current API rules.

Never commit `.env.local` or any real API key.

## Architecture and privacy boundary

The browser keeps entered holdings in React state and sends them to `/api/analyze` only after the user clicks Analyze. The Next.js server receives the portfolio and forwards it over TLS to `https://cloud-api.near.ai/v1/chat/completions`.

NEAR AI Cloud describes its inference as running in a TEE and returning attestation evidence. This starter does not independently verify that evidence yet. Also, because the app server receives the portfolio in plaintext, this implementation does **not** provide browser-to-TEE end-to-end encryption. Do not claim that the app server cannot see user data.

The app does not persist portfolio holdings to an application database.

## NEAR Intents

- `/api/tokens` proxies the 1Click token directory.
- `/api/quote` calls `POST https://1click.chaindefuser.com/v0/quote`.
- The server hard-codes `dry: true` and `EXACT_INPUT`.
- The quote API requires origin and destination asset IDs, smallest-unit amount, recipient and refund addresses.
- No deposit address is requested and no swap is executed by this starter.

## Build

```bash
npm run build
```

## Deploy to Vercel

1. Push the project folder contents to a new public GitHub repository.
2. Import that repository into Vercel.
3. Add `NEAR_AI_API_KEY` under Project Settings → Environment Variables.
4. Optionally add `NEAR_AI_MODEL` and `NEAR_INTENTS_API_KEY`.
5. Deploy and test the live URL.

## License

MIT. See `LICENSE`.
