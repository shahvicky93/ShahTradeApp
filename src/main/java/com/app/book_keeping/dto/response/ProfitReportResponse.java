package com.app.book_keeping.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Profit report for settled (FULLY_PAID) bills within a date range.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfitReportResponse {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalRevenue;
    private BigDecimal totalBuyingCost;
    private BigDecimal totalOperationalCost;
    private BigDecimal totalProfit;
    private List<ProfitLineItem> lineItems;

    /**
     * Per-transaction profit breakdown.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfitLineItem {
        private Long transactionId;
        private String dealerName;
        private String itemName;
        private BigDecimal netQty;
        private BigDecimal sellingRate;
        private BigDecimal sellingRevenue;
        private BigDecimal avgBuyingRate;
        private BigDecimal buyingCost;
        private BigDecimal loadingCost;
        private BigDecimal carrierCharges;
        private BigDecimal operationalCost;
        private BigDecimal profit;
    }
}
