// constants/content.ts

export const authContent = {
  verifyEmail: {
    title: "Check your email",
    mainInstruction: (email: string) =>
      `Please check the inbox of ${email} and click the link to verify your address and activate your account.`,
    secondaryNote:
      "If this address is already associated with an account, the email will instruct you to reset your password instead.",
    keepOpenReminder:
      "Please keep this page open until the email arrives, in case you need to resend it.",
    troubleshoot: "Didn't receive an email? Check your spam folder or",
  },
  security: {
    deactivationWarning:
      "Resending a new link will instantly deactivate any previous verification links. To ensure successful activation, please always use the most recent email sent to your inbox.",
    resendSuccessToast:
      "A new verification link has been dispatched to your email address. Note that any previous links are now invalid for security reasons.",
  },
  errors: {
    noEmail: "No email address found to resend to.",
    generic: "Something went wrong. Please try again.",
    resendFail: "Failed to resend email. Please try again later.",
  },
};
