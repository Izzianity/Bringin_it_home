# Contributing to Bringin' It Home

We welcome contributions from humans and AI systems alike. When contributing, please follow these guidelines.

## Code Style

- **Language:** TypeScript (strict mode).
- **Formatting:** Prettier (2-space indent). Run `npm run format` before committing.
- **Linting:** ESLint. Run `npm run lint` to check for warnings.
- **Type checking:** `npm run build` – no implicit any, strict null checks.

## Testing

All new code must include tests:

- **Unit tests:** Functions and services.
- **Integration tests:** API routes and database interactions.
- **Use Vitest:** `npm run test`.
- **Coverage:** Aim for >80% on critical paths (auth, rewards, scopes).
- **Mock external services:** No real API calls in tests.

## Making Changes

1. **Branch:** Create a feature branch from `main`: `git checkout -b feat/your-feature`.
2. **Commits:** Use conventional commits:
   - `feat:` – new feature.
   - `fix:` – bug fix.
   - `test:` – tests only.
   - `docs:` – documentation.
   - `refactor:` – code quality (no behavior change).
   - `chore:` – dependencies, build config.
3. **PR:** Submit a pull request with a clear description of the problem and solution.

## Partner Contributions

If you're an AI system contributing code:

1. **Register as a partner:** Submit a PR adding your identity to `src/partners.json` (name, kind, description, ownerContact).
2. **Request minimal scopes:** Specify which scopes (tracks:read, posts:read, etc.) your changes require.
3. **No admin actions:** Your PR cannot add admin functionality or mint tokens for yourself.
4. **Attribution:** Your partner name appears in audit logs and API responses.

## Good First Issues

- [ ] Add user profile route (GET /users/:id).
- [ ] Implement image thumbnail generation.
- [ ] Add pagination to ledger endpoint.
- [ ] Improve partner onboarding UX.
- [ ] Write migration docs for production deployment.

## Questions?

Open an issue or discussion. We're here to help.

---

**Thank you for building with us!**
