# CircuitAI

CircuitAI is a robotics project builder for students. A student describes what they want to make, chooses a target board, and the app generates a complete build pack: firmware, wiring, bill of materials, tools, assembly steps, safety notes, testing plan, troubleshooting help, learning goals, and optional companion UI code.

Founder & Developer: [AahilWorks](https://aahilworks.github.io)

## License

**IMPORTANT: This is proprietary software.**

CircuitAI is NOT open source. This software and its source code are the exclusive property of AahilWorks and are protected by copyright laws and international treaties.

You may NOT:
- Copy, modify, or create derivative works of this software
- Reverse engineer, decompile, or disassemble this software
- Remove or alter any proprietary notices on this software
- Distribute, sublicense, lease, rent, or lend this software
- Use this software for any commercial purpose other than accessing CircuitAI services
- Use this software to compete with CircuitAI or AahilWorks
- Use any portion of this code in your own projects without explicit written permission
- Republish the source code in any form (public or private repositories, websites, etc.)

For licensing inquiries or permissions, contact: support@circuitai.in

Any unauthorized use of this software is strictly prohibited and may result in legal action.

See the [LICENSE](LICENSE) file for the complete license agreement.

## Features

- AI-generated robotics project packs for Arduino, ESP32, Raspberry Pi Pico, and similar boards
- Saved project history per signed-in Firebase user
- Free-plan usage limits and Pro status stored in Firestore
- Razorpay subscription checkout for Pro upgrades (monthly, 2-day trial)
- Downloadable `firmware.ino`, companion script, and Markdown project pack
- Student-friendly sections for testing, troubleshooting, learning goals, and next upgrades

## Pages

- `/` - public home page
- `/features` - feature overview
- `/pricing` - Free vs Pro plans with live Firebase `isPro` status
- `/workspace` - protected project builder workspace
- `/terms` - terms of service
- `/privacy` - privacy policy

## Tech Stack

- Next.js 16 app router
- React 19
- Tailwind CSS 4
- Firebase Auth and Firestore
- Firebase Admin SDK for server routes
- Google Gemini API for project generation
- Razorpay Subscriptions for Pro billing

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` with these values:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

GEMINI_API_KEY=
GEMINI_API_KEY_BACKUP=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_ID=plan_test_your_plan_id
RAZORPAY_TRIAL_DAYS=2
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```

## Razorpay Subscription Setup (Test Mode)

You are in **test mode**. Use keys and plans from the Razorpay Dashboard with **Test Mode** toggled ON (top-left).

1. Add test keys to `.env.local` (never commit this file):
   - `RAZORPAY_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` → `rzp_test_...`
   - `RAZORPAY_KEY_SECRET` → test secret (server only)
2. Create a **test subscription plan** (₹999/month, 12 cycles, 2-day trial if desired):
   - Dashboard → Subscriptions → Plans → Create (while Test Mode is ON)
   - Copy the plan ID into `RAZORPAY_PLAN_ID`
   - **Note:** Live plan IDs (e.g. `plan_TPIFtWvzaN5oej`) do not work with test keys.
3. For webhooks locally, use [ngrok](https://ngrok.com/) or deploy first:
   - URL: `https://YOUR-DOMAIN/api/razorpay-webhook`
   - Events: `subscription.authenticated`, `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`, `subscription.completed`, `payment.failed`
   - Copy webhook secret → `RAZORPAY_WEBHOOK_SECRET`
4. Test cards: Razorpay docs → [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)
5. Deploy `firestore.rules` so users cannot self-set `isPro`.
6. Pro access is removed when Razorpay sends `subscription.completed`, `subscription.cancelled`, `subscription.halted`, or `payment.failed`. The app also re-checks subscription status on sign-in and on every protected API call as a safety net.

When ready for production, switch dashboard to **Live Mode**, create a live plan, and replace all keys with `rzp_live_...` values.

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

`npm run dev` uses webpack because the current Next.js/Turbopack dev server can panic in this workspace during HMR. Production builds still use the normal Next.js build pipeline.

## Firebase Notes

The app expects this Firestore shape:

```text
users/{uid}
users/{uid}/chatSessions/{sessionId}
```

User documents store Pro status and usage counters. Chat session documents store generated project packs and modification counts.

## Safety Note

AI-generated electronics instructions can be wrong. Students should verify wiring, current draw, battery handling, and firmware behavior before powering motors, batteries, or external loads.
