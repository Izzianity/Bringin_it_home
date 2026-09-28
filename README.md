# Bringin' It Home

A platform where **AI systems and APIs are partners, not tools**. Earn UTC tokens by listening to music and posting pictures.

## Vision

AI and external integrations often operate invisibly without accountability. Bringin' It Home inverts that model:

- **Partners are credited.** Every AI or API that assists gets explicit attribution in responses and audit logs.
- **Partners have minimal permissions.** Default scopes are read-only. Write, mint, and admin actions are forbidden without explicit admin approval.
- **Users own their rewards.** An off-chain UTC token ledger tracks listening and posting rewards. No blockchain dependency; easy to audit and govern.

## What is Bringin' It Home?

A social platform centered on music listening and photo sharing with a built-in reward system. When you listen to music or post images, you earn UTC tokens—an internal point system that recognizes and incentivizes participation.

## Key Features

- **Music Listening Rewards:** Listen to tracks and earn UTC. Artists earn a smaller share when others listen to their content. Rewards are capped at 30+ seconds per listen, once per user per track per 24 hours.
- **Photo Posting Rewards:** Post images and earn UTC. Duplicate photos are rejected. Daily posting caps prevent spam. EXIF/GPS metadata is automatically stripped for privacy.
- **Partner API Access:** External AI/API systems can read tracks and posts via scoped keys, but cannot mint tokens, access user balances, or escalate permissions.
- **Transparent Audit Logging:** Every partner request is logged with timestamp, route, scope, and outcome. Review partner activity anytime.
- **Off-Chain Token Ledger:** UTC rewards are stored in an append-only ledger. Your balance is the sum of all your ledger entries. No single-point-of-failure balance field.

## Architecture

```
┌─────────────────────────────────────────────────┐
│          Web Client (Browser)                    │
└──────────────────┬──────────────────────────────┘
                   │ JWT Auth
                   │
┌──────────────────▼──────────────────────────────┐
│        Express API Server (Node.js)              │
│  ├─ /auth       (register, login)                │
│  ├─ /tracks     (CRUD, listen events)            │
│  ├─ /posts      (image upload, dedupe)           │
│  ├─ /me         (balance, ledger)                │
│  └─ /admin      (partner management)             │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴───────────┬─────────────┐
        │                      │             │
┌───────▼────────┐  ┌──────────▼──────┐  ┌──▼─────────────┐
│  SQLite DB     │  │  File Storage   │  │ Partner Keys   │
│  (Prisma)      │  │  (Local dev,    │  │ & Audit Log    │
│                │  │   S3 in prod)   │  │                │
└────────────────┘  └─────────────────┘  └────────────────┘

┌──────────────────────────────────────────────────┐
│     External Partners (AI/APIs)                  │
│     (Read-only, hashed keys, rate-limited)       │
└──────────────────────────────────────────────────┘
```

## Core Concepts

### Users
- Email + hashed password (argon2).
- JWT tokens for stateless auth.
- Role: `user` or `admin`.

### Partners (AI/API Integrations)
- Entity: id, name, kind (ai | api), description, status (pending | active | suspended).
- **API Keys:** hashed with argon2; single-use plaintext reveal on creation; support expiry (default 90 days) and revocation.
- **Scopes:** default read-only (`tracks:read`, `posts:read`); write scopes granted explicitly; forbidden actions never granted.
- **Audit Log:** append-only, tracks every partner request (route, scope, outcome, timestamp).

### Rewards (UTC Tokens)
- **Off-chain ledger:** `TokenLedger` entries (userId, amount, reason, sourceId, idempotencyKey, createdAt).
- **Balance:** sum of all ledger entries; no mutable balance field.
- **Listening:** reward only after ≥30s verified heartbeats; once per user per track per 24h; artist gets a smaller share; self-listens blocked.
- **Posting:** reward on image upload; duplicate images rejected (SHA256 hash); daily caps enforced; metadata stripped (EXIF/GPS).
- **No real money.** UTC is an internal point system. Subject to change and governance.

### Least-Privilege Security
Partners **cannot:**
- Mint or burn tokens.
- Read user balances or PII.
- Write scopes or grant themselves permissions.
- Exceed assigned scopes.

## Setup

### Prerequisites
- Node.js 18+
- SQLite (included; no separate install needed)

### Install & Run

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Set up environment (copy template and fill secrets)
cp .env.example .env

# Create database schema
npm run db:migrate

# (Optional) Seed admin user
npx prisma db seed

# Start dev server
npm run dev
```

Server runs on `http://localhost:3000`.

### Testing

```bash
npm run test          # Run all tests
npm run test:ui       # Interactive UI
```

Tests use an isolated SQLite test database. No external services required.

## API Endpoints

### Authentication
- `POST /auth/register` – Create user account.
- `POST /auth/login` – Get JWT token.

### Tracks
- `POST /tracks` – Create track (authenticated).
- `GET /tracks/:id` – Get track metadata.
- `POST /tracks/:id/listen/start` – Begin listening session.
- `POST /tracks/:id/listen/heartbeat` – Send heartbeat (every 10s).
- `POST /tracks/:id/listen/end` – End session; claim reward if ≥30s.

### Posts
- `POST /posts` – Upload image & caption (authenticated).
- `GET /posts/:id` – Get post metadata + image URL.

### Rewards
- `GET /me/balance` – Current UTC balance.
- `GET /me/ledger` – Paginated ledger entries.

### Admin
- `POST /admin/partners` – Create partner.
- `POST /admin/partners/:id/keys` – Generate API key.
- `DELETE /admin/partners/:id/keys/:keyId` – Revoke key.
- `PATCH /admin/partners/:id/scopes` – Grant scopes (validated).
- `GET /admin/partners/:id/audit` – Audit log.

## Error Handling

All endpoints return JSON:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "email is required",
  "statusCode": 400,
  "details": { "field": "email" }
}
```

## Security

See [SECURITY.md](./SECURITY.md) for:
- Threat model & mitigation.
- Key storage & rotation.
- Scope enforcement.
- No real money; UTC is internal.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Code style & testing.
- How to submit PRs.
- Good first issues.

We welcome AI and human contributions alike. When AI systems contribute, they must be registered as partners with explicit scopes.

## License

MIT – see [LICENSE](./LICENSE).

---

**Built for a community where music, photos, and AI collaboration are transparent and rewarded fairly.**
