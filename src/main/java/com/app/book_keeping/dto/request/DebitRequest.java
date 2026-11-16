package com.app.book_keeping.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request payload for recording a DEBIT (buying) transaction.
 * {@code netQty} and {@code amount} are computed server-side.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebitRequest {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Gross quantity is required")
    @DecimalMin(value = "0.0001", message = "Gross quantity must be greater than 0")
    private BigDecimal grossQty;

    @NotNull(message = "Tare weight is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Tare weight cannot be negative")
    private BigDecimal tareWeight;

    @NotNull(message = "Rate per unit is required")
    @DecimalMin(value = "0.01", message = "Rate per unit must be greater than 0")
    private BigDecimal ratePerUnit;

    private String description;
}
