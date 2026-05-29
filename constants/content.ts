export const setupPasswordContent = {
  heading:
    "This email address is now verified; please set up a password for the account with this email address:",
};
// constants/content.ts

export const authContent = {
  verifyEmail: {
    title: "Check your email",
    mainInstruction: (email: string) =>
      `Please click the Verify Email button in the email we sent to <strong>${email}</strong>.`,
    secondaryNote:
      "If the email doesn’t arrive soon, 1) check your spam folder, 2) use Resend... button below, or 3) try logging in to see if it's already been used with a registered account.",
    keepOpenReminder: "",
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
};

export const registerPageContent = {
  title: "Start Registration",
  description:
    "Please enter your email address. Once verified, it will be used as your login username and for account-related updates.",
};
