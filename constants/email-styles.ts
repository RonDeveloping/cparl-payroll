// constants/email-styles.ts
//note:Tailwind and external CSS classes do not work in most email clients (like Gmail or Outlook). You must use inline styles.
export const emailStyles = {
  container:
    "font-family: sans-serif; line-height: 1.6; color: #334155; padding: 20px; max-width: 600px; margin: 0 auto;",
  heading:
    "font-size: 24px; font-weight: bold; color: #0f172a; margin-bottom: 16px;",
  text: "font-size: 16px; margin-bottom: 24px;",
  button: `
    display: inline-block;
    padding: 12px 24px;
    background-color: #2563eb;
    color: #ffffff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
  `,
  footer:
    "font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;",
  expiry:
    "font-size: 14px; color: #64748b; font-style: italic; margin-top: 16px;",
};
