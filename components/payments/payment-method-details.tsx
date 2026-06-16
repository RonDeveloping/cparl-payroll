"use client";
// components/payments/payment-method-details.tsx

import { useEffect, useState } from "react";
import PaymentMethodForm from "@/components/payments/payment-method-form";
import PapAccountForm from "@/components/payments/pap-account-form";
import { Clarification } from "@/components/clarification";
import CardTypeIcon from "@/components/payments/card-type-icon";
import { paymentFieldContent } from "@/constants/content";
import {
  getPaymentMethodsSummary,
  type SavedPapAccount,
  type SavedPaymentCard,
} from "@/lib/api";

const LONG_LIST_SHORTCUT_THRESHOLD = 4;
const PRIMARY_PAYMENT_METHOD_KEY = "payments:primary-method";

type PrimaryPaymentMethod = "cards" | "accounts" | "credits";

function isPapAccountVerified(status: string) {
  return status.trim().toLowerCase() === "verified";
}

function formatExpiry(month: number, year: number) {
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatAddedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Added --";
  }

  // Use UTC parts for deterministic formatting across SSR/CSR.
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear()).slice(-2);
  return `Added ${month}/${year}`;
}

function formatCardShortLabel(brand: string, last4: string) {
  const normalized = brand.trim().toLowerCase();
  const abbreviation =
    normalized === "mastercard"
      ? "MC"
      : normalized === "visa"
        ? "VS"
        : normalized === "american express" || normalized === "amex"
          ? "AX"
          : normalized === "discover"
            ? "DS"
            : brand.slice(0, 2).toUpperCase();

  return `${abbreviation} •••• ${last4}`;
}

export default function PaymentMethodDetails({
  variant = "page",
  userGivenName,
  userFamilyName,
  userPrimaryPostalCode,
}: {
  variant?: "page" | "tile";
  userGivenName?: string | null;
  userFamilyName?: string | null;
  userPrimaryPostalCode?: string | null;
}) {
  const isTile = variant === "tile";
  const [cards, setCards] = useState<SavedPaymentCard[]>([]);
  const [papAccounts, setPapAccounts] = useState<SavedPapAccount[]>([]);
  const [accumulatedCredits, setAccumulatedCredits] = useState(0);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [showEntryForm, setShowEntryForm] = useState(true);
  const [showAccountEntryForm, setShowAccountEntryForm] = useState(false);
  const [primaryMethod, setPrimaryMethod] =
    useState<PrimaryPaymentMethod>("cards");
  const hasLongCardList = cards.length >= LONG_LIST_SHORTCUT_THRESHOLD;
  const hasVerifiedPapAccount = papAccounts.some((account) =>
    isPapAccountVerified(account.verificationStatus),
  );

  const isCardsPrimary = primaryMethod === "cards";
  const isAccountsPrimary = primaryMethod === "accounts";

  const setPrimaryPaymentMethod = (method: PrimaryPaymentMethod) => {
    if (method === "credits") {
      return;
    }

    if (method === "accounts" && !hasVerifiedPapAccount) {
      return;
    }

    setPrimaryMethod(method);
    try {
      window.localStorage.setItem(PRIMARY_PAYMENT_METHOD_KEY, method);
    } catch {
      // Ignore storage access errors.
    }
  };

  useEffect(() => {
    try {
      const savedMethod = window.localStorage.getItem(
        PRIMARY_PAYMENT_METHOD_KEY,
      );
      if (savedMethod === "cards" || savedMethod === "accounts") {
        setPrimaryMethod(savedMethod);
      }
    } catch {
      // Ignore storage access errors.
    }
  }, []);

  useEffect(() => {
    if (primaryMethod === "accounts" && !hasVerifiedPapAccount) {
      setPrimaryMethod("cards");
      try {
        window.localStorage.setItem(PRIMARY_PAYMENT_METHOD_KEY, "cards");
      } catch {
        // Ignore storage access errors.
      }
    }
  }, [hasVerifiedPapAccount, primaryMethod]);

  useEffect(() => {
    let isMounted = true;

    const loadCards = async () => {
      try {
        const summary = await getPaymentMethodsSummary();
        if (isMounted) {
          setCards(summary.cards);
          setPapAccounts(summary.papAccounts);
          setAccumulatedCredits(summary.accumulatedCredits);
        }
      } catch {
        if (isMounted) {
          setCards([]);
          setPapAccounts([]);
          setAccumulatedCredits(0);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCards(false);
        }
      }
    };

    void loadCards();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardSaved = (card: SavedPaymentCard) => {
    setCards((currentCards) => {
      const filteredCards = currentCards.filter(
        (existingCard) => existingCard.id !== card.id,
      );

      const nextCard = card.isDefault
        ? card
        : {
            ...card,
            isDefault: filteredCards.length === 0,
          };

      const normalizedCards = filteredCards.map((existingCard) =>
        nextCard.isDefault
          ? { ...existingCard, isDefault: false }
          : existingCard,
      );

      return [nextCard, ...normalizedCards].sort((left, right) => {
        if (left.isDefault === right.isDefault) return 0;
        return left.isDefault ? -1 : 1;
      });
    });
  };

  const handlePapAccountSaved = (account: SavedPapAccount) => {
    setPapAccounts((currentAccounts) => {
      const filteredAccounts = currentAccounts.filter(
        (existingAccount) => existingAccount.id !== account.id,
      );

      const nextAccount = account.isDefault
        ? account
        : {
            ...account,
            isDefault: filteredAccounts.length === 0,
          };

      const normalizedAccounts = filteredAccounts.map((existingAccount) =>
        nextAccount.isDefault
          ? { ...existingAccount, isDefault: false }
          : existingAccount,
      );

      return [nextAccount, ...normalizedAccounts];
    });
  };

  return (
    <div className={isTile ? "space-y-4" : "space-y-6"}>
      {!isTile && (
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment Methods</h1>
          <p className="text-slate-600">
            Add a credit or debit card for payroll funding.
          </p>
        </div>
      )}

      <div
        className={
          isTile
            ? ""
            : "rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        }
      >
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">
              <Clarification
                term="Saved Cards"
                description={paymentFieldContent.savedCards.storageNote}
              />
            </h2>
            <div className="flex items-center gap-2">
              {isCardsPrimary ? (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  {paymentFieldContent.primaryMethod.badgeLabel}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setPrimaryPaymentMethod("cards")}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  aria-label="Set cards as primary payment method"
                  title="Set cards as primary payment method"
                >
                  {paymentFieldContent.primaryMethod.setPrimaryLabel}
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowEntryForm((current) => !current)}
                className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                aria-label={
                  showEntryForm
                    ? "Hide card entry form"
                    : "Show card entry form"
                }
                title={
                  showEntryForm
                    ? "Hide card entry form"
                    : "Show card entry form"
                }
              >
                {showEntryForm
                  ? paymentFieldContent.savedCards.hideFormLabel
                  : paymentFieldContent.savedCards.showFormLabel}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="space-y-3 px-4 py-3">
              {isLoadingCards ? (
                <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                  Loading saved cards...
                </div>
              ) : cards.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                  Your saved payment methods will appear here after you add one.
                </div>
              ) : (
                <div className="space-y-3">
                  {cards.map((card, index) => (
                    <div
                      key={card.id}
                      className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                          #{index + 1}
                        </span>
                        <span className="inline-flex items-center gap-2 font-medium text-slate-900">
                          <CardTypeIcon brandName={card.brand} />
                          {formatCardShortLabel(card.brand, card.last4)}
                        </span>
                        <span className="text-slate-500">
                          Expires {formatExpiry(card.expMonth, card.expYear)}
                        </span>
                        {card.cardholderName ? (
                          <span className="truncate text-slate-500">
                            {card.cardholderName}
                          </span>
                        ) : null}
                        <span className="text-slate-500">
                          {formatAddedDate(card.createdAt)}
                        </span>
                        {card.isDefault ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                            Default
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {showEntryForm ? (
              <div className="border-t border-slate-200 bg-white px-4 py-4">
                <PaymentMethodForm
                  compact={isTile}
                  userGivenName={userGivenName}
                  userFamilyName={userFamilyName}
                  userPrimaryPostalCode={userPrimaryPostalCode}
                  onSaved={handleCardSaved}
                />
              </div>
            ) : hasLongCardList ? (
              <div className="flex justify-end border-t border-slate-200 bg-white px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowEntryForm(true)}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  aria-label="Show card entry form"
                  title="Show card entry form"
                >
                  {paymentFieldContent.savedCards.showFormLabel}
                </button>
              </div>
            ) : null}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                <Clarification
                  term={paymentFieldContent.savedAccounts.term}
                  description={paymentFieldContent.savedAccounts.storageNote}
                />
              </h3>
              <div className="flex items-center gap-2">
                {isAccountsPrimary ? (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    {paymentFieldContent.primaryMethod.badgeLabel}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPrimaryPaymentMethod("accounts")}
                    disabled={!hasVerifiedPapAccount}
                    className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400 disabled:bg-slate-50"
                    aria-label="Set saved accounts as primary payment method"
                    title="Set saved accounts as primary payment method"
                  >
                    {hasVerifiedPapAccount
                      ? paymentFieldContent.primaryMethod.setPrimaryLabel
                      : paymentFieldContent.primaryMethod
                          .accountsNeedVerificationLabel}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowAccountEntryForm((current) => !current)}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  aria-label={
                    showAccountEntryForm
                      ? "Hide account entry form"
                      : "Show account entry form"
                  }
                  title={
                    showAccountEntryForm
                      ? "Hide account entry form"
                      : "Show account entry form"
                  }
                >
                  {showAccountEntryForm
                    ? paymentFieldContent.savedAccounts.hideFormLabel
                    : paymentFieldContent.savedAccounts.showFormLabel}
                </button>
              </div>
            </div>

            {showAccountEntryForm ? (
              <div className="mt-3">
                <PapAccountForm
                  compact={isTile}
                  onSaved={handlePapAccountSaved}
                />
              </div>
            ) : null}

            {isLoadingCards ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Loading saved accounts...
              </div>
            ) : papAccounts.length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                {paymentFieldContent.savedAccounts.emptyState}
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                {papAccounts.map((account) => {
                  const institution = String(
                    account.institutionNumber,
                  ).padStart(3, "0");
                  const branch = String(account.branchNumber).padStart(5, "0");
                  return (
                    <div
                      key={account.id}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            Bank account ending in {account.accountLast4}
                          </span>
                          {account.isDefault ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                              Primary
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          Transit {branch} • Institution {institution} •{" "}
                          {account.currency}
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {account.verificationStatus.toLowerCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">
                <Clarification
                  term={paymentFieldContent.accumulatedCredits.term}
                  description={
                    paymentFieldContent.accumulatedCredits.storageNote
                  }
                />
              </h3>
            </div>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {paymentFieldContent.accumulatedCredits.balanceLabel}
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(accumulatedCredits)}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {paymentFieldContent.accumulatedCredits.incentiveNote}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
