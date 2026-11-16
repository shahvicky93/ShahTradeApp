package com.app.book_keeping.repository;

import com.app.book_keeping.entity.Transaction;
import com.app.book_keeping.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    // ========================
    // Daily Report queries
    // ========================

    /**
     * Sum amounts grouped by transaction type for all transactions before a given datetime.
     * Used to compute opening balance.
     */
    @Query("SELECT t.transactionType, COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.transactionDate < :date " +
           "GROUP BY t.transactionType")
    List<Object[]> sumAmountsByTypeBefore(@Param("date") LocalDateTime date);

    /**
     * Sum amounts grouped by transaction type for transactions within a datetime range.
     * Used to compute day's movements.
     */
    @Query("SELECT t.transactionType, COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t WHERE t.transactionDate >= :start AND t.transactionDate < :end " +
           "GROUP BY t.transactionType")
    List<Object[]> sumAmountsByTypeBetween(@Param("start") LocalDateTime start,
                                            @Param("end") LocalDateTime end);

    // ========================
    // Pending Funds queries
    // ========================

    /**
     * Aggregate outstanding amounts grouped by dealer for CREDIT transactions
     * that are PARTIALLY_PAID or PENDING.
     */
    @Query("SELECT t.dealerName, SUM(t.amount), " +
           "SUM(CASE WHEN t.paymentStatus = com.app.book_keeping.enums.PaymentStatus.PENDING THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN t.paymentStatus = com.app.book_keeping.enums.PaymentStatus.PARTIALLY_PAID THEN 1 ELSE 0 END) " +
           "FROM Transaction t " +
           "WHERE t.transactionType = com.app.book_keeping.enums.TransactionType.CREDIT " +
           "AND (t.paymentStatus = com.app.book_keeping.enums.PaymentStatus.PARTIALLY_PAID " +
           "  OR t.paymentStatus = com.app.book_keeping.enums.PaymentStatus.PENDING) " +
           "GROUP BY t.dealerName")
    List<Object[]> findPendingByDealer();

    // ========================
    // Expense Report queries
    // ========================

    /**
     * Sum expense amounts grouped by category within a date range.
     */
    @Query("SELECT t.expenseCategory, SUM(t.amount), COUNT(t) " +
           "FROM Transaction t " +
           "WHERE t.transactionType = com.app.book_keeping.enums.TransactionType.EXPENSE " +
           "AND t.transactionDate >= :start AND t.transactionDate < :end " +
           "GROUP BY t.expenseCategory")
    List<Object[]> sumExpensesByCategoryBetween(@Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end);

    // ========================
    // Profit Report queries
    // ========================

    /**
     * Find settled (FULLY_PAID) CREDIT transactions within a date range.
     */
    @Query("SELECT t FROM Transaction t " +
           "JOIN FETCH t.item JOIN FETCH t.user " +
           "WHERE t.transactionType = com.app.book_keeping.enums.TransactionType.CREDIT " +
           "AND t.paymentStatus = com.app.book_keeping.enums.PaymentStatus.FULLY_PAID " +
           "AND t.transactionDate >= :start AND t.transactionDate < :end")
    List<Transaction> findSettledCreditsBetween(@Param("start") LocalDateTime start,
                                                 @Param("end") LocalDateTime end);

    /**
     * Compute the weighted average buying rate for a given item from all DEBIT transactions.
     * Formula: SUM(netQty × ratePerUnit) / SUM(netQty)
     */
    @Query("SELECT COALESCE(SUM(t.netQty * t.ratePerUnit), 0), COALESCE(SUM(t.netQty), 0) " +
           "FROM Transaction t " +
           "WHERE t.transactionType = com.app.book_keeping.enums.TransactionType.DEBIT " +
           "AND t.item.id = :itemId")
    List<Object[]> findWeightedBuyingCostForItem(@Param("itemId") Long itemId);

    // ========================
    // General queries
    // ========================

    List<Transaction> findByTransactionTypeOrderByTransactionDateDesc(TransactionType type);
}
