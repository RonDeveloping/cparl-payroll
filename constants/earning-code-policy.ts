import { type EarningTypeValue } from "@/constants/earning-types";

export type EarningCodePolicyMode = "FLEXIBLE" | "GUARDED" | "STRICT";

export type EarningCodeFlags = {
  isHourly: boolean;
  isTaxable: boolean;
  isSubjectToCPP: boolean;
  isSubjectToEI: boolean;
};

export type PolicySeverity = "warning" | "hard-stop";

export type PolicyIssue = {
  severity: PolicySeverity;
  message: string;
};

type Rule = {
  severity: PolicySeverity;
  message: string;
  when: (flags: EarningCodeFlags) => boolean;
};

type EarningTypePolicyDefinition = {
  defaults: EarningCodeFlags;
  rules: Rule[];
};

export const EARNING_CODE_POLICY_MATRIX: Record<
  EarningTypeValue,
  EarningTypePolicyDefinition
> = {
  REGULAR: {
    defaults: {
      isHourly: true,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: true,
    },
    rules: [
      {
        severity: "warning",
        message:
          "Regular earnings are commonly taxable and subject to CPP/EI. Confirm exemption rules before saving.",
        when: (flags) =>
          !flags.isTaxable || !flags.isSubjectToCPP || !flags.isSubjectToEI,
      },
    ],
  },
  OVERTIME: {
    defaults: {
      isHourly: true,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: true,
    },
    rules: [
      {
        severity: "warning",
        message:
          "Overtime is usually tracked as hour-based earnings. Verify this code if Hourly is turned off.",
        when: (flags) => !flags.isHourly,
      },
      {
        severity: "warning",
        message:
          "Overtime is normally taxable and pensionable/insurable. Confirm treatment with payroll guidance.",
        when: (flags) =>
          !flags.isTaxable || !flags.isSubjectToCPP || !flags.isSubjectToEI,
      },
    ],
  },
  SICK: {
    defaults: {
      isHourly: false,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: true,
    },
    rules: [
      {
        severity: "warning",
        message:
          "Sick pay can be non-taxable in some reimbursed programs. Confirm this exception is intended.",
        when: (flags) => !flags.isTaxable,
      },
    ],
  },
  HOLIDAY: {
    defaults: {
      isHourly: false,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: true,
    },
    rules: [
      {
        severity: "warning",
        message:
          "Holiday pay is generally taxable and subject to CPP/EI. Verify before disabling these flags.",
        when: (flags) =>
          !flags.isTaxable || !flags.isSubjectToCPP || !flags.isSubjectToEI,
      },
    ],
  },
  VACATION: {
    defaults: {
      isHourly: false,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: true,
    },
    rules: [
      {
        severity: "warning",
        message:
          "Vacation pay is usually taxable and pensionable/insurable. Confirm any override is intentional.",
        when: (flags) =>
          !flags.isTaxable || !flags.isSubjectToCPP || !flags.isSubjectToEI,
      },
    ],
  },
  BONUS: {
    defaults: {
      isHourly: false,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: true,
    },
    rules: [
      {
        severity: "warning",
        message:
          "Bonuses are generally taxable and subject to CPP/EI unless a documented exception applies.",
        when: (flags) =>
          !flags.isTaxable || !flags.isSubjectToCPP || !flags.isSubjectToEI,
      },
    ],
  },
  COMMISSION: {
    defaults: {
      isHourly: false,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: true,
    },
    rules: [
      {
        severity: "warning",
        message:
          "Commission is typically taxable and pensionable/insurable. Verify this override with payroll guidance.",
        when: (flags) =>
          !flags.isTaxable || !flags.isSubjectToCPP || !flags.isSubjectToEI,
      },
    ],
  },
  TAXABLE_BENEFIT: {
    defaults: {
      isHourly: false,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: false,
    },
    rules: [
      {
        severity: "hard-stop",
        message: "Taxable Benefit must remain taxable.",
        when: (flags) => !flags.isTaxable,
      },
      {
        severity: "warning",
        message:
          "Many taxable benefits are not EI-insurable. Confirm EI treatment for this specific benefit.",
        when: (flags) => flags.isSubjectToEI,
      },
    ],
  },
  REASONABLE_ALLOWANCE: {
    defaults: {
      isHourly: false,
      isTaxable: false,
      isSubjectToCPP: false,
      isSubjectToEI: false,
    },
    rules: [
      {
        severity: "hard-stop",
        message: "Reasonable Allowance cannot be marked as hourly earnings.",
        when: (flags) => flags.isHourly,
      },
      {
        severity: "warning",
        message:
          "If this allowance is taxable, it may no longer qualify as a reasonable allowance.",
        when: (flags) => flags.isTaxable,
      },
    ],
  },
  OTHER: {
    defaults: {
      isHourly: false,
      isTaxable: true,
      isSubjectToCPP: true,
      isSubjectToEI: true,
    },
    rules: [
      {
        severity: "warning",
        message:
          "OTHER should include a well-documented payroll rationale when diverging from taxable/CPP/EI defaults.",
        when: (flags) =>
          !flags.isTaxable || !flags.isSubjectToCPP || !flags.isSubjectToEI,
      },
    ],
  },
};

export function getDefaultsByEarningType(
  earningType: EarningTypeValue,
): EarningCodeFlags {
  return EARNING_CODE_POLICY_MATRIX[earningType].defaults;
}

export function isCustomizedFromStandard(
  earningType: EarningTypeValue,
  flags: EarningCodeFlags,
) {
  const defaults = getDefaultsByEarningType(earningType);

  return (
    flags.isHourly !== defaults.isHourly ||
    flags.isTaxable !== defaults.isTaxable ||
    flags.isSubjectToCPP !== defaults.isSubjectToCPP ||
    flags.isSubjectToEI !== defaults.isSubjectToEI
  );
}

export function evaluateEarningTypePolicy(
  earningType: EarningTypeValue,
  flags: EarningCodeFlags,
): PolicyIssue[] {
  return EARNING_CODE_POLICY_MATRIX[earningType].rules
    .filter((rule) => rule.when(flags))
    .map((rule) => ({
      severity: rule.severity,
      message: rule.message,
    }));
}

export function normalizePolicyMode(mode: unknown): EarningCodePolicyMode {
  if (mode === "FLEXIBLE" || mode === "GUARDED" || mode === "STRICT") {
    return mode;
  }

  return "GUARDED";
}
