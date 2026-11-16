package com.app.book_keeping.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Daily report showing opening balance, day's movements, and closing balance.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyReportResponse {

    private LocalDate date;

    private BigDecimal openingBalance;

    // Day's inflows
    private BigDecimal dayCredits;
    private BigDecimal dayFunds;
    private BigDecimal totalInflow;

    // Day's outflows
    private BigDecimal dayDebits;
    private BigDecimal dayExpenses;
    private BigDecimal totalOutflow;

    private BigDecimal closingBalance;
}
