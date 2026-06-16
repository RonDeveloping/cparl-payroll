"use client";
// components/payments/payment-method-form.tsx

import { useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import FormSection from "@/components/form/form-section";
import { FormGrid } from "@/components/form/form-grid";
import InputGroup from "@/components/form/input-group";
import { Clarification } from "@/components/clarification";
import { formActionsStyles } from "@/constants/styles";
import { paymentFieldContent } from "@/constants/content";
import formatPostalCode from "@/utils/formatters/postalCode";
import { isValidCanadianPostalCode } from "@/utils/validators/postalCode";
import CardTypeIcon from "@/components/payments/card-type-icon";
import { cn } from "@/lib/utils";
import {
  createPaymentMethod,
  type CreatePaymentMethodPayload,
  type SavedPaymentCard,
} from "@/lib/api";

export type PaymentMethodFormValues = {
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

const isImplausiblyFarExpiry = (year: number) => {
  const currentYear = new Date().getFullYear();
  const maxFutureYears = 10;
  return year > currentYear + maxFutureYears;
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

      if (
        Number.isNaN(expiryYear) ||
        isExpired(monthNumber, expiryYear) ||
        isImplausiblyFarExpiry(expiryYear)
      ) {
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
type PostalCodeProgressTone = "neutral" | "success" | "warning" | "error";
const canadianPostalPrefixRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]$/i;

// Curated FSA → neighbourhood for Ottawa and Toronto only; falls back to province-level for all others.
const fsaNeighbourhoodMap: Record<string, string> = {
  // Ottawa – downtown / central
  K1A: "Ottawa (Federal Buildings)",
  K1N: "Ottawa (Lowertown / Sandy Hill)",
  K1P: "Ottawa (Downtown Core)",
  K1R: "Ottawa (Downtown West)",
  K1S: "Ottawa (Glebe / Old Ottawa South)",
  K1Y: "Ottawa (Westboro)",
  K1Z: "Ottawa (Westboro / Hampton Park)",
  K2P: "Ottawa (Centretown)",
  // Ottawa – east
  K1B: "Ottawa (East)",
  K1C: "Ottawa (East)",
  K1E: "Ottawa (East)",
  K1G: "Ottawa (East)",
  K1H: "Ottawa (South)",
  K1J: "Ottawa (North)",
  K1K: "Ottawa (East)",
  K1L: "Ottawa (East)",
  K1M: "Ottawa (Rockcliffe)",
  K1T: "Ottawa (South)",
  K1V: "Ottawa (South)",
  K1W: "Ottawa (East)",
  K1X: "Ottawa (South)",
  K4A: "Ottawa (Orléans)",
  K4C: "Ottawa (Cumberland)",
  // Ottawa – west / Nepean / Kanata
  K2A: "Ottawa (West)",
  K2B: "Ottawa (West)",
  K2C: "Ottawa (West)",
  K2E: "Ottawa (Nepean)",
  K2G: "Ottawa (Nepean)",
  K2H: "Ottawa (Nepean West)",
  K2J: "Ottawa (Barrhaven)",
  K2K: "Ottawa (Kanata)",
  K2L: "Ottawa (Kanata)",
  K2M: "Ottawa (Kanata)",
  K2R: "Ottawa (Nepean)",
  K2S: "Ottawa (Stittsville)",
  K2T: "Ottawa (Kanata North)",
  K2V: "Ottawa (Kanata / Stittsville)",
  K2W: "Ottawa (Kanata)",
  // Toronto – downtown core
  M5A: "Toronto (Regent Park)",
  M5B: "Toronto (Garden District)",
  M5C: "Toronto (St. James Town)",
  M5E: "Toronto (Berczy Park)",
  M5G: "Toronto (Discovery District)",
  M5H: "Toronto (Adelaide)",
  M5J: "Toronto (Harbourfront)",
  M5K: "Toronto (Design Exchange)",
  M5L: "Toronto (Commerce Court)",
  M5S: "Toronto (University of Toronto)",
  M5T: "Toronto (Kensington Market)",
  M5V: "Toronto (Downtown West / CN Tower)",
  M5X: "Toronto (First Canadian Place)",
  M7A: "Toronto (Queen's Park)",
  // Toronto – midtown / inner city
  M4E: "Toronto (The Beaches)",
  M4G: "Toronto (Leaside)",
  M4J: "Toronto (East End)",
  M4K: "Toronto (The Danforth)",
  M4M: "Toronto (Studio District)",
  M4N: "Toronto (Lawrence Park)",
  M4P: "Toronto (Davisville Village)",
  M4R: "Toronto (North Toronto)",
  M4T: "Toronto (Moore Park)",
  M4V: "Toronto (Summerhill)",
  M4W: "Toronto (Rosedale)",
  M4X: "Toronto (Cabbagetown)",
  M4Y: "Toronto (Church-Yonge Corridor)",
  M5M: "Toronto (Bedford Park)",
  M5N: "Toronto (Roselawn)",
  M5P: "Toronto (Forest Hill North)",
  M5R: "Toronto (The Annex)",
  M6G: "Toronto (Dovercourt-Wallace)",
  M6H: "Toronto (Dufferin Grove)",
  M6J: "Toronto (Little Portugal)",
  M6K: "Toronto (Brockton Village)",
  M6P: "Toronto (High Park North)",
  M6R: "Toronto (Parkdale)",
  M6S: "Toronto (Runnymede)",
  // Toronto – Scarborough
  M1B: "Toronto (Scarborough – Malvern)",
  M1C: "Toronto (Scarborough – Highland Creek)",
  M1E: "Toronto (Scarborough – West Hill)",
  M1G: "Toronto (Scarborough – Woburn)",
  M1H: "Toronto (Scarborough – Cedarbrae)",
  M1J: "Toronto (Scarborough Village)",
  M1K: "Toronto (Scarborough – Kennedy Park)",
  M1P: "Toronto (Scarborough – Dorset Park)",
  M1R: "Toronto (Scarborough – Wexford)",
  M1S: "Toronto (Scarborough – Agincourt)",
  M1V: "Toronto (Scarborough – Milliken)",
  M1W: "Toronto (Scarborough – Steeles)",
  // Toronto – North York
  M2H: "Toronto (North York – Hillcrest Village)",
  M2K: "Toronto (North York – Bayview Village)",
  M2M: "Toronto (North York – Willowdale)",
  M2N: "Toronto (North York – Willowdale West)",
  M3A: "Toronto (North York – Parkwoods)",
  M3C: "Toronto (North York – Don Mills)",
  M3H: "Toronto (North York – Bathurst Manor)",
  M3J: "Toronto (North York – Northwood Park)",
  M3K: "Toronto (North York – Downsview)",
  // Toronto – Etobicoke
  M8V: "Toronto (Etobicoke – Mimico)",
  M8X: "Toronto (Etobicoke – Kingsway)",
  M8Y: "Toronto (Etobicoke – Old Mill)",
  M9A: "Toronto (Etobicoke – Islington)",
  M9B: "Toronto (Etobicoke – West Deane Park)",
  M9C: "Toronto (Etobicoke – Eringate)",
  M9N: "Toronto (Weston)",
  M9P: "Toronto (Westmount)",
  M9W: "Toronto (Rexdale)",
};

const getFsaNeighbourhood = (fsa: string): string | null =>
  fsaNeighbourhoodMap[fsa.toUpperCase()] ?? null;

const getPostalAreaName = (prefix: string): string | null => {
  const firstChar = prefix.toUpperCase().charAt(0);

  const areaByFirstChar: Record<string, string> = {
    A: "Newfoundland and Labrador",
    B: "Nova Scotia",
    C: "Prince Edward Island",
    E: "New Brunswick",
    G: "Quebec",
    H: "Quebec",
    J: "Quebec",
    K: "Eastern Ontario",
    L: "Central Ontario",
    M: "Toronto",
    N: "Southwestern Ontario",
    P: "Northern Ontario",
    R: "Manitoba",
    S: "Saskatchewan",
    T: "Alberta",
    V: "British Columbia",
    X: "Northwest Territories/Nunavut",
    Y: "Yukon",
  };

  return areaByFirstChar[firstChar] ?? null;
};

const getPostalCodeProgress = (
  value: string,
): { text: string; tone: PostalCodeProgressTone } => {
  const normalized = value.replace(/\s+/g, "").toUpperCase();
  const length = normalized.length;
  const firstChar = normalized.charAt(0);
  const secondChar = normalized.charAt(1);
  const thirdChar = normalized.charAt(2);
  const fourthChar = normalized.charAt(3);
  const fifthChar = normalized.charAt(4);
  const sixthChar = normalized.charAt(5);

  const firstCharValid = /^[ABCEGHJ-NPRSTVXY]$/.test(firstChar);
  const secondCharValid = /^\d$/.test(secondChar);
  const thirdCharValid = /^[ABCEGHJ-NPRSTV-Z]$/.test(thirdChar);
  const fourthCharValid = /^\d$/.test(fourthChar);
  const fifthCharValid = /^[ABCEGHJ-NPRSTV-Z]$/.test(fifthChar);
  const sixthCharValid = /^\d$/.test(sixthChar);

  if (length === 0) {
    return {
      text: "",
      tone: "neutral",
    };
  }

  if (length === 1) {
    if (!firstCharValid) {
      return {
        text: "1st char should be a letter.",
        tone: "warning",
      };
    }

    const areaName = getPostalAreaName(normalized);
    return {
      text: areaName ? `${areaName}.` : "Enter first 3 characters.",
      tone: areaName ? "success" : "neutral",
    };
  }

  if (length === 2) {
    if (!firstCharValid) {
      return {
        text: "1st char should be a letter.",
        tone: "warning",
      };
    }

    if (!secondCharValid) {
      return {
        text: "2nd char should be a number.",
        tone: "warning",
      };
    }

    const areaName = getPostalAreaName(normalized);
    const urbanRural = secondChar === "0" ? "Rural" : "Urban";
    return {
      text: areaName ? `${areaName}, ${urbanRural}.` : `${urbanRural} area.`,
      tone: areaName ? "success" : "neutral",
    };
  }

  if (length === 3) {
    if (!firstCharValid) {
      return {
        text: "1st char should be a letter.",
        tone: "warning",
      };
    }

    if (!secondCharValid) {
      return {
        text: "2nd char should be a number.",
        tone: "warning",
      };
    }

    if (!thirdCharValid) {
      return {
        text: "3rd char should be a letter.",
        tone: "warning",
      };
    }

    const isValidPrefix = canadianPostalPrefixRegex.test(normalized);
    if (!isValidPrefix) {
      return {
        text: "Area prefix format is not recognized yet.",
        tone: "neutral",
      };
    }

    const neighbourhood = getFsaNeighbourhood(normalized);
    const areaName = getPostalAreaName(normalized);
    const secondChar = normalized.charAt(1);
    const urbanRural = secondChar === "0" ? "Rural" : "Urban";
    const label =
      neighbourhood ?? (areaName ? `${areaName}, ${urbanRural}` : null);
    return {
      text: label ? `${label}.` : "Area prefix looks good.",
      tone: "success",
    };
  }

  if (length < 6) {
    if (!firstCharValid) {
      return {
        text: "1st char should be a letter.",
        tone: "warning",
      };
    }

    if (!secondCharValid) {
      return {
        text: "2nd char should be a number.",
        tone: "warning",
      };
    }

    if (!thirdCharValid) {
      return {
        text: "3rd char should be a letter.",
        tone: "warning",
      };
    }

    if (length >= 4 && !fourthCharValid) {
      return {
        text: "4th char should be a number.",
        tone: "warning",
      };
    }

    if (length >= 5 && !fifthCharValid) {
      return {
        text: "5th char should be a letter.",
        tone: "warning",
      };
    }

    return {
      text: "Almost there, continue..",
      tone: "success",
    };
  }

  if (length === 6) {
    if (
      !firstCharValid ||
      !secondCharValid ||
      !thirdCharValid ||
      !fourthCharValid ||
      !fifthCharValid ||
      !sixthCharValid
    ) {
      return {
        text: "Invalid; use format A1A 1A1.",
        tone: "error",
      };
    }

    return isValidCanadianPostalCode(normalized)
      ? { text: "All looks good", tone: "success" }
      : {
          text: "Invalid; use format A1A 1A1.",
          tone: "error",
        };
  }

  return {
    text: "Postal code is too long. Use 6 characters.",
    tone: "error",
  };
};

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

  if (
    Number.isNaN(expandedYear) ||
    isExpired(monthValue, expandedYear) ||
    isImplausiblyFarExpiry(expandedYear)
  ) {
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
        text: "Invalid expiry format. Use MM/YY.",
        tone: "error",
      };
    }
    if (expiryStatus === "success") {
      return {
        text: `Expiry looks good. Enter your ${expectedCvcLength}-digit CVV.`,
        tone: "warning",
      };
    }
    return {
      text: "Enter expiry month and year in MM/YY format.",
      tone: "warning",
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
      tone: "warning",
    };
  }

  if (!cardNumber && !expiryDigits && !cvc) {
    return {
      text: "Enter card number, expiry in MM/YY format, and CVV.",
      tone: "warning",
    };
  }

  if (cardNumberStatus === "warning") {
    return {
      text: "Continue entering your card number.",
      tone: "warning",
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
      tone: "warning",
    };
  }

  if (expiryStatus === "warning") {
    return {
      text: "Enter expiry month and year in MM/YY format.",
      tone: "warning",
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
      text: "Invalid expiry format. Use MM/YY.",
      tone: "error",
    };
  }

  if (expiryStatus === "success" && !cvc) {
    return {
      text: `Expiry looks good. Enter your ${expectedCvcLength}-digit CVV.`,
      tone: "warning",
    };
  }

  if (cvcStatus === "warning") {
    return {
      text: `Continue entering CVV (${expectedCvcLength} digits expected).`,
      tone: "warning",
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
    return "Card details are incomplete";
  }

  if (cardNumberStatus === "error") {
    return "Card number looks invalid. Please check the digits";
  }

  if (expiryStatus === "empty") {
    return "Card details are incomplete";
  }

  if (expiryStatus === "warning") {
    return "Card details are incomplete";
  }

  if (expiryStatus === "error") {
    const monthValue = Number(expiryMonth);
    const expandedYear = expandExpiryYear(expiryYear);
    if (expiryMonth.length === 2 && (monthValue < 1 || monthValue > 12)) {
      return "Expiry month must be between 01 and 12";
    }

    if (
      expiryMonth.length === 2 &&
      expiryYear.length === 2 &&
      isImplausiblyFarExpiry(expandedYear)
    ) {
      return "Card expiry date is invalid or expired";
    }

    return "Card expiry date is invalid or expired";
  }

  if (cvcStatus === "empty") {
    return "Card details are incomplete";
  }

  if (cvcStatus === "warning") {
    return "Card details are incomplete";
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
  onSaved,
}: {
  compact?: boolean;
  userGivenName?: string | null;
  userFamilyName?: string | null;
  userPrimaryPostalCode?: string | null;
  onSaved?: (card: SavedPaymentCard) => void;
}) {
  const cardNumberFieldRef = useRef<HTMLInputElement | null>(null);
  const expiryFieldRef = useRef<HTMLInputElement | null>(null);
  const cvcFieldRef = useRef<HTMLInputElement | null>(null);
  const cardDetailsContainerRef = useRef<HTMLDivElement | null>(null);
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

  const postalCodePlaceholder = "A1A 1A1";
  const paymentFieldLabelClass =
    "text-[11px] font-semibold text-slate-500 tracking-normal ml-1";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    trigger,
    control,
    formState: { errors, isSubmitting, isSubmitted },
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
      : cardDetailsPrompt.tone === "warning"
        ? "text-sky-600"
        : cardDetailsPrompt.tone === "success"
          ? "text-green-600"
          : "text-slate-500";
  const billingPostalCodeValue =
    useWatch({ control, name: "billingPostalCode" }) ?? "";
  const postalCodeProgress = getPostalCodeProgress(billingPostalCodeValue);
  const postalCodeProgressClass =
    postalCodeProgress.tone === "error"
      ? "text-red-500"
      : postalCodeProgress.tone === "warning"
        ? "text-yellow-400"
        : postalCodeProgress.tone === "success"
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
      shouldValidate: isSubmitted,
    });
  };

  const handleCardDetailsBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const nextFocused = e.relatedTarget as Node | null;
    const leftCompositeField =
      !nextFocused || !cardDetailsContainerRef.current?.contains(nextFocused);

    if (!leftCompositeField) {
      return;
    }

    setActiveSegment(null);
    void trigger("cardDetails");
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
      const payload: CreatePaymentMethodPayload = {
        cardholderName: data.cardholderName,
        cardNumber: parsedCardDetails.cardNumber,
        expiryMonth: parsedCardDetails.expiryMonth,
        expiryYear: parsedCardDetails.expiryYear,
        cvc: parsedCardDetails.cvc,
        billingPostalCode: data.billingPostalCode
          .replace(/\s+/g, "")
          .toUpperCase(),
      };
      const result = await createPaymentMethod(payload);
      reset({
        cardholderName: "",
        cardDetails: "",
        billingPostalCode: "",
      });
      setCardNumberInput("");
      setExpiryInput("");
      setCvcInput("");
      setActiveSegment(null);
      onSaved?.(result.card);
      toast.success(
        result.card.isDefault
          ? "Card saved and set as your default payment method."
          : "Card saved successfully.",
      );
    } catch (error) {
      console.error("Error saving card:", error);
      toast.error(
        error instanceof Error ? error.message : "Unable to save card.",
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("space-y-6", compact ? "space-y-5" : "")}
    >
      <FormSection
        title="Payment card (credit/debit)"
        titleTag="p"
        titleClassName="text-xs font-semibold normal-case tracking-normal border-none pb-0 mb-0 text-slate-600"
        headerAction={
          <button
            type="submit"
            className={cn(
              formActionsStyles.saveButtonBase,
              isSubmitting
                ? formActionsStyles.saveLocked
                : formActionsStyles.saveActive,
            )}
            disabled={isSubmitting}
          >
            Save
          </button>
        }
      >
        <FormGrid className="md:grid-cols-12">
          <div className="space-y-1 md:col-span-5 lg:col-span-6">
            <label className={paymentFieldLabelClass}>
              <Clarification
                term={paymentFieldContent.cardDetails.term}
                description={paymentFieldContent.cardDetails.description}
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
                ref={cardDetailsContainerRef}
                onBlur={handleCardDetailsBlur}
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
          <div className="space-y-1 md:col-span-5 lg:col-span-4 pr-[9px]">
            <label className={paymentFieldLabelClass}>Cardholder name</label>
            <InputGroup
              name="cardholderName"
              register={register}
              placeholder={cardholderPlaceholder}
              inputClassName="min-h-[50px] placeholder:text-slate-300 text-center"
              error={errors.cardholderName?.message}
              onFocus={handleCardholderNameFocus}
              rules={{
                required: "Cardholder name is required",
                minLength: { value: 2, message: "Enter the full name" },
                setValueAs: (value) => value.trim(),
              }}
            />
          </div>
          <div className="space-y-1 md:col-span-2 lg:col-span-2 w-fit -ml-[13px] pr-[5px]">
            <label className={cn(paymentFieldLabelClass, "whitespace-nowrap")}>
              Billing postal code
            </label>
            <InputGroup
              name="billingPostalCode"
              register={register}
              placeholder={postalCodePlaceholder}
              inputClassName="min-h-[50px] placeholder:text-slate-300 w-[calc(100%+5px)] text-center"
              error={errors.billingPostalCode?.message}
              errorClassName="whitespace-nowrap"
              onFocus={handlePostalCodeFocus}
              onChange={(e) => {
                const formatted = formatPostalCode(e.target.value);
                const normalized = formatted.replace(/\s+/g, "");
                setValue("billingPostalCode", formatted, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: normalized.length === 6,
                });
              }}
              rules={{
                required: "Postal code is required",
                validate: (value) => {
                  const normalized = value.replace(/\s+/g, "").toUpperCase();

                  if (!isSubmitted && normalized.length < 6) {
                    return true;
                  }

                  if (normalized.length !== 6) {
                    return "Invalid; use format A1A 1A1.";
                  }

                  return isValidCanadianPostalCode(normalized)
                    ? true
                    : "Invalid; use format A1A 1A1.";
                },
                setValueAs: (value) => value.replace(/\s+/g, "").toUpperCase(),
              }}
            />
            {!errors.billingPostalCode?.message && (
              <span
                className={cn(
                  "ml-1 text-[10px] font-medium",
                  postalCodeProgressClass,
                )}
              >
                {postalCodeProgress.text}
              </span>
            )}
          </div>
        </FormGrid>
      </FormSection>
    </form>
  );
}
