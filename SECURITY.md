# Security Policy

## Threat Model & Mitigations

### 1. Unauthorized Token Minting
**Threat:** Partner or attacker mints tokens without authorization.
**Mitigation:**
- Only `RewardService` mints tokens (server-side, never from client).
- Idempotency keys prevent double-mint on retries.
- Scope `tokens:mint` is forbidden for all partners.
- All minting is logged and auditable.

### 2. Scope Escalation
**Threat:** Partner requests or manipulates scopes to gain unauthorized access.
**Mitigation:**
- Scopes are stored in DB; client cannot modify.
- `PATCH /admin/partners/:id/scopes` validates against `FORBIDDEN_PARTNER_ACTIONS`.
- Default scopes are minimal (read-only).
- Every scope grant is audited.

### 3. Key Compromise
**Threat:** API key is leaked or stolen; attacker impersonates partner.
**Mitigation:**
- Keys stored as argon2 hashes; plaintext never persisted.
- Plaintext key shown once at creation; client must store securely.
- Keys have expiry (default 90 days); rotation recommended.
- Revocation is instant; revoked keys rejected immediately.
- Per-partner rate limiting prevents brute force.

### 4. Self-Listen Reward Exploit
**Threat:** User rewards themselves for listening to own content infinitely.
**Mitigation:**
- `POST /tracks/:id/listen/end` checks `userId !== track.userId`.
- Listen reward only granted once per 24h (dedupe by userId + trackId + date).
- Heartbeat validation requires ≥30s of real listening.

### 5. Duplicate Image Reward Spam
**Threat:** User posts same image repeatedly to farm rewards.
**Mitigation:**
- Images hashed (SHA256) and deduplicated; second upload rejected or not rewarded.
- Daily post cap enforced (default 10 per user).
- EXIF/GPS metadata stripped before storage.

### 6. Balance Manipulation
**Threat:** User directly modifies balance in DB.
**Mitigation:**
- No mutable balance column; balance = sum of ledger.
- TokenLedger is append-only; entries never updated/deleted.
- Direct DB access is via Prisma with typed queries.

### 7. Denial-of-Service (DoS)
**Threat:** Attacker floods API with requests.
**Mitigation:**
- Helmet.js security headers.
- Per-partner rate limiting (configurable).
- Request validation with zod; invalid requests rejected early.
- Database transactions and indexes prevent query timeouts.

## No Real Money, No Real Assets

**Important:** UTC tokens are **internal points**, not money, cryptocurrency, or real assets.

- UTC has no market value.
- UTC may be reset, adjusted, or revoked by governance.
- Do not claim ownership or legal rights over UTC.
- Do not use UTC in any real-money transaction.

## Key Storage & Rotation

### For Developers
1. **Generate key:** `POST /admin/partners/:id/keys` returns plaintext once.
2. **Store securely:** Use a secrets manager (HashiCorp Vault, AWS Secrets Manager, etc.); never hardcode.
3. **Rotate:** Delete old key via `DELETE /admin/partners/:id/keys/:keyId` and generate new one.
4. **Expiry:** Keys expire after 90 days (configurable). Plan rotations accordingly.

### For Deployment
1. **JWT_SECRET:** Use a strong, random 32+ character string. Rotate periodically.
2. **Database:** Ensure SQLite file is not world-readable; use proper file permissions.
3. **TLS:** Serve over HTTPS in production; never HTTP.
4. **CORS:** Restrict to trusted origins; never use `*` in production.

## Audit Logging

Every partner request is logged:

```sql
SELECT * FROM partner_audit_log
WHERE partnerID = ? AND timestamp > now() - INTERVAL 1 WEEK
ORDER BY timestamp DESC;
```

Review logs regularly for suspicious activity (repeated 403 errors, unexpected routes, etc.).

## Reporting Security Issues

If you discover a vulnerability, **do not** open a public issue.

1. Email security@bringin-it-home.local with:
   - Description of vulnerability.
   - Steps to reproduce.
   - Potential impact.
2. Do not disclose the issue publicly until a fix is available.
3. We'll acknowledge within 48 hours and work on a patch.

## Compliance

This project does **not**:
- Store or process real money.
- Comply with PCI-DSS, GDPR, or financial regulations.
- Guarantee data retention or permanence.
- Provide legal or financial advice.

For production use involving real users, consult legal counsel and add appropriate compliance measures.

---

**Security is a shared responsibility. Thank you for helping keep Bringin' It Home safe.**
