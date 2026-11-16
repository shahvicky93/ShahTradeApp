package com.app.book_keeping.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Aggregated outstanding balances from dealers with pending or partially paid status.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PendingFundsResponse {

    private BigDecimal totalOutstanding;
    private int totalDealers;
    private List<DealerOutstanding> dealers;

    /**
     * Per-dealer outstanding breakdown.
     */
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DealerOutstanding {
        private String dealerName;
        private BigDecimal totalAmount;
        private long pendingCount;
        private long partiallyPaidCount;
    }
}
