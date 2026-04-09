# ChainDisclosure

Blockchain-Based AI Content Disclosure System.

This project records AI usage declarations for digital content on a custom blockchain. Each disclosure is stored as its own block, linked to the previous block, mined with simple proof-of-work, and persisted to disk so the chain survives backend restarts.

The system is designed around disclosure and verification, not AI detection. Instead of trying to guess whether content was AI-generated, creators explicitly declare AI use, and that declaration becomes tamper-evident once written to the chain.

## What The System Does

- Records AI use declarations for text-based content
- Links each disclosure to a SHA-256 content hash
- Stores each disclosure as one block on the blockchain
- Preserves disclosure history through immutable versioned updates
- Lets users browse disclosures, open block detail pages, and verify disclosures by block hash

## Project Structure

```text
Blockchain-Miniproject/
├── backend/
│   ├── blockchain.js
│   ├── server.js
│   ├── seed.js
│   ├── data/
│   │   └── blockchain.json
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

## Getting Started

### 1. Install dependencies

```bash
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Start the backend and frontend

```bash
npm start
```

Or run them separately:

```bash
npm run start:backend
npm run start:frontend
```

Development mode:

```bash
npm run dev
```

### 3. Seed sample disclosures

With the backend running:

```bash
cd backend
node seed.js
```

## How The Blockchain Works

### Block Model

Each block contains:

- `index`
- `timestamp`
- `data`
- `previousHash`
- `nonce`
- `hash`

The block hash is generated from:

```text
index + previousHash + timestamp + JSON.stringify(data) + nonce
```

### Mining

Mining uses a simple proof-of-work rule. The block nonce is incremented until the hash starts with the required number of leading zeroes.

Current difficulty:

- `difficulty = 2`

### Chain Integrity

The chain is valid when:

- each block hash matches its recalculated hash
- each block's `previousHash` matches the hash of the previous block

### Content Hashing

When a disclosure is submitted:

- the submitted text content is hashed with SHA-256
- the resulting `contentHash` is stored inside the disclosure
- the disclosure metadata is written into a newly mined block

## Disclosure Model

Each disclosure stores fields such as:

- `disclosureId`
- `title`
- `author`
- `content`
- `description`
- `contentType`
- `aiUsed`
- `aiTools`
- `aiPercentage`
- `humanEditPercentage`
- `aiUsageDetails`
- `license`
- `submittedAt`
- `version`
- `previousVersionHash`
- `contentHash`

## Versioning

This project supports immutable disclosure history.

- The first submission creates version `1`
- Updating a disclosure creates a new block with the same `disclosureId`
- Each new version increments the `version` field
- `previousVersionHash` links a version to the previous disclosure block
- Block detail pages show version history

This means a disclosure is never edited in place. A new version is appended to the chain instead.

## Persistence

The blockchain is persisted locally to:

```text
backend/data/blockchain.json
```

This means:

- normal backend restarts should preserve the chain
- deleting that file will delete the stored chain
- this is still local persistence, not distributed blockchain storage

## Frontend Pages

- `/`
  Dashboard with chain stats, recent disclosures, and chain visualization
- `/submit`
  Create a new disclosure or record a new version of an existing disclosure
- `/verify`
  Verify a disclosure by block hash
- `/explorer`
  Browse disclosure records with search and filtering
- `/blocks/:blockHash`
  Open a dedicated block detail page with stored content and version history

## API Reference

### Health and Chain

- `GET /api/health`
- `GET /api/chain`
- `GET /api/stats`

### Disclosures

- `GET /api/disclosures`
  Returns the latest version of each disclosure, paginated
- `POST /api/disclosures`
  Creates a new disclosure
- `PUT /api/disclosures/:disclosureId`
  Creates a new immutable version of an existing disclosure
- `GET /api/disclosures/:disclosureId`
  Returns the latest disclosure plus full version history

### Verification

- `GET /api/verify/:blockHash`
  Verifies a block and returns the stored disclosure data

Note:

- The backend still includes `POST /api/verify/content`, but the current frontend no longer uses it.

## Example Disclosure Request

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
  "humanEditPercentage": 40,
  "aiUsageDetails": "Used ChatGPT for first draft and Claude for editing",
  "license": "CC BY 4.0"
}
```
