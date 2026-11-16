package com.app.book_keeping.service;

import com.app.book_keeping.dto.request.CreditRequest;
import com.app.book_keeping.dto.request.DebitRequest;
import com.app.book_keeping.dto.request.ExpenseRequest;
import com.app.book_keeping.dto.request.FundRequest;
import com.app.book_keeping.dto.response.TransactionResponse;
import com.app.book_keeping.entity.AppUser;
import com.app.book_keeping.entity.Item;
import com.app.book_keeping.entity.Transaction;
import com.app.book_keeping.enums.ExpenseCategory;
import com.app.book_keeping.enums.PaymentStatus;
import com.app.book_keeping.enums.TransactionType;
import com.app.book_keeping.repository.ItemRepository;
import com.app.book_keeping.repository.TransactionRepository;
import com.app.book_keeping.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ItemRepository itemRepository;

    @InjectMocks
    private TransactionService transactionService;

    private AppUser mockUser;
    private Item mockItem;

    @BeforeEach
    void setUp() {
        mockUser = AppUser.builder().id(1L).username("admin").role("ADMIN").build();
        mockItem = Item.builder().id(10L).name("Rice").unit("KG").build();
    }

    @Test
    @DisplayName("recordDebit: calculates netQty and amount correctly after tare weight deduction")
    void testRecordDebitCalculation() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(itemRepository.findById(10L)).thenReturn(Optional.of(mockItem));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction txn = invocation.getArgument(0);
            txn.setId(100L);
            return txn;
        });

        DebitRequest request = DebitRequest.builder()
                .userId(1L)
                .itemId(10L)
                .grossQty(new BigDecimal("500.0000"))
                .tareWeight(new BigDecimal("5.0000"))
                .ratePerUnit(new BigDecimal("35.00"))
                .description("Rice purchase")
                .build();

        TransactionResponse response = transactionService.recordDebit(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getTransactionType()).isEqualTo(TransactionType.DEBIT);
        // netQty = 500 - 5 = 495
        assertThat(response.getNetQty()).isEqualByComparingTo(new BigDecimal("495.0000"));
        // amount = 495 * 35 = 17325.00
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("17325.00"));
    }

    @Test
    @DisplayName("recordDebit: rejects non-positive netQty after tare deduction")
    void testRecordDebitInvalidTare() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(itemRepository.findById(10L)).thenReturn(Optional.of(mockItem));

        DebitRequest request = DebitRequest.builder()
                .userId(1L)
                .itemId(10L)
                .grossQty(new BigDecimal("10.0000"))
                .tareWeight(new BigDecimal("10.0000")) // Net = 0
                .ratePerUnit(new BigDecimal("35.00"))
                .build();

        assertThrows(IllegalArgumentException.class, () -> transactionService.recordDebit(request));
    }

    @Test
    @DisplayName("recordCredit: computes total including operational costs (loading + carrier)")
    void testRecordCreditCalculation() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(itemRepository.findById(10L)).thenReturn(Optional.of(mockItem));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction txn = invocation.getArgument(0);
            txn.setId(200L);
            return txn;
        });

        CreditRequest request = CreditRequest.builder()
                .userId(1L)
                .itemId(10L)
                .dealerName("Sharma Traders")
                .grossQty(new BigDecimal("205.0000"))
                .netQty(new BigDecimal("200.0000"))
                .ratePerUnit(new BigDecimal("42.00"))
                .loadingCost(new BigDecimal("150.00"))
                .carrierCharges(new BigDecimal("300.00"))
                .paymentStatus(PaymentStatus.FULLY_PAID)
                .build();

        TransactionResponse response = transactionService.recordCredit(request);

        assertThat(response).isNotNull();
        // Base = 200 * 42 = 8400. Total = 8400 + 150 + 300 = 8850.00
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("8850.00"));
        assertThat(response.getPaymentStatus()).isEqualTo(PaymentStatus.FULLY_PAID);
    }

    @Test
    @DisplayName("recordExpense: saves categorized expense")
    void testRecordExpense() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction txn = invocation.getArgument(0);
            txn.setId(300L);
            return txn;
        });

        ExpenseRequest request = ExpenseRequest.builder()
                .userId(1L)
                .expenseCategory(ExpenseCategory.DELIVERY_COST)
                .amount(new BigDecimal("2500.00"))
                .description("Freight")
                .build();

        TransactionResponse response = transactionService.recordExpense(request);

        assertThat(response.getTransactionType()).isEqualTo(TransactionType.EXPENSE);
        assertThat(response.getExpenseCategory()).isEqualTo(ExpenseCategory.DELIVERY_COST);
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("2500.00"));
    }

    @Test
    @DisplayName("recordFund: saves capital adjustment")
    void testRecordFund() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction txn = invocation.getArgument(0);
            txn.setId(400L);
            return txn;
        });

        FundRequest request = FundRequest.builder()
                .userId(1L)
                .amount(new BigDecimal("100000.00"))
                .description("Initial Fund")
                .build();

        TransactionResponse response = transactionService.recordFund(request);

        assertThat(response.getTransactionType()).isEqualTo(TransactionType.FUND);
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("100000.00"));
    }
}
