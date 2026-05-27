// constants/content.ts

export const authContent = {
  verifyEmail: {
    title: "Check your email",
    mainInstruction: (email: string) =>
      `Check your inbox at <strong>${email}</strong> and click the verification button in the email we sent you.`,
    secondaryNote:
      "If the email doesn’t arrive soon, 1) check your spam folder, 2) use Resend button below, or 3) try logging in to see if it's already been used with a registered account.",
    keepOpenReminder: "",
  },
  security: {
    deactivationWarning:
      "Resending will instantly deactivate any previous ones; so please always sort out the most recent.",
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
    subject1: "Confirm your email address",
    subject2: "Reset your password",
    from: "CPARL Notifications <noreply@verify.cparl.com>",
    replyTo: "ron@cparl.com",
    buttonText: "Verify Email",
    activateInstruction:
      "Click the button below to verify your email address and go to profile page to complete the registration of your account(If you didn't request this, you can safely ignore this email. No account will be activated without verification):",
    heading: "Verify your email first",
  },
};

export const registerPageContent = {
  title: "Start Registration",
  description:
    "Enter your email to get a verification link. Your email will be your login username and for account updates once it's verified.",
};
