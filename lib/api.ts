// lib/api.ts
// Centralized API utility for all client-side API calls

import type { TenantSummaryDto } from "@/lib/dto/tenant";

export async function getTenants(): Promise<TenantSummaryDto[]> {
  const res = await fetch("/api/tenants");
  if (res.status === 401) {
    // Treat unauthenticated state as no accessible tenants.
    return [];
  }

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || "Failed to fetch tenants");
  }

  return Array.isArray(payload) ? payload : [];
}

export async function activateAccount(token: string) {
  const res = await fetch("/api/activate-account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Activation failed");
  return data;
}

export async function setPassword(
  email: string,
  password: string,
  confirmPassword: string,
) {
  const res = await fetch("/api/set-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirmPassword }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error =
      typeof data?.error === "string" ? data.error : "Set password failed";
    throw new Error(error);
  }
  return data;
}

export class VerifyEmailError extends Error {
  email?: string;
  constructor(message: string, email?: string) {
    super(message);
    this.email = email;
  }
}

export async function verifyEmail(
  token: string,
  email?: string,
): Promise<{ email: string } | { setupUrl: string }> {
  const params = new URLSearchParams({ token });
  if (email) params.set("email", email);
  const res = await fetch(`/api/verify-email?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) {
    throw new VerifyEmailError(data.error || "Verification failed", data.email);
  }
  return data;
}

export type SavedPaymentCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName: string | null;
  billingPostalCode: string | null;
  isDefault: boolean;
  createdAt: string;
};

export type SavedPapAccount = {
  id: string;
  label: string | null;
  institutionNumber: number;
  branchNumber: number;
  accountLast4: string;
  currency: string;
  isDefault: boolean;
  verificationStatus: string;
  createdAt: string;
};

export type PaymentMethodsSummary = {
  cards: SavedPaymentCard[];
  papAccounts: SavedPapAccount[];
  accumulatedCredits: number;
};

export type CreatePapAccountPayload = {
  label?: string;
  institutionNumber: string;
  bankDetails: string;
};

export type CreatePaymentMethodPayload = {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: number;
  cvc: string;
  billingPostalCode: string;
};

export async function createPaymentMethod(
  data: CreatePaymentMethodPayload,
): Promise<{ success: true; card: SavedPaymentCard }> {
  const res = await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || "Payment method creation failed");
  }
  return payload;
}

export async function createPapAccount(
  data: CreatePapAccountPayload,
): Promise<{ success: true; account: SavedPapAccount }> {
  const res = await fetch("/api/payments/pap-accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || "PAP account creation failed");
  }
  return payload;
}

export async function deletePaymentCard(id: string): Promise<void> {
  const res = await fetch(`/api/payments?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || "Failed to delete payment card");
  }
}

export async function deletePapAccount(id: string): Promise<void> {
  const res = await fetch(
    `/api/payments/pap-accounts?id=${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || "Failed to delete PAP account");
  }
}

export async function getPaymentMethods(): Promise<SavedPaymentCard[]> {
  const summary = await getPaymentMethodsSummary();
  return summary.cards;
}

export async function getSavedPapAccounts(): Promise<SavedPapAccount[]> {
  const summary = await getPaymentMethodsSummary();
  return summary.papAccounts;
}

export async function getPaymentMethodsSummary(): Promise<PaymentMethodsSummary> {
  const res = await fetch("/api/payments", {
    cache: "no-store",
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || "Failed to fetch payment methods");
  }

  return {
    cards: Array.isArray(payload.cards) ? payload.cards : [],
    papAccounts: Array.isArray(payload.papAccounts) ? payload.papAccounts : [],
    accumulatedCredits:
      typeof payload.accumulatedCredits === "number"
        ? payload.accumulatedCredits
        : 0,
  };
}
