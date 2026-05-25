// constants/content.ts

export const authContent = {
  verifyEmail: {
    title: "Check your email",
    mainInstruction: (email: string) =>
      `at <strong>${email}</strong> to find the button to click and verify.`,
    secondaryNote:
      "If it's a registered one, a password reset email will be sent instead.",
    keepOpenReminder:
      "Please keep this page open until you have received the email, sometimes in your spam folder, in case you need to ",
  },
  security: {
    deactivationWarning:
      "Resending a link will instantly deactivate any previous verification links; please always use the most recent one.",
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
      "Click the button below to verify your email address and activate your account(If you didn't request this, you can safely ignore this email. No account will be activated without verification):",
    heading: "Verify your email and activate your account",
  },
};
