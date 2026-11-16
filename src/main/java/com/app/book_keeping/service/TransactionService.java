package com.app.book_keeping.service;

import com.app.book_keeping.dto.request.CreditRequest;
import com.app.book_keeping.dto.request.DebitRequest;
import com.app.book_keeping.dto.request.ExpenseRequest;
import com.app.book_keeping.dto.request.FundRequest;
import com.app.book_keeping.dto.response.TransactionResponse;
import com.app.book_keeping.entity.AppUser;
import com.app.book_keeping.entity.Item;
import com.app.book_keeping.entity.Transaction;
import com.app.book_keeping.enums.TransactionType;
import com.app.book_keeping.exception.ResourceNotFoundException;
import com.app.book_keeping.repository.ItemRepository;
import com.app.book_keeping.repository.TransactionRepository;
import com.app.book_keeping.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Handles CRUD operations for all four transaction types.
 * All financial computations (netQty, amount) are done server-side using BigDecimal.
 */
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    // ========================
    // Record transactions
    // ========================

    /**
     * Record a DEBIT (buying) transaction.
     * Computes: netQty = grossQty - tareWeight, amount = netQty × ratePerUnit
     */
    @Transactional
    public TransactionResponse recordDebit(DebitRequest req) {
        AppUser user = findUserOrThrow(req.getUserId());
        Item item = findItemOrThrow(req.getItemId());

        BigDecimal netQty = req.getGrossQty().subtract(req.getTareWeight());
        if (netQty.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Net quantity must be positive after tare weight deduction.");
        }
        BigDecimal amount = netQty.multiply(req.getRatePerUnit()).setScale(2, RoundingMode.HALF_UP);

        Transaction txn = Transaction.builder()
                .transactionType(TransactionType.DEBIT)
                .transactionDate(LocalDateTime.now())
                .user(user)
                .item(item)
                .grossQty(req.getGrossQty())
                .tareWeight(req.getTareWeight())
                .netQty(netQty)
                .ratePerUnit(req.getRatePerUnit())
                .amount(amount)
                .description(req.getDescription())
                .build();

        return toResponse(transactionRepository.save(txn));
    }

    /**
     * Record a CREDIT (selling / bill) transaction.
     * Computes: amount = (netQty × ratePerUnit) + loadingCost + carrierCharges
     */
    @Transactional
    public TransactionResponse recordCredit(CreditRequest req) {
        AppUser user = findUserOrThrow(req.getUserId());
        Item item = findItemOrThrow(req.getItemId());

        BigDecimal loadingCost = req.getLoadingCost() != null ? req.getLoadingCost() : BigDecimal.ZERO;
        BigDecimal carrierCharges = req.getCarrierCharges() != null ? req.getCarrierCharges() : BigDecimal.ZERO;

        BigDecimal baseAmount = req.getNetQty().multiply(req.getRatePerUnit());
        BigDecimal totalAmount = baseAmount.add(loadingCost).add(carrierCharges).setScale(2, RoundingMode.HALF_UP);

        Transaction txn = Transaction.builder()
                .transactionType(TransactionType.CREDIT)
                .transactionDate(LocalDateTime.now())
                .user(user)
                .item(item)
                .dealerName(req.getDealerName())
                .grossQty(req.getGrossQty())
                .netQty(req.getNetQty())
                .ratePerUnit(req.getRatePerUnit())
                .amount(totalAmount)
                .loadingCost(loadingCost)
                .carrierCharges(carrierCharges)
                .paymentStatus(req.getPaymentStatus())
                .description(req.getDescription())
                .build();

        return toResponse(transactionRepository.save(txn));
    }

    /**
     * Record an EXPENSE transaction.
     */
    @Transactional
    public TransactionResponse recordExpense(ExpenseRequest req) {
        AppUser user = findUserOrThrow(req.getUserId());

        Transaction txn = Transaction.builder()
                .transactionType(TransactionType.EXPENSE)
                .transactionDate(LocalDateTime.now())
                .user(user)
                .expenseCategory(req.getExpenseCategory())
                .amount(req.getAmount().setScale(2, RoundingMode.HALF_UP))
                .description(req.getDescription())
                .build();

        return toResponse(transactionRepository.save(txn));
    }

    /**
     * Record a FUND (capital adjustment) transaction.
     */
    @Transactional
    public TransactionResponse recordFund(FundRequest req) {
        AppUser user = findUserOrThrow(req.getUserId());

        Transaction txn = Transaction.builder()
                .transactionType(TransactionType.FUND)
                .transactionDate(LocalDateTime.now())
                .user(user)
                .amount(req.getAmount().setScale(2, RoundingMode.HALF_UP))
                .description(req.getDescription())
                .build();

        return toResponse(transactionRepository.save(txn));
    }

    // ========================
    // Read operations
    // ========================

    @Transactional(readOnly = true)
    public List<TransactionResponse> listAll() {
        return transactionRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TransactionResponse getById(Long id) {
        Transaction txn = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction", id));
        return toResponse(txn);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> listByType(TransactionType type) {
        return transactionRepository.findByTransactionTypeOrderByTransactionDateDesc(type)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ========================
    // Helpers
    // ========================

    private AppUser findUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }

    private Item findItemOrThrow(Long itemId) {
        return itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item", itemId));
    }

    /**
     * Maps a Transaction entity to a flat TransactionResponse DTO.
     */
    public TransactionResponse toResponse(Transaction txn) {
        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionType(txn.getTransactionType())
                .transactionDate(txn.getTransactionDate())
                .userId(txn.getUser().getId())
                .username(txn.getUser().getUsername())
                .itemId(txn.getItem() != null ? txn.getItem().getId() : null)
                .itemName(txn.getItem() != null ? txn.getItem().getName() : null)
                .dealerName(txn.getDealerName())
                .grossQty(txn.getGrossQty())
                .tareWeight(txn.getTareWeight())
                .netQty(txn.getNetQty())
                .ratePerUnit(txn.getRatePerUnit())
                .amount(txn.getAmount())
                .loadingCost(txn.getLoadingCost())
                .carrierCharges(txn.getCarrierCharges())
                .expenseCategory(txn.getExpenseCategory())
                .paymentStatus(txn.getPaymentStatus())
                .description(txn.getDescription())
                .createdAt(txn.getCreatedAt())
                .updatedAt(txn.getUpdatedAt())
                .build();
    }
}
