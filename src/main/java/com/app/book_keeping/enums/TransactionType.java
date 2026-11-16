package com.app.book_keeping.enums;

/**
 * Discriminator for the unified Transaction ledger.
 * DEBIT  = Buying goods (money goes out, inventory comes in).
 * CREDIT = Selling / billing (money comes in or is receivable).
 * EXPENSE = Operational or personal expenses.
 * FUND   = Capital injections or adjustments.
 */
public enum TransactionType {
    DEBIT,
    CREDIT,
    EXPENSE,
    FUND
}
