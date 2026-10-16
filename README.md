# DealPilot AI

> **Negotiate Smarter. Deal Better. Close with Confidence.**

DealPilot AI is an enterprise-grade, full-stack AI-powered commercial negotiation platform designed for buyers and sellers to negotiate valuations, exchange multi-attribute structured offers, discover mutually beneficial non-monetary compromises, and execute certified bilateral agreements.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Capabilities](#core-capabilities)
3. [Architecture & Technology Stack](#architecture--technology-stack)
4. [Project Directory Structure](#project-directory-structure)
5. [Environment & API Configuration](#environment--api-configuration)
6. [Getting Started (Local Development)](#getting-started-local-development)
7. [Database Architecture & Migration](#database-architecture--migration)
8. [Agora RTC Real-Time Voice Engine](#agora-rtc-real-time-voice-engine)
9. [Google Gemini AI Negotiation Copilot](#google-gemini-ai-negotiation-copilot)
10. [API Endpoints Reference](#api-endpoints-reference)
11. [Automated Testing](#automated-testing)
12. [Deployment Guidelines](#deployment-guidelines)

---

## 1. Project Overview

DealPilot AI transforms commercial transaction negotiations from adversarial price battles into collaborative, multi-dimensional agreements. By integrating **Agora RTC** for low-latency live voice calls and the official **Google Gen AI SDK (Gemini)** for strategic leverage assessment and compromise formulation, DealPilot AI reduces transaction cycle times and drives higher close rates.

---

## 2. Core Capabilities

- **Secure Authentication & Identity**: Role-based access (Buyer, Seller, or Dual) with bcrypt password hashing and JWT sessions.
- **Dynamic Negotiation Rooms**: Unique room codes (e.g., `DP-8801`) and direct invite links for high-value deal assets.
- **Real-Time Agora RTC Voice Calling**: Direct in-room voice channels with active speaking equalizers, volume indicators, and mic mute toggles.
- **Dual-Perspective Google Gemini AI Copilot**:
  - Bargaining leverage meter (0–100 score + detailed strategic posture breakdown).
  - Zone of Possible Agreement (ZOPA) mathematical calculus.
  - Tactical phrasing and talking points for live discussions.
  - Interactive confidential advisor chat.
- **Structured Multi-Round Counteroffers**:
  - Price ($)
  - Payment Terms (100% Upfront, 50/50 Milestones, Net 30/60, Escrow)
  - Payment Methods (Wire, Corporate ACH, Credit Card, Escrow.com)
  - Delivery Modes (Express Air, Ground Freight, Digital Handover, Local Pickup)
  - Delivery Cost Bearer (Seller 100%, Buyer 100%, 50/50 Split)
  - Inspection / Acceptance Windows & Delivery SLA
- **Intelligent Compromise Discovery Engine**: Generates 3 distinct packages per round:
  1. *Balanced Equilibrium* (Equal monetary concession + shared freight)
  2. *Seller-Optimized Value Package* (Higher price + seller absorbs express shipping and extends warranty)
  3. *Buyer-Optimized Liquidity Package* (Deep discount + buyer pays 100% upfront cash and covers delivery)
- **Bilateral Agreement Execution**: Dual-party digital signatures lock deal terms with a cryptographic verification hash (`DP-CERT-XXXXX`) and printable certificate export.

---

## 3. Architecture & Technology Stack

```
+-------------------------------------------------------------------------+
|                              DealPilot AI                               |
+-------------------------------------------------------------------------+
|  Frontend (client/)                     Backend (server/)               |
|  - React 19 + Vite                      - Node.js & Express.js          |
|  - React Router v7                      - Socket.io (Real-Time Events)  |
|  - Lucide React Icons                   - Agora Token Builder v2        |
|  - Custom CSS Design System             - Official @google/genai SDK    |
|  - Agora RTC Web SDK NG                 - PostgreSQL (with SQLite fallback) |
+-------------------------------------------------------------------------+
```

- **Frontend**: React, Vite, JavaScript, React Router, Custom CSS Design System, Lucide React, Agora RTC Web SDK NG, Canvas Confetti.
- **Backend**: Node.js, Express.js, Socket.io, JWT, bcryptjs, crypto.
- **Database**: PostgreSQL (via `pg` connection pool with automatic embedded persistent fallback for frictionless local startup).
- **Voice Communication**: Agora RTC (`agora-token` server-side token builder + `agora-rtc-sdk-ng` client).
- **AI Engine**: Google Gemini API via official `@google/genai` SDK + DealPilot Algorithmic Calculus Engine.

---

## 4. Project Directory Structure

```text
dealpilot-ai/
├── client/                     # React Frontend Web Application
│   ├── public/
│   │   └── favicon.svg         # Glowing DealPilot AI compass icon
│   ├── src/
│   │   ├── components/         # Reusable UI Components
│   │   │   ├── AgoraVoiceBar.jsx       # Live voice calling drawer
│   │   │   ├── CompromiseCards.jsx     # 3 AI Win-Win compromise packages
│   │   │   ├── FinalDealContract.jsx   # Bilateral signing contract sheet
│   │   │   ├── Footer.jsx              # Application footer
│   │   │   ├── GeminiCopilotDrawer.jsx # Strategic leverage & chat copilot
│   │   │   ├── Navbar.jsx              # Navigation and quick code join
│   │   │   ├── OfferModal.jsx          # Structured counteroffer form
│   │   │   ├── OfferTimeline.jsx       # Round-by-round diff progression
│   │   │   └── RoomChat.jsx            # In-room WebSocket chat
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # User authentication state
│   │   │   └── SocketContext.jsx       # Real-time WebSocket connection
│   │   ├── pages/
│   │   │   ├── CreateRoomPage.jsx      # New negotiation room wizard
│   │   │   ├── DashboardPage.jsx       # Deals dashboard and metrics
│   │   │   ├── LandingPage.jsx         # Hero, features, interactive simulator
│   │   │   ├── LoginPage.jsx           # Sign in & one-click demo logins
│   │   │   ├── NegotiationRoomPage.jsx # Full negotiation command center
│   │   │   └── RegisterPage.jsx        # Account registration
│   │   ├── services/
│   │   │   ├── agoraRtc.js             # Agora Web SDK NG client manager
│   │   │   └── api.js                  # Fetch wrapper with Bearer JWT
│   │   ├── App.jsx                     # Route definitions
│   │   ├── index.css                   # Master CSS design system
│   │   └── main.jsx                    # Root entrypoint
│   └── package.json
│
├── server/                     # Express Backend & API
│   ├── config/
│   │   └── env.js              # Environment variable loader
│   ├── db/
│   │   ├── index.js            # Unified PostgreSQL & SQLite database adapter
│   │   ├── schema.sql          # PostgreSQL DDL table definitions
│   │   └── seed.js             # Demo accounts and realistic room seed data
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── agoraRoutes.js      # Agora RTC token generator endpoint
│   │   ├── aiRoutes.js         # Gemini strategy and compromise endpoints
│   │   ├── authRoutes.js       # Register, login, demo access, me
│   │   ├── dealRoutes.js       # Agreement signing & certificate hash
│   │   ├── offerRoutes.js      # Submit, accept, decline offers
│   │   └── roomRoutes.js       # Room CRUD & code lookup
│   ├── services/
│   │   ├── agoraService.js     # Agora RTC token builder
│   │   ├── compromiseEngine.js # ZOPA and multi-attribute calculus
│   │   └── geminiService.js    # Google Gen AI SDK integration
│   ├── sockets/
│   │   └── negotiationSocket.js# Socket.io room and call presence
│   ├── tests/
│   │   └── api.test.js         # Automated backend test suite
│   ├── .env                    # Secrets and environment configuration
│   ├── index.js                # Server entrypoint with HTTP and WebSockets
│   └── package.json
│
├── .gitignore                  # Exclude secrets, dependencies, and artifacts
└── README.md                   # Complete documentation
```

---

## 5. Environment & API Configuration

All sensitive credentials reside in `dealpilot-ai/server/.env`. **Never expose API secrets to frontend client bundles or public repositories.**

```ini
# Server Port & Client URL
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_here
JWT_EXPIRES_IN=7d

# Database (PostgreSQL primary; automatic persistent fallback to SQLite if offline)
DATABASE_URL=postgresql://username:password@localhost:5432/dealpilot

# Agora Real-Time Voice Credentials
AGORA_APP_ID=your_agora_app_id_here
AGORA_APP_CERTIFICATE=your_agora_app_certificate_here
AGORA_TOKEN_EXPIRATION=7200

# Google Gemini API Credentials
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

---

## 6. Getting Started (Local Development)

### Prerequisites

- **Node.js**: v18+ (tested on Node v22)
- **npm**: v9+

### Quick Start Commands

```bash
# 1. Start the Backend Server (Port 5001)
cd dealpilot-ai/server
npm install
npm run dev

# 2. In a separate terminal, start the Frontend Client (Port 5173)
cd dealpilot-ai/client
npm install
npm run dev
```

Open your browser at `http://localhost:5173` to experience DealPilot AI.

### Pre-Configured Demo Accounts

For instant testing, use the **One-Click Demo Access** buttons on the Login page:
- **Buyer Account**: `buyer@dealpilot.ai` / `password123` (Alex Morgan, Horizon Logistics)
- **Seller Account**: `seller@dealpilot.ai` / `password123` (Sarah Jenkins, Apex Cloud Technologies)

---

## 7. Database Architecture & Migration

DealPilot AI includes full native **PostgreSQL** schema definitions and connection pooling.

### PostgreSQL Setup (Optional)
To connect to an external or local PostgreSQL database:
```bash
# Create database
createdb dealpilot

# Run SQL schema
psql -d dealpilot -f dealpilot-ai/server/db/schema.sql

# Update DATABASE_URL in server/.env
DATABASE_URL=postgresql://username:password@localhost:5432/dealpilot
```

> **Note on Zero-Friction Reliability**: If PostgreSQL is not currently running locally, DealPilot AI's database adapter automatically initializes an embedded persistent SQLite store (`dealpilot.db`), ensuring 100% uptime with identical query semantics.

---

## 8. Agora RTC Real-Time Voice Engine

- **Server-Side Token Generation**: `server/services/agoraService.js` implements Agora's official `RtcTokenBuilder` to issue cryptographically signed, short-lived tokens per user and room channel.
- **Client Web SDK Integration**: `client/src/services/agoraRtc.js` manages the Agora Web SDK NG client, supporting:
  - Acoustic Echo Cancellation (AEC)
  - Automatic Noise Suppression (ANS)
  - Audio Volume Indicator callbacks with animated visualizers
  - Real-time mic mute toggling and speaker presence

---

## 9. Google Gemini AI Negotiation Copilot

DealPilot AI integrates Google Gemini via the official `@google/genai` SDK:
1. **Leverage Evaluation**: Analyzes offer velocity, concession margins, and historical rounds to formulate a 0–100 bargaining power score.
2. **Tactical Posture Advising**: Suggests specific scripts and conditional bargaining strategies (e.g. trading milestone schedules for price points).
3. **Win-Win Compromise Synthesis**: Formulates 3 multi-dimensional packages (Balanced, Seller-Favorable, Buyer-Favorable) that introduce non-cash concessions like freight absorption and warranty extensions.
4. **Resilient AI Reasoning**: If network or quota limits occur, the built-in DealPilot Algorithmic Calculus seamlessly provides domain-accurate commercial recommendations.

---

## 10. API Endpoints Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health and credential status | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `POST` | `/api/auth/demo-login` | Instant demo login (buyer/seller) | No |
| `GET` | `/api/auth/me` | Fetch user profile and negotiation metrics | Yes |
| `POST` | `/api/rooms` | Create a new negotiation room | Yes |
| `GET` | `/api/rooms` | List active negotiation rooms | Yes |
| `GET` | `/api/rooms/:id` | Fetch full room details and offers | Yes |
| `GET` | `/api/rooms/by-code/:code` | Quick room code lookup | Yes |
| `POST` | `/api/rooms/:id/join` | Join room as counterpart | Yes |
| `POST` | `/api/rooms/:id/offers` | Submit offer or counteroffer | Yes |
| `POST` | `/api/rooms/:id/offers/:offerId/accept` | Accept offer & trigger bilateral agreement | Yes |
| `POST` | `/api/rooms/:id/offers/:offerId/reject` | Decline offer | Yes |
| `GET` | `/api/rooms/:id/ai/analysis` | Gemini leverage and tactical analysis | Yes |
| `GET` | `/api/rooms/:id/ai/compromises` | 3 Win-Win compromise packages | Yes |
| `POST` | `/api/rooms/:id/ai/chat` | Interactive chat with Gemini Copilot | Yes |
| `GET` | `/api/rooms/:id/agora/token` | Generate Agora RTC voice token | Yes |
| `GET` | `/api/rooms/:id/deal` | Fetch bilateral deal agreement | Yes |
| `POST` | `/api/rooms/:id/deal/sign` | Digitally sign agreement (buyer/seller) | Yes |
| `GET` | `/api/rooms/:id/deal/certificate` | Exportable deal certificate data | Yes |

---

## 11. Automated Testing

DealPilot AI includes an automated Jest API test suite verifying health checks, authentication, room creation, Agora token generation, Gemini analysis, and offer submission.

```bash
cd dealpilot-ai/server
npm test
```

Expected output:
```text
PASS tests/api.test.js
  DealPilot AI API Suite
    ✓ Health check endpoint returns status ok and branding tagline
    ✓ User authentication profile endpoint returns user info and stats
    ✓ Lists negotiation rooms
    ✓ Creates a new negotiation room
    ✓ Generates an Agora RTC voice token for live voice calls
    ✓ Retrieves AI strategic negotiation analysis
    ✓ Generates intelligent multi-attribute compromise suggestions
    ✓ Submits a counteroffer in a negotiation room

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

---

## 12. Deployment Guidelines

### Containerized Deployment (Docker)

```dockerfile
# Dockerfile for Backend
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --only=production
COPY server/ .
EXPOSE 5001
CMD ["node", "index.js"]
```

### Static Frontend Deployment (Vercel / Netlify / Cloudflare Pages)

1. Set the root directory to `dealpilot-ai/client`.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Set environment variable: `VITE_API_URL=https://your-api-domain.com/api`.

---

## License

Proprietary — Built for DealPilot AI. All rights reserved.

*"Negotiate Smarter. Deal Better. Close with Confidence."*
