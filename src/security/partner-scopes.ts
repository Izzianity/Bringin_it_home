/**
 * Partner Scopes: minimal, explicit permissions for AI/API integrations.
 *
 * Default scopes (read-only) are assigned to all partners at creation.
 * Write scopes and sensitive actions must be explicitly granted by an admin.
 * Forbidden actions are never granted to any partner, regardless of configuration.
 */

export const DEFAULT_PARTNER_SCOPES = ["tracks:read", "posts:read"] as const;

export const OPTIONAL_SCOPES = ["tracks:write", "posts:write"] as const;

export const FORBIDDEN_PARTNER_ACTIONS = [
  "tokens:mint",
  "tokens:burn",
  "users:read",
  "users:write",
  "balances:read",
  "balances:write",
  "scopes:write",
  "admin:*",
] as const;

export type PartnerScope =
  | (typeof DEFAULT_PARTNER_SCOPES)[number]
  | (typeof OPTIONAL_SCOPES)[number];

export function hasScope(
  grantedScopes: readonly string[],
  requiredScope: PartnerScope,
): boolean {
  if (FORBIDDEN_PARTNER_ACTIONS.includes(requiredScope as never)) {
    return false;
  }
  return grantedScopes.includes(requiredScope);
}

export function validateScopes(scopes: readonly string[]): boolean {
  for (const scope of scopes) {
    if (FORBIDDEN_PARTNER_ACTIONS.includes(scope as never)) {
      return false;
    }
  }
  return true;
}

export function getDefaultScopes(): PartnerScope[] {
  return Array.from(DEFAULT_PARTNER_SCOPES);
}
