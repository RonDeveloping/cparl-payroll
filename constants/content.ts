// constants/content.ts
export const setupPasswordContent = {
  verifiedMessage: (email: string) =>
    `${email} is verified and please set up a password:`,
};
export const authContent = {
  verifyEmail: {
    title: "Check your email",
    mainInstruction: (email: string) =>
      `Please click the Verify Email button in the email we sent to <strong>${email}</strong>.`,
    secondaryNote:
      "If the email doesn’t arrive soon, 1) check your spam folder, 2) use Resend... button below, or 3) try logging in to see if it's already been used with a registered account.",
    keepOpenReminder: "Keep this window open for a smoother experience.",
    alreadyVerified: "Invalid or Used Link",
    alreadyVerifiedByEmail: (email: string) =>
      `The email "${email}" has already been verified.`,
  },
  security: {
    deactivationWarning:
      "Resending instantly deactivates any previous ones for security.",
    resendSuccessToast:
      "A new verification link has been dispatched to your email address. Note that any previous links are now invalid for security reasons.",
  },
  errors: {
    noEmail: "No email address found to resend to.",
    generic: "Something went wrong. Please try again.",
    resendFail: "Failed to resend email. Please try again later.",
  },
};

export const mailContent = {
  verification: {
    subject1: "Verify your email address",
    subject2: "Reset your password",
    from: "CPARL Notifications <noreply@verify.cparl.com>",
    replyTo: "ron@cparl.com",
    buttonText: "Verify Email",
    activateInstruction:
      "Please click the button below to verify your email address and set up a password for your account.",
    heading: "Verification is required to start your registration",
  },
  setupPassword: {
    subject: "Complete your account setup",
    heading: "Finish setting up your account",
    buttonText: "Set up password",
    instruction:
      "Please click the button below to finish setting up your password.",
  },
  security: {
    loginEmailChangeNoticeSubject: "Login email change requested",
    loginEmailChangeNoticeHeading: "A login email change was requested",
    loginEmailChangeNoticeBody:
      "A request was made to change the login email on your account. If this was you, no further action is needed here. If this was not you, secure your account immediately.",
    loginTwoFactorSubject: "Your login verification code",
    loginTwoFactorHeading: "Complete your sign in",
    loginTwoFactorBody:
      "Use the verification code below to complete your login. This code expires shortly for your security.",
  },
};

export const registerPageContent = {
  title: "Start Registration",
  description:
    "Please enter your email address. Once verified, it will be used as your login username and for account-related updates.",
};

export const contactFieldContent = {
  middleName: {
    term: "Middle name",
    description: "Beneficial for more complete identification...",
  },
  displayName: {
    term: "Customized display name",
    description:
      "This one allows you to override the default 'Prefix + Given + Middle + Family + Suffix' format.",
  },
  postalCode: {
    term: "Postal code",
    description:
      "This info helps our communication be tailored based on your rough location.",
  },
} as const;

export const employeeFieldContent = {
  email: {
    term: "Email",
    description: "For regular notifications and account-related updates.",
  },
  status: {
    term: "Status",
    description:
      "Active: currently working. Inactive: not yet started or temporarily unavailable. Terminated: employment has ended.",
  },
  sin: {
    term: "SIN",
    description: "Social Insurance Number issued by Service Canada",
  },
  dob: {
    term: "Date of birth",
    description: "YYYY-MM-DD",
  },
  hireDate: {
    term: "Hire date",
    description: "YYYY-MM-DD",
  },
  provinceOfEmployment: {
    term: "Province of employment",
    description:
      "use the province of the employer establishment where the employee reports for work, or where they are paid from.",
  },
  employmentEndDate: {
    term: "Employment end date",
    description: "YYYY-MM-DD",
  },
  jobStartDate: {
    term: "Job start date",
    description: "YYYY-MM-DD (defaults to hire date if empty)",
  },
  jobEndDate: {
    term: "Job end date",
    description: "YYYY-MM-DD (defaults to employment end date if empty)",
  },
  jobPayRate: {
    term: "Pay rate",
    description:
      "Base rate used for auto-calculating pay and validating input reasonableness.",
  },
  jobHoursPerWeek: {
    term: "Hours per week",
    description:
      "Base hours used for auto-calculating pay and validating input reasonableness.",
  },
  nickname: {
    term: "Nickname",
    description: "For conversational or informal use",
  },
  prefix: {
    term: "Prefix",
    description: "Title or honorific (e.g., Dr., Mr., Ms., Prof.)",
  },
  suffix: {
    term: "Suffix",
    description: "Designation after name (e.g., Jr., Sr., III, PhD, MD)",
  },
} as const;

export const tenantFieldContent = {
  mailingAddress: {
    term: "Mailing address",
    description:
      "This address will be used on payroll reporting and our paper correspondence to the business.",
  },
  payrollUnit: {
    term: "Payroll unit",
    description:
      "Groups employees under a shared pay schedule and GL configuration.",
  },
  scheduleCode: {
    term: "Schedule code",
    description:
      "Stable identifier for the pay schedule (e.g., BIWEEKLY_HQ). Used in reporting and integrations.",
  },
  frequency: {
    term: "Pay frequency",
    description: "How often employees in this unit are paid.",
  },
  periodBoundaryType: {
    term: "Pay period type",
    description:
      "Calendar follows normal calendar boundaries. Anchored uses your custom anchor day or weekday.",
  },
  firstBoundaryAnchorDay: {
    term: "First period anchor day",
    description:
      "Day of month to anchor the first period boundary when using anchored periods.",
  },
  firstBoundaryAnchorWeekday: {
    term: "First period anchor weekday",
    description:
      "Weekday to anchor the first period boundary for weekly or biweekly anchored schedules.",
  },
  firstPaydayOffsetDays: {
    term: "Days from period end to payday",
    description:
      "Number of days from pay period end to payday when using anchored periods. Use 0 to pay on period end date.",
  },
  firstPaydayWeekday: {
    term: "First payday weekday",
    description:
      "Optional weekday rule for first payday on weekly, biweekly, or semi-monthly schedules.",
  },
  monthlyPaydayDay: {
    term: "Payday",
    description:
      "For monthly schedules, choose the day of month to issue payroll (1-31). If a month has fewer days than selected, payday moves to the last banking day of that month.",
  },
  calendarPeriodEndDay: {
    term: "Pay period end",
    description:
      "Set days to payday above or pick a calendar day below. Selecting one clears the other. If a month has fewer days than selected, the last day is used.",
  },
  secondBoundaryAnchorDay: {
    term: "Second period anchor day",
    description:
      "For semi-monthly schedules, the anchor day for the second half of the month.",
  },
  secondPaydayOffsetDays: {
    term: "Second payday offset (days)",
    description:
      "For semi-monthly schedules, number of days after the second period end to pay.",
  },
  secondPaydayWeekday: {
    term: "Second payday weekday",
    description: "Optional weekday rule for the second semi-monthly payday.",
  },
  fundingMethod: {
    term: "Funding method",
    description:
      "PAP: pre-authorized debit from your bank. Wire: manual bank transfer. Manual: you handle funding outside the system.",
  },
  fundingLeadDays: {
    term: "Funding lead days",
    description:
      "How many business days before payday to initiate the funding transfer (typically 2–3 for PAP).",
  },
  expenseAccountCode: {
    term: "Wages expense account",
    description: "GL account debited for gross payroll expense (e.g., 5100).",
  },
  liabilityAccountCode: {
    term: "Tax/deduction liability account",
    description:
      "GL account credited for statutory deductions held payable to CRA (e.g., 2100).",
  },
  clearingAccountCode: {
    term: "Net pay clearing account",
    description:
      "GL account credited for net pay pending disbursement to employees (e.g., 1010).",
  },
} as const;

export const paymentFieldContent = {
  cardDetails: {
    term: "Card details",
    description:
      "MM/YY stands for the card's expiration month/year, and CVV is the 3-4 digit security code on your card.",
  },
  savedCards: {
    storageNote:
      "Full card number and CVV are stored with our payment processor only.",
    showFormLabel: "Add card",
    hideFormLabel: "Hide form",
  },
  savedAccounts: {
    term: "Saved Accounts",
    storageNote:
      "These are bank accounts for PAP withdrawals. Full account details are masked here, and payments made via PAP receive a 5% credit.",
    showFormLabel: "Add account",
    hideFormLabel: "Hide form",
    emptyState:
      "No saved bank accounts yet. Add one in profile/employee banking details to enable PAP withdrawal.",
  },
  accumulatedCredits: {
    term: "Accumulated Credits",
    storageNote:
      "Credits from eligible PAP payments are tracked here and can be applied to future charges.",
    balanceLabel: "Available credit",
    incentiveNote: "Eligible PAP payments earn 5% credit.",
  },
  primaryMethod: {
    badgeLabel: "Primary",
    setPrimaryLabel: "Set as primary",
    accountsNeedVerificationLabel: "Requires verified account",
  },
} as const;

export const dashboardContent = {
  profileInlineEditor: {
    loginEmailToggleButton: "Change",
    loginEmailSubmittingLabel: "Sending...",
    loginEmailNewFieldLabel: "New login email",
    loginEmailNewFieldPlaceholder: "name@example.com",
    loginEmailPasswordFieldLabel: "Current password",
    loginEmailPasswordFieldPlaceholder: "Enter current password",
    loginEmailSubmitButton: "Send verification",
    loginEmailCancelButton: "Cancel",
    loginEmailChangeNote:
      "Login email changes require verification.  Enter a new email in the prompt and confirm it from that inbox.",
    loginEmailRequestAcknowledgement:
      "If the new email can be used, a verification link will be sent.",
    unsavedChangesSaveHint:
      "Please save your other change(s) on this page before changing login email.",
  },
} as const;
