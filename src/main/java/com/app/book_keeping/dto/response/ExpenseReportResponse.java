package com.app.book_keeping.dto.response;

import com.app.book_keeping.enums.ExpenseCategory;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Categorised expense aggregation within an optional date range.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseReportResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalExpenses;
    private List<CategoryBreakdown> categories;

    /**
     * Per-category expense breakdown.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryBreakdown {
        private ExpenseCategory category;
        private BigDecimal totalAmount;
        private long transactionCount;
        private BigDecimal percentageOfTotal;
    }
}
