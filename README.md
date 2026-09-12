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
- Use this code for local or personal use (Or your account may get banned).

Request:
- Code is only Public For Bug reporting and Check for privacy of user.
- This Is a Kind Request please don't misuse this tool.

For licensing inquiries or permissions, contact: support@circuitai.in

Any unauthorized use of this software is strictly prohibited and may result in legal action.

See the [LICENSE](LICENSE) file for the complete license agreement.

## Features

- AI-generated robotics project packs for Arduino, ESP32, Raspberry Pi Pico, and similar boards
- Saved project history per signed-in Firebase user
- Free-plan usage limits and Pro status stored in Firestore
- Razorpay subscription checkout for Pro upgrades (monthly, yearly)
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

## Safety Note

AI-generated electronics instructions can be wrong. Students should verify wiring, current draw, battery handling, and firmware behavior before powering motors, batteries, or external loads.
