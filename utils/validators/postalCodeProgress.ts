// utils/validators/postalCodeProgress.ts
import { isValidCanadianPostalCode } from "@/utils/validators/postalCode";

export type PostalCodeProgressTone =
  | "neutral"
  | "success"
  | "warning"
  | "error";

const canadianPostalPrefixRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]$/i;

// Curated FSA -> neighbourhood for Ottawa and Toronto only; falls back to province-level for all others.
const fsaNeighbourhoodMap: Record<string, string> = {
  // Ottawa - downtown / central
  K1A: "Ottawa (Federal Buildings)",
  K1N: "Ottawa (Lowertown / Sandy Hill)",
  K1P: "Ottawa (Downtown Core)",
  K1R: "Ottawa (Downtown West)",
  K1S: "Ottawa (Glebe / Old Ottawa South)",
  K1Y: "Ottawa (Westboro)",
  K1Z: "Ottawa (Westboro / Hampton Park)",
  K2P: "Ottawa (Centretown)",
  // Ottawa - east
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
  K4A: "Ottawa (Orleans)",
  K4C: "Ottawa (Cumberland)",
  // Ottawa - west / Nepean / Kanata
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
  // Toronto - downtown core
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
  // Toronto - midtown / inner city
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
  // Toronto - Scarborough
  M1B: "Toronto (Scarborough - Malvern)",
  M1C: "Toronto (Scarborough - Highland Creek)",
  M1E: "Toronto (Scarborough - West Hill)",
  M1G: "Toronto (Scarborough - Woburn)",
  M1H: "Toronto (Scarborough - Cedarbrae)",
  M1J: "Toronto (Scarborough Village)",
  M1K: "Toronto (Scarborough - Kennedy Park)",
  M1P: "Toronto (Scarborough - Dorset Park)",
  M1R: "Toronto (Scarborough - Wexford)",
  M1S: "Toronto (Scarborough - Agincourt)",
  M1V: "Toronto (Scarborough - Milliken)",
  M1W: "Toronto (Scarborough - Steeles)",
  // Toronto - North York
  M2H: "Toronto (North York - Hillcrest Village)",
  M2K: "Toronto (North York - Bayview Village)",
  M2M: "Toronto (North York - Willowdale)",
  M2N: "Toronto (North York - Willowdale West)",
  M3A: "Toronto (North York - Parkwoods)",
  M3C: "Toronto (North York - Don Mills)",
  M3H: "Toronto (North York - Bathurst Manor)",
  M3J: "Toronto (North York - Northwood Park)",
  M3K: "Toronto (North York - Downsview)",
  // Toronto - Etobicoke
  M8V: "Toronto (Etobicoke - Mimico)",
  M8X: "Toronto (Etobicoke - Kingsway)",
  M8Y: "Toronto (Etobicoke - Old Mill)",
  M9A: "Toronto (Etobicoke - Islington)",
  M9B: "Toronto (Etobicoke - West Deane Park)",
  M9C: "Toronto (Etobicoke - Eringate)",
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

export function getPostalCodeProgress(value: string): {
  text: string;
  tone: PostalCodeProgressTone;
} {
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
}
