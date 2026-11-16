package com.app.book_keeping.service;

import com.app.book_keeping.dto.response.DailyReportResponse;
import com.app.book_keeping.dto.response.ExpenseReportResponse;
import com.app.book_keeping.dto.response.PendingFundsResponse;
import com.app.book_keeping.dto.response.ProfitReportResponse;
import com.app.book_keeping.entity.AppUser;
import com.app.book_keeping.entity.Item;
import com.app.book_keeping.entity.Transaction;
import com.app.book_keeping.enums.ExpenseCategory;
import com.app.book_keeping.enums.PaymentStatus;
import com.app.book_keeping.enums.TransactionType;
import com.app.book_keeping.repository.TransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ReportService reportService;

    @Test
    @DisplayName("DailyReport: correctly computes opening and closing balances with day movements")
    void testDailyReportMath() {
        LocalDate testDate = LocalDate.of(2026, 10, 29);

        // Mock Opening balance components before testDate:
        // Fund = 500,000, Credit = 50,000, Debit = 200,000, Expense = 10,000
        // Expected opening = (500000 + 50000) - (200000 + 10000) = 340,000.00
        List<Object[]> beforeList = new ArrayList<>();
        beforeList.add(new Object[]{TransactionType.FUND, new BigDecimal("500000.00")});
        beforeList.add(new Object[]{TransactionType.CREDIT, new BigDecimal("50000.00")});
        beforeList.add(new Object[]{TransactionType.DEBIT, new BigDecimal("200000.00")});
        beforeList.add(new Object[]{TransactionType.EXPENSE, new BigDecimal("10000.00")});
        when(transactionRepository.sumAmountsByTypeBefore(any(LocalDateTime.class))).thenReturn(beforeList);

        // Mock Day movements on testDate:
        // Day Credits = 25,000, Day Funds = 0, Day Debits = 15,000, Day Expenses = 2,000
        // Total Inflow = 25,000, Total Outflow = 17,000
        // Expected closing = 340,000 + 25,000 - 17,000 = 348,000.00
        List<Object[]> dayList = new ArrayList<>();
        dayList.add(new Object[]{TransactionType.CREDIT, new BigDecimal("25000.00")});
        dayList.add(new Object[]{TransactionType.DEBIT, new BigDecimal("15000.00")});
        dayList.add(new Object[]{TransactionType.EXPENSE, new BigDecimal("2000.00")});
        when(transactionRepository.sumAmountsByTypeBetween(any(LocalDateTime.class), any(LocalDateTime.class))).thenReturn(dayList);

        DailyReportResponse report = reportService.getDailyReport(testDate);

        assertThat(report).isNotNull();
        assertThat(report.getOpeningBalance()).isEqualByComparingTo(new BigDecimal("340000.00"));
        assertThat(report.getTotalInflow()).isEqualByComparingTo(new BigDecimal("25000.00"));
        assertThat(report.getTotalOutflow()).isEqualByComparingTo(new BigDecimal("17000.00"));
        assertThat(report.getClosingBalance()).isEqualByComparingTo(new BigDecimal("348000.00"));
    }

    @Test
    @DisplayName("ProfitReport: accurately calculates revenue, weighted buying cost, operational cost & net profit")
    void testProfitReportMath() {
        LocalDate startDate = LocalDate.of(2026, 10, 1);
        LocalDate endDate = LocalDate.of(2026, 10, 31);

        Item itemRice = Item.builder().id(10L).name("Rice").unit("KG").build();
        AppUser user = AppUser.builder().id(1L).username("admin").build();

        // 1 Settled Credit transaction:
        // Net Qty: 200 kg @ Rate: 42.00 = Selling Revenue: 8,400.00
        // Loading: 150.00, Carrier: 300.00 => Operational Cost: 450.00
        Transaction creditTxn = Transaction.builder()
                .id(101L)
                .transactionType(TransactionType.CREDIT)
                .paymentStatus(PaymentStatus.FULLY_PAID)
                .item(itemRice)
                .user(user)
                .dealerName("Sharma Traders")
                .netQty(new BigDecimal("200.0000"))
                .ratePerUnit(new BigDecimal("42.00"))
                .loadingCost(new BigDecimal("150.00"))
                .carrierCharges(new BigDecimal("300.00"))
                .build();

        when(transactionRepository.findSettledCreditsBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(creditTxn));

        // Mock weighted average buying rate for Rice (Item ID 10):
        // Suppose total cost = 17,500.00 for total qty = 500.00 => avg rate = 35.0000
        List<Object[]> weightedCost = new ArrayList<>();
        weightedCost.add(new Object[]{new BigDecimal("17500.00"), new BigDecimal("500.00")});
        when(transactionRepository.findWeightedBuyingCostForItem(10L)).thenReturn(weightedCost);

        ProfitReportResponse response = reportService.getProfitReport(startDate, endDate);

        assertThat(response).isNotNull();
        // Revenue = 200 * 42 = 8,400.00
        assertThat(response.getTotalRevenue()).isEqualByComparingTo(new BigDecimal("8400.00"));
        // Buying Cost = 200 * 35 = 7,000.00
        assertThat(response.getTotalBuyingCost()).isEqualByComparingTo(new BigDecimal("7000.00"));
        // Operational Cost = 150 + 300 = 450.00
        assertThat(response.getTotalOperationalCost()).isEqualByComparingTo(new BigDecimal("450.00"));
        // Net Profit = 8,400 - 7,000 - 450 = 950.00
        assertThat(response.getTotalProfit()).isEqualByComparingTo(new BigDecimal("950.00"));
        assertThat(response.getLineItems()).hasSize(1);
        assertThat(response.getLineItems().get(0).getProfit()).isEqualByComparingTo(new BigDecimal("950.00"));
    }

    @Test
    @DisplayName("PendingFundsReport: aggregates outstanding amounts and status counts by dealer")
    void testPendingFundsReport() {
        // Dealer row: [dealerName, totalAmount, pendingCount, partialCount]
        List<Object[]> rows = new ArrayList<>();
        rows.add(new Object[]{"Gupta & Sons", new BigDecimal("12500.00"), 2L, 1L});
        rows.add(new Object[]{"Patel Agri", new BigDecimal("8000.00"), 1L, 0L});

        when(transactionRepository.findPendingByDealer()).thenReturn(rows);

        PendingFundsResponse response = reportService.getPendingFundsReport();

        assertThat(response.getTotalDealers()).isEqualTo(2);
        assertThat(response.getTotalOutstanding()).isEqualByComparingTo(new BigDecimal("20500.00"));
        assertThat(response.getDealers().get(0).getDealerName()).isEqualTo("Gupta & Sons");
        assertThat(response.getDealers().get(0).getPendingCount()).isEqualTo(2L);
        assertThat(response.getDealers().get(0).getPartiallyPaidCount()).isEqualTo(1L);
    }

    @Test
    @DisplayName("ExpenseReport: aggregates categories and computes percentage of total")
    void testExpenseReport() {
        LocalDate startDate = LocalDate.of(2026, 10, 1);
        LocalDate endDate = LocalDate.of(2026, 10, 31);

        // Row: [expenseCategory, totalAmount, txnCount]
        List<Object[]> rows = new ArrayList<>();
        rows.add(new Object[]{ExpenseCategory.DELIVERY_COST, new BigDecimal("6000.00"), 3L});
        rows.add(new Object[]{ExpenseCategory.PERSONAL, new BigDecimal("4000.00"), 2L});

        when(transactionRepository.sumExpensesByCategoryBetween(any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(rows);

        ExpenseReportResponse response = reportService.getExpenseReport(startDate, endDate);

        // Total = 10,000.00
        assertThat(response.getTotalExpenses()).isEqualByComparingTo(new BigDecimal("10000.00"));
        assertThat(response.getCategories()).hasSize(2);

        // DELIVERY_COST = 6,000 / 10,000 = 60.00%
        assertThat(response.getCategories().get(0).getPercentageOfTotal()).isEqualByComparingTo(new BigDecimal("60.00"));
        // PERSONAL = 4,000 / 10,000 = 40.00%
        assertThat(response.getCategories().get(1).getPercentageOfTotal()).isEqualByComparingTo(new BigDecimal("40.00"));
    }
}
