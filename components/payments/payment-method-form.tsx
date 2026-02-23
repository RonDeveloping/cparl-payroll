"use client";

import { useForm } from "react-hook-form";
import { useRef, useEffect, useState } from "react";
import FormSection from "@/components/form/form-section";
import { FormGrid } from "@/components/form/form-grid";
import InputGroup from "@/components/form/input-group";
import { Clarification } from "@/components/clarification";
import { BUTTON_VARIANTS, LABEL_STYLE } from "@/constants/styles";
import { inputGroupStyles } from "@/constants/styles";
import { PAYMENT_FORM_DESCRIPTIONS } from "@/constants/payment-fields";
import formatPostalCode from "@/utils/formatters/postalCode";
import CardTypeIcon from "@/components/payments/card-type-icon";
import { cn } from "@/lib/utils";

type PaymentMethodFormValues = {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  billingPostalCode: string;
};

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (value: string): string => {
  const digits = normalizeDigits(value);
  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(" ");
};

const isValidLuhn = (value: string) => {
  let sum = 0;
  let shouldDouble = false;

  for (let i = value.length - 1; i >= 0; i -= 1) {
    let digit = Number(value[i]);
    if (Number.isNaN(digit)) return false;
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export default function PaymentMethodForm({
  compact = false,
  userGivenName,
  userFamilyName,
  userPrimaryPostalCode,
}: {
  compact?: boolean;
  userGivenName?: string | null;
  userFamilyName?: string | null;
  userPrimaryPostalCode?: string | null;
}) {
  const cardholderPlaceholder =
    userGivenName || userFamilyName
      ? [userGivenName, userFamilyName].filter(Boolean).join(" ").trim()
      : "Name on card";

  const postalCodePlaceholder = userPrimaryPostalCode
    ? formatPostalCode(userPrimaryPostalCode)
    : "K1K 1K1";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentMethodFormValues>({
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
      billingPostalCode: "",
    },
  });

  const cardNumber = watch("cardNumber");
  const expiryMonth = watch("expiryMonth");
  const expiryYear = watch("expiryYear");
  const cvcTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [cvcHasInvalidChars, setCvcHasInvalidChars] = useState(false);

  useEffect(() => {
    return () => {
      if (cvcTimeoutRef.current) {
        clearTimeout(cvcTimeoutRef.current);
      }
    };
  }, []);

  const handleCardholderNameFocus = () => {
    if (cardholderPlaceholder && cardholderPlaceholder !== "Name on card") {
      setValue("cardholderName", cardholderPlaceholder);
    }
  };

  const handlePostalCodeFocus = () => {
    if (userPrimaryPostalCode) {
      setValue("billingPostalCode", userPrimaryPostalCode);
    }
  };

  const onSubmit = async (data: PaymentMethodFormValues) => {
    try {
      const cardNumberDigits = normalizeDigits(data.cardNumber);

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardholderName: data.cardholderName,
          cardNumber: cardNumberDigits,
          expiryMonth: Number(data.expiryMonth),
          expiryYear: Number(data.expiryYear),
          cvc: data.cvc,
          billingPostalCode: data.billingPostalCode
            .replace(/\s+/g, "")
            .toUpperCase(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Payment save failed:", error);
        return;
      }

      const result = await response.json();
      console.log("Card saved successfully:", result);
    } catch (error) {
      console.error("Error saving card:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Card details">
        <FormGrid className="md:grid-cols-3">
          <div className="space-y-1">
            <label className={LABEL_STYLE}>
              <Clarification
                term="Name on card"
                description={PAYMENT_FORM_DESCRIPTIONS.cardholderName}
              />
            </label>
            <InputGroup
              name="cardholderName"
              register={register}
              placeholder={cardholderPlaceholder}
              error={errors.cardholderName?.message}
              onFocus={handleCardholderNameFocus}
              rules={{
                required: "Cardholder name is required",
                minLength: { value: 2, message: "Enter the full name" },
                setValueAs: (value) => value.trim(),
              }}
            />
          </div>
          <div className="space-y-1">
            <label className={LABEL_STYLE}>Card number</label>
            <InputGroup
              name="cardNumber"
              register={register}
              placeholder="1234 5678 9012 3456"
              error={errors.cardNumber?.message}
              icon={<CardTypeIcon cardNumber={cardNumber} />}
              onChange={(e) => {
                const formatted = formatCardNumber(e.target.value);
                setValue("cardNumber", formatted);
              }}
              rules={{
                required: "Card number is required",
                validate: (value) => {
                  const digits = normalizeDigits(value);
                  if (digits.length < 13 || digits.length > 19) {
                    return "Card number must be 13-19 digits";
                  }
                  if (!isValidLuhn(digits)) {
                    return "Card number is invalid";
                  }
                  return true;
                },
                setValueAs: (value) => value.replace(/\s+/g, " ").trim(),
              }}
            />
          </div>
          <div className="space-y-1">
            <label className={LABEL_STYLE}>
              <Clarification
                term="Postal code"
                description={PAYMENT_FORM_DESCRIPTIONS.postalCode}
              />
            </label>
            <InputGroup
              name="billingPostalCode"
              register={register}
              placeholder={postalCodePlaceholder}
              error={errors.billingPostalCode?.message}
              onFocus={handlePostalCodeFocus}
              onChange={(e) => {
                const formatted = formatPostalCode(e.target.value);
                setValue("billingPostalCode", formatted);
              }}
              rules={{
                required: "Postal code is required",
                validate: (value) => {
                  const trimmed = value.trim();
                  if (trimmed.length < 3 || trimmed.length > 10) {
                    return "Enter a valid postal code";
                  }
                  if (!/^[A-Za-z0-9\s-]+$/.test(trimmed)) {
                    return "Postal code has invalid characters";
                  }
                  return true;
                },
                setValueAs: (value) => value.replace(/\s+/g, "").toUpperCase(),
              }}
            />
          </div>
          <div className="space-y-1">
            <label className={LABEL_STYLE}>Expiry month</label>
            <select
              {...register("expiryMonth", {
                required: "Expiry month is required",
              })}
              className={cn(
                inputGroupStyles.inputBase,
                errors.expiryMonth
                  ? inputGroupStyles.inputError
                  : inputGroupStyles.inputDefault,
              )}
            >
              <option value="">Select month</option>
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1;
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();
                const year = Number(expiryYear);

                // If year is current year, only show months >= current month
                if (year === currentYear && month < currentMonth) {
                  return null;
                }

                return (
                  <option key={month} value={month}>
                    {String(month).padStart(2, "0")}
                  </option>
                );
              }).filter(Boolean)}
            </select>
            {errors.expiryMonth && (
              <span className={inputGroupStyles.errorText}>
                {errors.expiryMonth.message}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <label className={LABEL_STYLE}>Expiry year</label>
            <select
              {...register("expiryYear", {
                required: "Expiry year is required",
                validate: (value) => {
                  const year = Number(value);
                  const month = Number(expiryMonth);
                  const now = new Date();
                  const currentMonth = now.getMonth() + 1;
                  const currentYear = now.getFullYear();

                  if (year === currentYear && month && month < currentMonth) {
                    return "Card is expired";
                  }
                  return true;
                },
              })}
              className={cn(
                inputGroupStyles.inputBase,
                errors.expiryYear
                  ? inputGroupStyles.inputError
                  : inputGroupStyles.inputDefault,
              )}
            >
              <option value="">Select year</option>
              {Array.from({ length: 10 }, (_, i) => {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;
                const month = Number(expiryMonth);

                // If month < current month, start from next year
                const startYear =
                  month && month < currentMonth ? currentYear + 1 : currentYear;
                const year = startYear + i;

                return (
                  <option key={year} value={year}>
                    {String(year).slice(-2)}
                  </option>
                );
              })}
            </select>
            {errors.expiryYear && (
              <span className={inputGroupStyles.errorText}>
                {errors.expiryYear.message}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <label className={LABEL_STYLE}>
              <Clarification
                term="CVC"
                description={PAYMENT_FORM_DESCRIPTIONS.cvc}
              />
            </label>
            <InputGroup
              name="cvc"
              register={register}
              placeholder="123"
              error={errors.cvc?.message}
              onChange={(e) => {
                // Check if there are non-digit characters
                const hasInvalid = /\D/.test(e.target.value);
                setCvcHasInvalidChars(hasInvalid);

                // Clear any pending timeout
                if (cvcTimeoutRef.current) {
                  clearTimeout(cvcTimeoutRef.current);
                }

                // After 500ms, filter out non-digits
                cvcTimeoutRef.current = setTimeout(() => {
                  const digitsOnly = normalizeDigits(e.target.value);
                  setValue("cvc", digitsOnly);
                  // Clear the invalid chars flag after filtering
                  setCvcHasInvalidChars(false);
                }, 500);
              }}
              rules={{
                required: "CVC is required",
                validate: (value) => {
                  const digits = normalizeDigits(value);
                  if (digits.length === 0) {
                    return true; // Let required rule handle empty state
                  }
                  if (!/^\d+$/.test(value)) {
                    return "CVC must contain only digits";
                  }
                  if (digits.length < 3 || digits.length > 4) {
                    return "CVC must be 3-4 digits";
                  }
                  return true;
                },
                setValueAs: (value) => value.trim(),
              }}
            />
            {cvcHasInvalidChars && (
              <p className="text-xs text-slate-500">Only digits 0-9 allowed</p>
            )}
          </div>
        </FormGrid>
      </FormSection>

      <div className="flex justify-end">
        <button
          type="submit"
          className={BUTTON_VARIANTS.primary}
          disabled={isSubmitting}
        >
          {compact ? "Save card" : "Save payment method"}
        </button>
      </div>
    </form>
  );
}
