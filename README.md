# ⛓ ChainDisclosure — Blockchain-Based AI Content Disclosure System

A trustless, censorship-resistant system for declaring and verifying AI usage in digital content. Disclosures are stored permanently on a local blockchain — immutable, verifiable, and fully open.

---

## 🗂 Project Structure

```
blockchain-ai-disclosure/
├── backend/                  # Node.js + Express API
│   ├── server.js             # REST API server
│   ├── blockchain.js         # Core blockchain logic (Block + Blockchain classes)
│   ├── seed.js               # Sample data seeder
│   └── package.json
│
├── frontend/                 # React application
│   └── src/
│       ├── components/
│       │   ├── Navbar.js          # Navigation bar with live block count
│       │   ├── StatCard.js        # Dashboard stat cards
│       │   ├── DisclosureCard.js  # Single disclosure display card
│       │   └── ChainVisualizer.js # Interactive block chain diagram
│       ├── pages/
│       │   ├── Dashboard.js  # Home page with stats + recent disclosures
│       │   ├── Submit.js     # Disclosure submission form
│       │   ├── Verify.js     # Block hash & content verification
│       │   └── Explorer.js   # Paginated disclosure browser
│       ├── utils/
│       │   └── api.js        # Axios API client
│       └── App.js
│
└── package.json              # Root scripts (concurrently)
```

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
# From the root directory
npm install

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install --legacy-peer-deps && cd ..
```

### 2. Configure environment (optional)

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Start both servers

```bash
# From root — starts backend (port 3001) + frontend (port 3000)
npm start

# Or separately:
npm run start:backend     # Backend only
npm run start:frontend    # Frontend only

# Development mode (with nodemon auto-reload):
npm run dev
```

### 4. Seed sample data (optional)

With the backend running:

```bash
cd backend
node seed.js
```

This adds 6 sample disclosures across different content types.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Chain statistics |
| GET | `/api/chain` | Full blockchain |
| GET | `/api/disclosures` | List disclosures (paginated, filterable) |
| POST | `/api/disclosures` | Submit new disclosure |
| GET | `/api/verify/:blockHash` | Verify a block by hash |
| POST | `/api/verify/content` | Lookup disclosures by content hash |
| GET | `/api/disclosures/:id` | Get specific disclosure by ID |

### POST /api/disclosures — Request Body

```json
{
  "title": "My Article",
  "author": "Jane Doe",
  "content": "Full text or excerpt of the content...",
  "contentType": "article",
  "description": "Short description",
  "aiUsed": true,
  "aiTools": ["ChatGPT", "Claude"],
  "aiPercentage": 60,
  "humanEditPercentage": 50,
  "aiUsageDetails": "Used ChatGPT for first draft, Claude for editing",
  "license": "CC BY 4.0"
}
```

### GET /api/disclosures — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `aiUsed` | boolean | Filter by AI usage (`true`/`false`) |
| `search` | string | Search by title, author, or hash |

---

## 🔗 How the Blockchain Works

1. **Genesis Block** — Created on server start. Anchors the chain.
2. **SHA-256 Hashing** — Every block contains: index + previousHash + timestamp + data + nonce, hashed together.
3. **Proof of Work** — Each block is mined at `difficulty=2` (hash must start with `00`).
4. **Chain Linking** — Each block stores the previous block's hash, making tampering detectable.
5. **Verification** — The `/verify/:blockHash` endpoint recalculates and compares hashes, then validates the entire chain.

### Content Hashing

When a disclosure is submitted:
- The content text is hashed with SHA-256 → `contentHash`
- The contentHash is stored in the block
- Users can later verify their content by pasting it — the system rehashes and looks it up

---

## 📄 Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — stats, live chain, recent disclosures, how it works |
| `/submit` | Submit a new AI disclosure |
| `/verify` | Verify by block hash or by content |
| `/explorer` | Browse all disclosures with search + filtering |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Custom implementation in Node.js (SHA-256, PoW) |
| Backend | Node.js, Express, UUID |
| Frontend | React 18, React Router v6 |
| Styling | Inline styles with CSS variables |
| Fonts | Syne (display), Space Mono (monospace) |

---

## ⚠️ Notes

- The blockchain is **in-memory** — data resets on server restart. For production, persist `blockchain.chain` to a database or file.
- Mining difficulty is set to `2` (two leading zeros) for fast demo response times. Increase for stronger security.
- This is a demonstration system — a production version would use a distributed peer-to-peer network.
