package com.app.book_keeping.dto.response;

import com.app.book_keeping.enums.ExpenseCategory;
import com.app.book_keeping.enums.PaymentStatus;
import com.app.book_keeping.enums.TransactionType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Generic transaction output DTO — flattened projection of the Transaction entity.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private Long id;
    private TransactionType transactionType;
    private LocalDateTime transactionDate;

    // User info (flattened)
    private Long userId;
    private String username;

    // Item info (flattened, nullable)
    private Long itemId;
    private String itemName;

    private String dealerName;

    private BigDecimal grossQty;
    private BigDecimal tareWeight;
    private BigDecimal netQty;
    private BigDecimal ratePerUnit;
    private BigDecimal amount;

    private BigDecimal loadingCost;
    private BigDecimal carrierCharges;

    private ExpenseCategory expenseCategory;
    private PaymentStatus paymentStatus;
    private String description;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
