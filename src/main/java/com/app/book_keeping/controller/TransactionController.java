package com.app.book_keeping.controller;

import com.app.book_keeping.dto.request.CreditRequest;
import com.app.book_keeping.dto.request.DebitRequest;
import com.app.book_keeping.dto.request.ExpenseRequest;
import com.app.book_keeping.dto.request.FundRequest;
import com.app.book_keeping.dto.response.TransactionResponse;
import com.app.book_keeping.enums.TransactionType;
import com.app.book_keeping.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for recording and querying transactions.
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // ========================
    // Record transactions
    // ========================

    @PostMapping("/debit")
    public ResponseEntity<TransactionResponse> recordDebit(@Valid @RequestBody DebitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.recordDebit(request));
    }

    @PostMapping("/credit")
    public ResponseEntity<TransactionResponse> recordCredit(@Valid @RequestBody CreditRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.recordCredit(request));
    }

    @PostMapping("/expense")
    public ResponseEntity<TransactionResponse> recordExpense(@Valid @RequestBody ExpenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.recordExpense(request));
    }

    @PostMapping("/fund")
    public ResponseEntity<TransactionResponse> recordFund(@Valid @RequestBody FundRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.recordFund(request));
    }

    // ========================
    // Query transactions
    // ========================

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> listAll() {
        return ResponseEntity.ok(transactionService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(transactionService.getById(id));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<TransactionResponse>> listByType(@PathVariable TransactionType type) {
        return ResponseEntity.ok(transactionService.listByType(type));
    }
}
