package com.app.book_keeping.entity;

import com.app.book_keeping.enums.ExpenseCategory;
import com.app.book_keeping.enums.PaymentStatus;
import com.app.book_keeping.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Unified ledger entry — the core table of the bookkeeping system.
 * A single row can represent a DEBIT (buy), CREDIT (sell/bill),
 * EXPENSE, or FUND transaction, discriminated by {@link #transactionType}.
 */
@Entity
@Table(name = "transactions", schema = "app", indexes = {
        @Index(name = "idx_txn_type", columnList = "transaction_type"),
        @Index(name = "idx_txn_date", columnList = "transaction_date"),
        @Index(name = "idx_txn_user", columnList = "user_id"),
        @Index(name = "idx_txn_payment_status", columnList = "payment_status"),
        @Index(name = "idx_txn_dealer", columnList = "dealer_name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(name = "transaction_date", nullable = false)
    private LocalDateTime transactionDate;

    // ---- Relationships ----

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item; // nullable for EXPENSE / FUND

    // ---- CREDIT-specific ----

    @Column(name = "dealer_name", length = 200)
    private String dealerName;

    // ---- Quantity fields (DEBIT / CREDIT) ----

    @Column(name = "gross_qty", precision = 14, scale = 4)
    private BigDecimal grossQty;

    @Column(name = "tare_weight", precision = 14, scale = 4)
    private BigDecimal tareWeight;

    @Column(name = "net_qty", precision = 14, scale = 4)
    private BigDecimal netQty;

    @Column(name = "rate_per_unit", precision = 14, scale = 4)
    private BigDecimal ratePerUnit;

    // ---- Monetary ----

    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal amount;

    // ---- Operational costs (CREDIT) ----

    @Column(name = "loading_cost", precision = 14, scale = 2)
    private BigDecimal loadingCost;

    @Column(name = "carrier_charges", precision = 14, scale = 2)
    private BigDecimal carrierCharges;

    // ---- EXPENSE-specific ----

    @Enumerated(EnumType.STRING)
    @Column(name = "expense_category", length = 30)
    private ExpenseCategory expenseCategory;

    // ---- CREDIT-specific ----

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private PaymentStatus paymentStatus;

    // ---- Metadata ----

    @Column(length = 500)
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
