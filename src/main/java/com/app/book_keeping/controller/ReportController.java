package com.app.book_keeping.controller;

import com.app.book_keeping.dto.response.DailyReportResponse;
import com.app.book_keeping.dto.response.ExpenseReportResponse;
import com.app.book_keeping.dto.response.PendingFundsResponse;
import com.app.book_keeping.dto.response.ProfitReportResponse;
import com.app.book_keeping.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * REST controller for the four report endpoints.
 */
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * Daily Report: Opening & Closing balance for a given date.
     * GET /api/reports/daily?date=2026-10-29
     */
    @GetMapping("/daily")
    public ResponseEntity<DailyReportResponse> dailyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getDailyReport(date));
    }

    /**
     * Profit Report: Profit on settled (FULLY_PAID) bills within a date range.
     * GET /api/reports/profit?startDate=2026-10-01&endDate=2026-10-31
     */
    @GetMapping("/profit")
    public ResponseEntity<ProfitReportResponse> profitReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getProfitReport(startDate, endDate));
    }

    /**
     * Pending Funds Report: Outstanding dealer balances.
     * GET /api/reports/pending-funds
     */
    @GetMapping("/pending-funds")
    public ResponseEntity<PendingFundsResponse> pendingFundsReport() {
        return ResponseEntity.ok(reportService.getPendingFundsReport());
    }

    /**
     * Expense Report: Categorized expense aggregation within a date range.
     * GET /api/reports/expenses?startDate=2026-10-01&endDate=2026-10-31
     */
    @GetMapping("/expenses")
    public ResponseEntity<ExpenseReportResponse> expenseReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getExpenseReport(startDate, endDate));
    }
}
