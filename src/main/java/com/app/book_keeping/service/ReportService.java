package com.app.book_keeping.service;

import com.app.book_keeping.dto.response.DailyReportResponse;
import com.app.book_keeping.dto.response.ExpenseReportResponse;
import com.app.book_keeping.dto.response.PendingFundsResponse;
import com.app.book_keeping.dto.response.ProfitReportResponse;
import com.app.book_keeping.entity.Transaction;
import com.app.book_keeping.enums.ExpenseCategory;
import com.app.book_keeping.enums.TransactionType;
import com.app.book_keeping.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

/**
 * Report engine — all four report computations.
 * Every calculation uses BigDecimal with RoundingMode.HALF_UP, scale 2.
 */
@Service
@RequiredArgsConstructor
public class ReportService {

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final TransactionRepository transactionRepository;

    // ============================================================
    // Report 1: Daily Report — Opening & Closing Balance
    // ============================================================

    /**
     * Computes:
     *   Opening Balance = sum(FUND + CREDIT before date) - sum(DEBIT + EXPENSE before date)
     *   Day's movements = grouped sums for the given date
     *   Closing Balance = Opening + Inflows - Outflows
     */
    @Transactional(readOnly = true)
    public DailyReportResponse getDailyReport(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        // --- Opening balance (everything before this date) ---
        Map<TransactionType, BigDecimal> beforeSums = parseTypeSums(
                transactionRepository.sumAmountsByTypeBefore(startOfDay));

        BigDecimal openingBalance = beforeSums.getOrDefault(TransactionType.FUND, BigDecimal.ZERO)
                .add(beforeSums.getOrDefault(TransactionType.CREDIT, BigDecimal.ZERO))
                .subtract(beforeSums.getOrDefault(TransactionType.DEBIT, BigDecimal.ZERO))
                .subtract(beforeSums.getOrDefault(TransactionType.EXPENSE, BigDecimal.ZERO))
                .setScale(SCALE, ROUNDING);

        // --- Day's movements ---
        Map<TransactionType, BigDecimal> daySums = parseTypeSums(
                transactionRepository.sumAmountsByTypeBetween(startOfDay, endOfDay));

        BigDecimal dayCredits  = daySums.getOrDefault(TransactionType.CREDIT, BigDecimal.ZERO).setScale(SCALE, ROUNDING);
        BigDecimal dayFunds    = daySums.getOrDefault(TransactionType.FUND, BigDecimal.ZERO).setScale(SCALE, ROUNDING);
        BigDecimal dayDebits   = daySums.getOrDefault(TransactionType.DEBIT, BigDecimal.ZERO).setScale(SCALE, ROUNDING);
        BigDecimal dayExpenses = daySums.getOrDefault(TransactionType.EXPENSE, BigDecimal.ZERO).setScale(SCALE, ROUNDING);

        BigDecimal totalInflow  = dayCredits.add(dayFunds).setScale(SCALE, ROUNDING);
        BigDecimal totalOutflow = dayDebits.add(dayExpenses).setScale(SCALE, ROUNDING);
        BigDecimal closingBalance = openingBalance.add(totalInflow).subtract(totalOutflow).setScale(SCALE, ROUNDING);

        return DailyReportResponse.builder()
                .date(date)
                .openingBalance(openingBalance)
                .dayCredits(dayCredits)
                .dayFunds(dayFunds)
                .totalInflow(totalInflow)
                .dayDebits(dayDebits)
                .dayExpenses(dayExpenses)
                .totalOutflow(totalOutflow)
                .closingBalance(closingBalance)
                .build();
    }

    // ============================================================
    // Report 2: Profit Report — On Settled Bills
    // ============================================================

    /**
     * For each FULLY_PAID credit within the range:
     *   Selling Revenue  = netQty × sellingRate
     *   Buying Cost      = netQty × weightedAvgBuyRate(item)
     *   Operational Cost = loadingCost + carrierCharges
     *   Profit           = Revenue - BuyingCost - OperationalCost
     */
    @Transactional(readOnly = true)
    public ProfitReportResponse getProfitReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end   = endDate.plusDays(1).atStartOfDay();

        List<Transaction> settledCredits = transactionRepository.findSettledCreditsBetween(start, end);

        // Cache weighted avg buy rates per item to avoid repeated DB calls
        Map<Long, BigDecimal> avgBuyRateCache = new HashMap<>();

        List<ProfitReportResponse.ProfitLineItem> lineItems = new ArrayList<>();
        BigDecimal totalRevenue         = BigDecimal.ZERO;
        BigDecimal totalBuyingCost      = BigDecimal.ZERO;
        BigDecimal totalOperationalCost = BigDecimal.ZERO;

        for (Transaction credit : settledCredits) {
            BigDecimal netQty      = credit.getNetQty() != null ? credit.getNetQty() : BigDecimal.ZERO;
            BigDecimal sellingRate = credit.getRatePerUnit() != null ? credit.getRatePerUnit() : BigDecimal.ZERO;
            BigDecimal loadCost    = credit.getLoadingCost() != null ? credit.getLoadingCost() : BigDecimal.ZERO;
            BigDecimal carrier     = credit.getCarrierCharges() != null ? credit.getCarrierCharges() : BigDecimal.ZERO;

            BigDecimal sellingRevenue = netQty.multiply(sellingRate).setScale(SCALE, ROUNDING);

            // Weighted average buying rate for the item
            Long itemId = credit.getItem().getId();
            BigDecimal avgBuyRate = avgBuyRateCache.computeIfAbsent(itemId, this::computeAvgBuyRate);

            BigDecimal buyingCost     = netQty.multiply(avgBuyRate).setScale(SCALE, ROUNDING);
            BigDecimal operationalCost = loadCost.add(carrier).setScale(SCALE, ROUNDING);
            BigDecimal profit         = sellingRevenue.subtract(buyingCost).subtract(operationalCost).setScale(SCALE, ROUNDING);

            totalRevenue         = totalRevenue.add(sellingRevenue);
            totalBuyingCost      = totalBuyingCost.add(buyingCost);
            totalOperationalCost = totalOperationalCost.add(operationalCost);

            lineItems.add(ProfitReportResponse.ProfitLineItem.builder()
                    .transactionId(credit.getId())
                    .dealerName(credit.getDealerName())
                    .itemName(credit.getItem().getName())
                    .netQty(netQty)
                    .sellingRate(sellingRate)
                    .sellingRevenue(sellingRevenue)
                    .avgBuyingRate(avgBuyRate)
                    .buyingCost(buyingCost)
                    .loadingCost(loadCost)
                    .carrierCharges(carrier)
                    .operationalCost(operationalCost)
                    .profit(profit)
                    .build());
        }

        return ProfitReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalRevenue(totalRevenue.setScale(SCALE, ROUNDING))
                .totalBuyingCost(totalBuyingCost.setScale(SCALE, ROUNDING))
                .totalOperationalCost(totalOperationalCost.setScale(SCALE, ROUNDING))
                .totalProfit(totalRevenue.subtract(totalBuyingCost).subtract(totalOperationalCost).setScale(SCALE, ROUNDING))
                .lineItems(lineItems)
                .build();
    }

    /**
     * Computes weighted average buying rate for an item:
     * sum(netQty × rate) / sum(netQty)
     */
    private BigDecimal computeAvgBuyRate(Long itemId) {
        List<Object[]> result = transactionRepository.findWeightedBuyingCostForItem(itemId);
        if (result.isEmpty()) {
            return BigDecimal.ZERO;
        }
        Object[] row = result.get(0);
        BigDecimal totalCost = (BigDecimal) row[0];
        BigDecimal totalQty  = (BigDecimal) row[1];

        if (totalQty.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return totalCost.divide(totalQty, 4, ROUNDING);
    }

    // ============================================================
    // Report 3: Pending Funds — Outstanding Dealer Balances
    // ============================================================

    @Transactional(readOnly = true)
    public PendingFundsResponse getPendingFundsReport() {
        List<Object[]> rows = transactionRepository.findPendingByDealer();

        List<PendingFundsResponse.DealerOutstanding> dealers = new ArrayList<>();
        BigDecimal totalOutstanding = BigDecimal.ZERO;

        for (Object[] row : rows) {
            String dealerName      = (String) row[0];
            BigDecimal totalAmount = (BigDecimal) row[1];
            long pendingCount      = ((Number) row[2]).longValue();
            long partialCount      = ((Number) row[3]).longValue();

            totalOutstanding = totalOutstanding.add(totalAmount);

            dealers.add(PendingFundsResponse.DealerOutstanding.builder()
                    .dealerName(dealerName)
                    .totalAmount(totalAmount.setScale(SCALE, ROUNDING))
                    .pendingCount(pendingCount)
                    .partiallyPaidCount(partialCount)
                    .build());
        }

        return PendingFundsResponse.builder()
                .totalOutstanding(totalOutstanding.setScale(SCALE, ROUNDING))
                .totalDealers(dealers.size())
                .dealers(dealers)
                .build();
    }

    // ============================================================
    // Report 4: Expense Report — Categorized Aggregation
    // ============================================================

    @Transactional(readOnly = true)
    public ExpenseReportResponse getExpenseReport(LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end   = endDate.plusDays(1).atStartOfDay();

        List<Object[]> rows = transactionRepository.sumExpensesByCategoryBetween(start, end);

        // First pass: collect data and total
        BigDecimal totalExpenses = BigDecimal.ZERO;
        List<ExpenseReportResponse.CategoryBreakdown> categories = new ArrayList<>();

        for (Object[] row : rows) {
            ExpenseCategory category = (ExpenseCategory) row[0];
            BigDecimal totalAmount   = (BigDecimal) row[1];
            long txnCount            = ((Number) row[2]).longValue();

            totalExpenses = totalExpenses.add(totalAmount);

            categories.add(ExpenseReportResponse.CategoryBreakdown.builder()
                    .category(category)
                    .totalAmount(totalAmount.setScale(SCALE, ROUNDING))
                    .transactionCount(txnCount)
                    .build());
        }

        // Second pass: compute percentage of total
        for (ExpenseReportResponse.CategoryBreakdown cat : categories) {
            if (totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal pct = cat.getTotalAmount()
                        .divide(totalExpenses, 4, ROUNDING)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(SCALE, ROUNDING);
                cat.setPercentageOfTotal(pct);
            } else {
                cat.setPercentageOfTotal(BigDecimal.ZERO);
            }
        }

        return ExpenseReportResponse.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalExpenses(totalExpenses.setScale(SCALE, ROUNDING))
                .categories(categories)
                .build();
    }

    // ========================
    // Utility
    // ========================

    /**
     * Parses the Object[] rows from grouped SUM queries into a TransactionType → BigDecimal map.
     */
    private Map<TransactionType, BigDecimal> parseTypeSums(List<Object[]> rows) {
        Map<TransactionType, BigDecimal> map = new EnumMap<>(TransactionType.class);
        for (Object[] row : rows) {
            TransactionType type = (TransactionType) row[0];
            BigDecimal sum = (BigDecimal) row[1];
            map.put(type, sum);
        }
        return map;
    }
}
