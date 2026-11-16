package com.app.book_keeping.dto.request;

import com.app.book_keeping.enums.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request payload for recording a CREDIT (selling / bill) transaction.
 * {@code amount} is computed server-side as (netQty × ratePerUnit) + loadingCost + carrierCharges.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditRequest {

    @NotBlank(message = "Dealer name is required")
    private String dealerName;

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Gross quantity is required")
    @DecimalMin(value = "0.0001", message = "Gross quantity must be greater than 0")
    private BigDecimal grossQty;

    @NotNull(message = "Net quantity is required")
    @DecimalMin(value = "0.0001", message = "Net quantity must be greater than 0")
    private BigDecimal netQty;

    @NotNull(message = "Rate per unit is required")
    @DecimalMin(value = "0.01", message = "Rate per unit must be greater than 0")
    private BigDecimal ratePerUnit;

    @Builder.Default
    private BigDecimal loadingCost = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal carrierCharges = BigDecimal.ZERO;

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private String description;
}
