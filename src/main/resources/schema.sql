-- =============================================
-- Agricultural Trading Bookkeeping — DDL Script
-- Target: Supabase PostgreSQL
-- =============================================

CREATE SCHEMA IF NOT EXISTS app;
SET search_path TO app, public;

-- 1. Users table
CREATE TABLE IF NOT EXISTS app.app_users (
    id              BIGSERIAL       PRIMARY KEY,
    username        VARCHAR(50)     NOT NULL UNIQUE,
    password        VARCHAR(255)    NOT NULL DEFAULT '$2a$10$eRrxWbx7lnWGzPFo63VXxuTIDm.zzIeK0vRMSE.TI2.yHTvC2RYgO',
    role            VARCHAR(20)     NOT NULL DEFAULT 'USER',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 2. Items table
CREATE TABLE IF NOT EXISTS app.items (
    id              BIGSERIAL       PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL UNIQUE,
    unit            VARCHAR(20)     NOT NULL DEFAULT 'KG',
    created_at      TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- 3. Unified Transactions / Ledger table
CREATE TABLE IF NOT EXISTS app.transactions (
    id                  BIGSERIAL       PRIMARY KEY,
    transaction_type    VARCHAR(20)     NOT NULL,
    transaction_date    TIMESTAMP       NOT NULL,
    user_id             BIGINT          NOT NULL REFERENCES app.app_users(id),
    item_id             BIGINT          REFERENCES app.items(id),
    dealer_name         VARCHAR(200),
    gross_qty           NUMERIC(14,4),
    tare_weight         NUMERIC(14,4),
    net_qty             NUMERIC(14,4),
    rate_per_unit       NUMERIC(14,4),
    amount              NUMERIC(16,2)   NOT NULL,
    loading_cost        NUMERIC(14,2),
    carrier_charges     NUMERIC(14,2),
    expense_category    VARCHAR(30),
    payment_status      VARCHAR(20),
    description         VARCHAR(500),
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP       DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_transaction_type
        CHECK (transaction_type IN ('DEBIT', 'CREDIT', 'EXPENSE', 'FUND')),
    CONSTRAINT chk_payment_status
        CHECK (payment_status IS NULL OR payment_status IN ('FULLY_PAID', 'PARTIALLY_PAID', 'PENDING')),
    CONSTRAINT chk_expense_category
        CHECK (expense_category IS NULL OR expense_category IN ('HOUSEHOLD', 'PERSONAL', 'CAR', 'BIKE', 'MISCELLANEOUS', 'DELIVERY_COST')),
    CONSTRAINT chk_amount_positive
        CHECK (amount >= 0)
);

-- 4. Indexes for report query performance
CREATE INDEX IF NOT EXISTS idx_txn_type           ON app.transactions (transaction_type);
CREATE INDEX IF NOT EXISTS idx_txn_date           ON app.transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_txn_user           ON app.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_txn_payment_status ON app.transactions (payment_status);
CREATE INDEX IF NOT EXISTS idx_txn_dealer         ON app.transactions (dealer_name);
CREATE INDEX IF NOT EXISTS idx_txn_item           ON app.transactions (item_id);

-- Composite index for daily report queries
CREATE INDEX IF NOT EXISTS idx_txn_type_date ON app.transactions (transaction_type, transaction_date);
