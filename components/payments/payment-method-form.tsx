"use client";

import { useForm } from "react-hook-form";
import FormSection from "@/components/form/form-section";
import { FormGrid } from "@/components/form/form-grid";
import InputGroup from "@/components/form/input-group";
import { Clarification } from "@/components/clarification";
import { BUTTON_VARIANTS, LABEL_STYLE } from "@/constants/styles";
import { PAYMENT_FORM_DESCRIPTIONS } from "@/constants/payment-fields";
import formatPostalCode from "@/utils/formatters/postalCode";
import CardTypeIcon from "@/components/payments/card-type-icon";

type PaymentMethodFormValues = {
  cardholderName: string;
  cardDetails: string;
  billingPostalCode: string;
};

const normalizeDigits = (value: string) => value.replace(/\D/g, "");

type CardBrand = "visa" | "mastercard" | "amex" | "discover" | null;

type ParsedCardDetails = {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: number;
  cvc: string;
};

const detectCardBrand = (cardNumber: string): CardBrand => {
  const digits = normalizeDigits(cardNumber);

  if (/^4/.test(digits)) return "visa";

  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(digits)) {
    return "mastercard";
  }

  if (/^3[47]/.test(digits)) return "amex";

  if (
    /^(6011|65|64[4-9]|622(12[6-9]|1[3-9]|[2-8])|6220[0-9]|62212[0-5])/.test(
      digits,
    )
  ) {
    return "discover";
  }

  return null;
};

const getAllowedCardLengths = (brand: CardBrand): number[] => {
  if (brand === "amex") return [15];
  if (brand === "mastercard") return [16];
  if (brand === "discover") return [16, 19];
  if (brand === "visa") return [16, 19, 13];
  return [16, 15, 19, 13, 14, 17, 18];
};

const getAllowedCvcLengths = (brand: CardBrand): number[] => {
  if (brand === "amex") return [4];
  return [3];
};

const getCommonCardLength = (brand: CardBrand) => {
  if (brand === "amex") return 15;
  return 16;
};

const getCommonCvcLength = (brand: CardBrand) => {
  if (brand === "amex") return 4;
  return 3;
};

const getCardDetailsTemplate = (brand: CardBrand) => {
  if (brand === "amex") {
    return "1234 567890 12345 MM/YY CVCC";
  }

  return "1234 5678 9012 3456 MM/YY CVC";
};

const formatCardNumber = (value: string): string => {
  const digits = normalizeDigits(value);
  const brand = detectCardBrand(digits);

  if (brand === "amex") {
    const groups = [];
    if (digits.length > 0) groups.push(digits.slice(0, 4));
    if (digits.length > 4) groups.push(digits.slice(4, 10));
    if (digits.length > 10) groups.push(digits.slice(10, 15));
    return groups.filter(Boolean).join(" ");
  }

  const groups = digits.match(/.{1,4}/g) || [];
  return groups.join(" ");
};

const expandExpiryYear = (twoDigitYear: string) => {
  const numericYear = Number(twoDigitYear);
  if (Number.isNaN(numericYear)) return Number.NaN;

  const currentYear = new Date().getFullYear();
  const century = Math.floor(currentYear / 100) * 100;

  return century + numericYear;
};

const isExpired = (month: number, year: number) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return year < currentYear || (year === currentYear && month < currentMonth);
};

const parseCardDetails = (value: string): ParsedCardDetails | null => {
  const digits = normalizeDigits(value);
  const brand = detectCardBrand(digits);
  const cardLengths = getAllowedCardLengths(brand);
  const cvcLengths = getAllowedCvcLengths(brand);

  for (const cardLength of cardLengths) {
    for (const cvcLength of cvcLengths) {
      if (digits.length !== cardLength + 4 + cvcLength) {
        continue;
      }

      const cardNumber = digits.slice(0, cardLength);
      const expiryMonth = digits.slice(cardLength, cardLength + 2);
      const expiryYearShort = digits.slice(cardLength + 2, cardLength + 4);
      const cvc = digits.slice(cardLength + 4);
      const monthNumber = Number(expiryMonth);
      const expiryYear = expandExpiryYear(expiryYearShort);

      if (!isValidLuhn(cardNumber)) {
        continue;
      }

      if (monthNumber < 1 || monthNumber > 12) {
        continue;
      }

      if (Number.isNaN(expiryYear) || isExpired(monthNumber, expiryYear)) {
        continue;
      }

      if (cvc.length !== cvcLength) {
        continue;
      }

      return {
        cardNumber,
        expiryMonth,
        expiryYear,
        cvc,
      };
    }
  }

  return null;
};

const formatCardDetails = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 26);
  const brand = detectCardBrand(digits);
  const commonCardLength = getCommonCardLength(brand);
  const commonCvcLength = getCommonCvcLength(brand);
  const trailingDigitsLength = 4 + commonCvcLength;

  let cardLength = Math.min(digits.length, commonCardLength);
  if (digits.length > commonCardLength + trailingDigitsLength) {
    cardLength = Math.min(19, digits.length - trailingDigitsLength);
  }

  const cardNumber = digits.slice(0, cardLength);
  const trailingDigits = digits.slice(
    cardLength,
    cardLength + trailingDigitsLength,
  );
  const expiryMonth = trailingDigits.slice(0, 2);
  const expiryYear = trailingDigits.slice(2, 4);
  const cvc = trailingDigits.slice(4, 4 + commonCvcLength);
  const cardNumberDisplay = formatCardNumber(cardNumber);
  const expiryDigits = `${expiryMonth}${expiryYear}`;
  const expiryDisplay =
    expiryDigits.length > 2
      ? `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}`
      : expiryDigits;

  return [cardNumberDisplay, expiryDisplay, cvc].filter(Boolean).join(" ");
};

const buildCardDetailsOverlay = (value: string) => {
  const digits = normalizeDigits(value);
  const brand = detectCardBrand(digits);
  const template = getCardDetailsTemplate(brand);
  let digitIndex = 0;

  return template.split("").map((character, index) => {
    if (/[0-9A-Z]/.test(character)) {
      const nextDigit = digits[digitIndex];

      if (nextDigit) {
        digitIndex += 1;

        return (
          <span key={index} className="text-slate-900">
            {nextDigit}
          </span>
        );
      }

      return (
        <span key={index} className="text-slate-400">
          {character}
        </span>
      );
    }

    return (
      <span key={index} className="text-slate-400">
        {character}
      </span>
    );
  });
};

const getCardNumberPreview = (value: string) => {
  const digits = normalizeDigits(value);
  const brand = detectCardBrand(digits);
  const commonCardLength = getCommonCardLength(brand);
  const trailingDigitsLength = 4 + getCommonCvcLength(brand);

  if (digits.length <= commonCardLength) {
    return digits;
  }

  if (digits.length > commonCardLength + trailingDigitsLength) {
    return digits.slice(0, Math.min(19, digits.length - trailingDigitsLength));
  }

  return digits.slice(0, commonCardLength);
};

const validateCardDetails = (value: string) => {
  const digits = normalizeDigits(value);

  if (digits.length === 0) {
    return "Card details are required";
  }

  if (!parseCardDetails(value)) {
    if (digits.length < 20) {
      return "Enter card number, expiry, year, and CVC";
    }

    return "Card details are invalid or expired";
  }

  return true;
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
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      cardholderName: "",
      cardDetails: "",
      billingPostalCode: "",
    },
  });

  const cardDetails = watch("cardDetails");

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
      const parsedCardDetails = parseCardDetails(data.cardDetails);

      if (!parsedCardDetails) {
        return;
      }

      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardholderName: data.cardholderName,
          cardNumber: parsedCardDetails.cardNumber,
          expiryMonth: Number(parsedCardDetails.expiryMonth),
          expiryYear: parsedCardDetails.expiryYear,
          cvc: parsedCardDetails.cvc,
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
      <FormSection title="Payment Card (Credit/Debit)">
        <FormGrid className="md:grid-cols-12">
          <div className="space-y-1 md:col-span-5">
            <label className={LABEL_STYLE}>
              <Clarification
                term="Card Number, Expiry & CVC"
                description={PAYMENT_FORM_DESCRIPTIONS.cardDetails}
              />
            </label>
            <InputGroup
              name="cardDetails"
              register={register}
              placeholder="1234 5678 9012 3456 MM/YY CVC"
              error={errors.cardDetails?.message}
              value={cardDetails}
              overlay={
                cardDetails ? buildCardDetailsOverlay(cardDetails) : null
              }
              icon={
                <CardTypeIcon cardNumber={getCardNumberPreview(cardDetails)} />
              }
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={34}
              onChange={(e) => {
                const formatted = formatCardDetails(e.target.value);
                setValue("cardDetails", formatted, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              rules={{
                validate: validateCardDetails,
                setValueAs: (value) => formatCardDetails(value),
              }}
            />
          </div>
          <div className="space-y-1 md:col-span-5">
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
          <div className="space-y-1 md:col-span-2">
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
