// Clarification descriptions for payment form fields
export const PAYMENT_FORM_DESCRIPTIONS = {
  cardholderName:
    "This will be auto-filled from the placeholder when you focus on the field. Please verify it matches the name on your card statement.",
  postalCode:
    "If provided in registration, your address postal code will be auto-filled from the placeholder when you focus on the field. Please verify it matches the postal code on your card statement.",
  cvc: "The 3-4 digit security code found on the back of your card, shown in the diagram.",
} as const;
