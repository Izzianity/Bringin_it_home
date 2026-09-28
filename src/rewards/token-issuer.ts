/**
 * TokenIssuer Interface
 *
 * Defines the contract for issuing UTC tokens (rewards).
 * Keep this interface decoupled so on-chain implementations (ERC-20, etc.)
 * can be plugged in without changing core reward logic.
 *
 * UTC tokens are INTERNAL POINTS, not money or real assets.
 * They are subject to governance, rule changes, and erasure.
 */

export type RewardReason = "listen" | "post";

export interface IssueTokenInput {
  userId: string;
  amount: number;
  reason: RewardReason;
  sourceId: string; // trackId or postId
  idempotencyKey: string;
}

export interface IssueTokenOutput {
  ledgerEntryId: string;
  amount: number;
  reason: RewardReason;
}

export interface TokenIssuer {
  /**
   * Issue tokens to a user.
   *
   * Must be idempotent: calling with the same idempotencyKey twice
   * should return the same result, not create duplicate entries.
   *
   * @throws if validation fails or DB transaction fails
   */
  issue(input: IssueTokenInput): Promise<IssueTokenOutput>;

  /**
   * Get the current balance for a user (sum of all ledger entries).
   */
  getBalance(userId: string): Promise<number>;
}

/**
 * Default implementation: off-chain SQLite ledger.
 * Can be extended or replaced with on-chain token contracts.
 */
