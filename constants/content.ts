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
      "This one allows you to override the default 'Prefix + Given + Middle + Family' format.",
  },
  postalCode: {
    term: "Postal code",
    description:
      "This info helps our communication be tailored based on your rough location.",
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
    term: "Saved accounts",
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
