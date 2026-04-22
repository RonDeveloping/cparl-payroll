"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import FormSection from "@/components/form/form-section";
import { FormGrid } from "@/components/form/form-grid";
import InputGroup from "@/components/form/input-group";
import { Clarification } from "@/components/clarification";
import { BUTTON_VARIANTS, LABEL_STYLE } from "@/constants/styles";
import { PAYMENT_FORM_DESCRIPTIONS } from "@/constants/payment-fields";
import formatPostalCode from "@/utils/formatters/postalCode";
import CardTypeIcon from "@/components/payments/card-type-icon";
import { cn } from "@/lib/utils";

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

type OverlayStatus = "empty" | "warning" | "success" | "error";
type PromptTone = "neutral" | "warning" | "error" | "success";

const getStatusClass = (status: OverlayStatus) => {
  if (status === "error") {
    return {
      label: "text-[10px] font-semibold uppercase tracking-wide text-red-600",
      value: "text-red-600",
      placeholder: "placeholder:text-red-400",
    };
  }

  if (status === "warning") {
    return {
      label: "text-[10px] font-semibold uppercase tracking-wide text-amber-500",
      value: "text-amber-600",
      placeholder: "placeholder:text-amber-400",
    };
  }

  return {
    label: "text-[10px] font-semibold uppercase tracking-wide text-green-600",
    value: "text-slate-900",
    placeholder: "placeholder:text-slate-400",
  };
};

const formatExpiryInput = (value: string) => {
  const digits = normalizeDigits(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const getCardNumberStatus = (cardNumber: string): OverlayStatus => {
  if (!cardNumber) {
    return "empty";
  }

  const brand = detectCardBrand(cardNumber);
  const allowedLengths = getAllowedCardLengths(brand);
  const minLength = Math.min(...allowedLengths);

  if (cardNumber.length < minLength) {
    return "warning";
  }

  if (allowedLengths.includes(cardNumber.length)) {
    return isValidLuhn(cardNumber) ? "success" : "error";
  }

  return cardNumber.length < Math.max(...allowedLengths) ? "warning" : "error";
};

const getExpiryStatus = (expiryDigits: string): OverlayStatus => {
  if (!expiryDigits) {
    return "empty";
  }

  const expiryMonth = expiryDigits.slice(0, 2);
  const expiryYear = expiryDigits.slice(2, 4);

  if (expiryMonth.length < 2 || expiryYear.length < 2) {
    return "warning";
  }

  const monthValue = Number(expiryMonth);
  const expandedYear = expandExpiryYear(expiryYear);

  if (monthValue < 1 || monthValue > 12) {
    return "error";
  }

  if (Number.isNaN(expandedYear) || isExpired(monthValue, expandedYear)) {
    return "error";
  }

  return "success";
};

const getCvcStatus = (cvc: string, brand: CardBrand): OverlayStatus => {
  if (!cvc) {
    return "empty";
  }

  const expectedLength = getCommonCvcLength(brand);

  if (cvc.length < expectedLength) {
    return "warning";
  }

  return cvc.length === expectedLength ? "success" : "error";
};

const getCardDetailsPrompt = ({
  cardNumber,
  expiryDigits,
  cvc,
  brand,
  cardNumberStatus,
  expiryStatus,
  cvcStatus,
  activeSegment,
}: {
  cardNumber: string;
  expiryDigits: string;
  cvc: string;
  brand: CardBrand;
  cardNumberStatus: OverlayStatus;
  expiryStatus: OverlayStatus;
  cvcStatus: OverlayStatus;
  activeSegment: "card" | "expiry" | "cvc" | null;
}): { text: string; tone: PromptTone } => {
  const expectedCvcLength = getCommonCvcLength(brand);
  const expiryMonth = expiryDigits.slice(0, 2);
  const expiryYear = expiryDigits.slice(2, 4);

  if (activeSegment === "expiry") {
    if (expiryStatus === "error") {
      const monthValue = Number(expiryMonth);
      if (expiryMonth.length === 2 && (monthValue < 1 || monthValue > 12)) {
        return {
          text: "Expiry month must be between 01 and 12.",
          tone: "error",
        };
      }
      if (expiryMonth.length === 2 && expiryYear.length === 2) {
        return {
          text: "Card expiry date is invalid or expired.",
          tone: "error",
        };
      }
      return {
        text: "Enter a valid expiry date in MM/YY format.",
        tone: "error",
      };
    }
    if (expiryStatus === "success") {
      return {
        text: `Expiry looks good. Enter your ${expectedCvcLength}-digit CVV.`,
        tone: "neutral",
      };
    }
    return {
      text: "Enter expiry month and year in MM/YY format.",
      tone: "neutral",
    };
  }

  if (activeSegment === "cvc") {
    if (cvcStatus === "error") {
      return {
        text: `CVV should be ${expectedCvcLength} digits for this card type.`,
        tone: "error",
      };
    }
    if (cvcStatus === "success") {
      return { text: "Card details look complete.", tone: "success" };
    }
    return {
      text: `Enter your ${expectedCvcLength}-digit CVV.`,
      tone: "neutral",
    };
  }

  if (!cardNumber && !expiryDigits && !cvc) {
    return {
      text: "Enter card number, expiry in MM/YY format, and CVV.",
      tone: "neutral",
    };
  }

  if (cardNumberStatus === "warning") {
    return {
      text: "Continue entering your card number.",
      tone: "neutral",
    };
  }

  if (cardNumberStatus === "error") {
    return {
      text: "Card number looks invalid. Please check the digits.",
      tone: "error",
    };
  }

  if (cardNumberStatus === "success" && !expiryDigits) {
    return {
      text: "Card number looks good. Enter expiry month and year in MM/YY format.",
      tone: "neutral",
    };
  }

  if (expiryStatus === "warning") {
    return {
      text: "Enter expiry month and year in MM/YY format.",
      tone: "neutral",
    };
  }

  if (expiryStatus === "error") {
    const monthValue = Number(expiryMonth);
    if (expiryMonth.length === 2 && (monthValue < 1 || monthValue > 12)) {
      return {
        text: "Expiry month must be between 01 and 12.",
        tone: "error",
      };
    }

    if (expiryMonth.length === 2 && expiryYear.length === 2) {
      return {
        text: "Card expiry date is invalid or expired.",
        tone: "error",
      };
    }

    return {
      text: "Enter a valid expiry date in MM/YY format.",
      tone: "error",
    };
  }

  if (expiryStatus === "success" && !cvc) {
    return {
      text: `Expiry looks good. Enter your ${expectedCvcLength}-digit CVV.`,
      tone: "neutral",
    };
  }

  if (cvcStatus === "warning") {
    return {
      text: `Continue entering CVV (${expectedCvcLength} digits expected).`,
      tone: "neutral",
    };
  }

  if (cvcStatus === "error") {
    return {
      text: `CVV should be ${expectedCvcLength} digits for this card type.`,
      tone: "error",
    };
  }

  return {
    text: "Card details look complete.",
    tone: "success",
  };
};

const focusInputForReplace = (input: HTMLInputElement | null) => {
  if (!input) {
    return;
  }

  input.focus();
  input.setSelectionRange(0, input.value.length);

  // Re-apply after layout to prevent browser from restoring a collapsed cursor.
  requestAnimationFrame(() => {
    input.setSelectionRange(0, input.value.length);
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
  const expiryDigits = `${expiryMonth}${expiryYear}`;

  const cardNumberStatus = getCardNumberStatus(cardNumber);
  const expiryStatus = getExpiryStatus(expiryDigits);
  const cvcStatus = getCvcStatus(cvc, brand);

  if (cardNumberStatus === "warning") {
    return "Continue entering your card number";
  }

  if (cardNumberStatus === "error") {
    return "Card number looks invalid. Please check the digits";
  }

  if (expiryStatus === "empty") {
    return "Enter expiry month and year in MM/YY format";
  }

  if (expiryStatus === "warning") {
    return "Enter expiry month and year in MM/YY format";
  }

  if (expiryStatus === "error") {
    const monthValue = Number(expiryMonth);
    if (expiryMonth.length === 2 && (monthValue < 1 || monthValue > 12)) {
      return "Expiry month must be between 01 and 12";
    }

    return "Card expiry date is invalid or expired";
  }

  if (cvcStatus === "empty") {
    return `Enter ${commonCvcLength}-digit CVV`;
  }

  if (cvcStatus === "warning") {
    return `Enter ${commonCvcLength}-digit CVV`;
  }

  if (cvcStatus === "error") {
    return `CVV should be ${commonCvcLength} digits for this card type`;
  }

  if (!parseCardDetails(value)) {
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
  const cardNumberFieldRef = useRef<HTMLInputElement | null>(null);
  const expiryFieldRef = useRef<HTMLInputElement | null>(null);
  const cvcFieldRef = useRef<HTMLInputElement | null>(null);
  const [cardNumberInput, setCardNumberInput] = useState("");
  const [expiryInput, setExpiryInput] = useState("");
  const [cvcInput, setCvcInput] = useState("");
  const [activeSegment, setActiveSegment] = useState<
    "card" | "expiry" | "cvc" | null
  >(null);

  const normalizedGivenName = (userGivenName || "").trim();
  const normalizedFamilyName = (userFamilyName || "").trim();
  const cardholderAutofillName = [normalizedGivenName, normalizedFamilyName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const shouldUseAutofillName =
    cardholderAutofillName.length >= 5 &&
    [normalizedGivenName, normalizedFamilyName]
      .filter(Boolean)
      .every((namePart) => namePart.length >= 2);
  const cardholderPlaceholder = shouldUseAutofillName
    ? cardholderAutofillName
    : "Full name as shown on card";

  const postalCodePlaceholder = userPrimaryPostalCode
    ? formatPostalCode(userPrimaryPostalCode)
    : "K1K 1K1";

  const {
    register,
    handleSubmit,
    setValue,
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

  const cardBrand = detectCardBrand(cardNumberInput);
  const formattedCardNumber = formatCardNumber(cardNumberInput);
  const formattedExpiry = formatExpiryInput(expiryInput);
  const cardNumberStatus = getCardNumberStatus(cardNumberInput);
  const expiryStatus = getExpiryStatus(expiryInput);
  const cvcStatus = getCvcStatus(cvcInput, cardBrand);
  const cardNumberClasses = getStatusClass(cardNumberStatus);
  const expiryClasses = getStatusClass(expiryStatus);
  const cvcClasses = getStatusClass(cvcStatus);
  const cardDetailsPrompt = getCardDetailsPrompt({
    cardNumber: cardNumberInput,
    expiryDigits: expiryInput,
    cvc: cvcInput,
    brand: cardBrand,
    cardNumberStatus,
    expiryStatus,
    cvcStatus,
    activeSegment,
  });
  const cardDetailsPromptClass =
    cardDetailsPrompt.tone === "error"
      ? "text-red-500"
      : cardDetailsPrompt.tone === "success"
        ? "text-green-600"
        : "text-slate-500";

  const syncCardDetails = (
    nextCardNumber: string,
    nextExpiry: string,
    nextCvc: string,
  ) => {
    const composedValue = [
      formatCardNumber(nextCardNumber),
      formatExpiryInput(nextExpiry),
      nextCvc,
    ]
      .filter(Boolean)
      .join(" ");

    setValue("cardDetails", composedValue, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleCardNumberChange = (value: string) => {
    const previousCardNumberStatus = getCardNumberStatus(cardNumberInput);
    const nextCardNumber = normalizeDigits(value).slice(0, 19);
    const nextCvc = cvcInput.slice(0, 4);
    const nextCardNumberStatus = getCardNumberStatus(nextCardNumber);

    setCardNumberInput(nextCardNumber);
    if (nextCvc !== cvcInput) {
      setCvcInput(nextCvc);
    }

    syncCardDetails(nextCardNumber, expiryInput, nextCvc);

    const shouldMoveToExpiry =
      previousCardNumberStatus !== "success" &&
      nextCardNumberStatus === "success" &&
      document.activeElement === cardNumberFieldRef.current;

    if (shouldMoveToExpiry) {
      requestAnimationFrame(() => {
        focusInputForReplace(expiryFieldRef.current);
      });
    }
  };

  const handleExpiryChange = (value: string) => {
    const previousExpiryStatus = getExpiryStatus(expiryInput);
    const nextExpiry = normalizeDigits(value).slice(0, 4);
    const nextExpiryStatus = getExpiryStatus(nextExpiry);

    setExpiryInput(nextExpiry);
    syncCardDetails(cardNumberInput, nextExpiry, cvcInput);

    const shouldMoveToCvc =
      previousExpiryStatus !== "success" &&
      nextExpiryStatus === "success" &&
      document.activeElement === expiryFieldRef.current;

    if (shouldMoveToCvc) {
      requestAnimationFrame(() => {
        focusInputForReplace(cvcFieldRef.current);
      });
    }
  };

  const handleCvcChange = (value: string) => {
    const nextCvc = normalizeDigits(value).slice(0, 4);
    setCvcInput(nextCvc);
    syncCardDetails(cardNumberInput, expiryInput, nextCvc);
  };

  const handleCardholderNameFocus = () => {
    if (shouldUseAutofillName) {
      setValue("cardholderName", cardholderAutofillName);
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
          <div className="space-y-1 md:col-span-5 lg:col-span-6">
            <label className={LABEL_STYLE}>
              <Clarification
                term="Card Details"
                description={PAYMENT_FORM_DESCRIPTIONS.cardDetails}
              />
            </label>
            <input
              type="hidden"
              {...register("cardDetails", {
                validate: validateCardDetails,
                setValueAs: (value) => formatCardDetails(value),
              })}
            />
            <div className="space-y-1">
              <div
                className={cn(
                  "relative flex min-h-[50px] w-full rounded-lg border bg-white text-sm transition-all",
                  errors.cardDetails?.message
                    ? "border-red-500 focus-within:ring-2 focus-within:ring-red-100"
                    : "border-slate-200 focus-within:ring-2 focus-within:ring-blue-500",
                )}
              >
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <CardTypeIcon
                    cardNumber={getCardNumberPreview(cardNumberInput)}
                  />
                </div>

                <div className="flex w-full items-stretch gap-3 pl-14 pr-4">
                  <div className="flex min-w-0 max-w-[clamp(19ch,44vw,25ch)] flex-[1_1_clamp(19ch,44vw,25ch)] flex-col justify-center py-1.5">
                    {cardNumberInput ? (
                      <div className={cardNumberClasses.label}>Card number</div>
                    ) : null}
                    <input
                      type="text"
                      ref={cardNumberFieldRef}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={formattedCardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      onFocus={() => setActiveSegment("card")}
                      placeholder="Card number"
                      className={cn(
                        "w-full min-w-0 bg-transparent outline-none placeholder:text-slate-300",
                        cardNumberInput
                          ? cardNumberClasses.value
                          : "text-slate-400",
                        cardNumberClasses.placeholder,
                      )}
                    />
                  </div>

                  <div className="flex w-[3.75rem] flex-col items-start justify-center py-1.5">
                    {expiryInput ? (
                      <div className={expiryClasses.label}>MM/YY</div>
                    ) : null}
                    <input
                      type="text"
                      ref={expiryFieldRef}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      maxLength={5}
                      value={formattedExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      onFocus={() => setActiveSegment("expiry")}
                      placeholder="MM/YY"
                      className={cn(
                        "w-full bg-transparent text-left outline-none placeholder:text-slate-300",
                        expiryInput ? expiryClasses.value : "text-slate-400",
                        expiryClasses.placeholder,
                      )}
                    />
                  </div>

                  <div className="flex w-12 flex-col items-start justify-center py-1.5">
                    {cvcInput ? (
                      <div className={cvcClasses.label}>CVV</div>
                    ) : null}
                    <input
                      type="text"
                      ref={cvcFieldRef}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={4}
                      value={cvcInput}
                      onChange={(e) => handleCvcChange(e.target.value)}
                      onFocus={() => setActiveSegment("cvc")}
                      placeholder="CVV"
                      className={cn(
                        "w-full bg-transparent text-left outline-none placeholder:text-slate-300",
                        cvcInput ? cvcClasses.value : "text-slate-400",
                        cvcClasses.placeholder,
                      )}
                    />
                  </div>
                </div>
              </div>
              {errors.cardDetails?.message && (
                <span className="ml-1 text-[10px] font-medium text-red-500">
                  {errors.cardDetails.message}
                </span>
              )}
              {!errors.cardDetails?.message && (
                <span
                  className={cn(
                    "ml-1 text-[10px] font-medium",
                    cardDetailsPromptClass,
                  )}
                >
                  {cardDetailsPrompt.text}
                </span>
              )}
            </div>
          </div>
          <div className="space-y-1 md:col-span-5 lg:col-span-4">
            <label className={LABEL_STYLE}>Cardholder Name</label>
            <InputGroup
              name="cardholderName"
              register={register}
              placeholder={cardholderPlaceholder}
              inputClassName="min-h-[50px] placeholder:text-slate-300"
              error={errors.cardholderName?.message}
              onFocus={handleCardholderNameFocus}
              rules={{
                required: "Cardholder name is required",
                minLength: { value: 2, message: "Enter the full name" },
                setValueAs: (value) => value.trim(),
              }}
            />
          </div>
          <div className="space-y-1 md:col-span-2 lg:col-span-2">
            <label className={cn(LABEL_STYLE, "whitespace-nowrap")}>
              Billing Postal Code
            </label>
            <InputGroup
              name="billingPostalCode"
              register={register}
              placeholder={postalCodePlaceholder}
              inputClassName="min-h-[50px] placeholder:text-slate-300"
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
