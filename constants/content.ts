// constants/content.ts

export const authContent = {
  verifyEmail: {
    title: "Check your email",
    mainInstruction: (email: string) =>
      `Please check the inbox for ${email} and click the link to verify the email address within one hour.`,
    secondaryNote:
      "If this address is already associated with an account, the email will include password reset instructions instead.",
    keepOpenReminder:
      "Please keep this tab open until the email arrives, in case you need to resend it.",
    troubleshoot:
      "Having trouble verifying your email? Check your spam folder, or",
  },
  security: {
    deactivationWarning:
      "Resending a link will instantly deactivate any previous verification links; please always use the most recent email.",
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
  },
};
