"use client";
// components/dashboard/dashboard-tiles.tsx

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  Shield,
  Package,
  CreditCard,
  MessageSquare,
  Pencil,
  Eye,
  EyeOff,
  Save,
  MoreHorizontal,
  Trash2,
  UserRoundX,
  SlidersHorizontal,
} from "lucide-react";
import { contactProfileStyles } from "@/constants/styles";
import { useTenant } from "@/app/tenants/context/TenantContext";
import PaymentMethodDetails from "@/components/payments/payment-method-details";
import { deleteTenant, setTenantActiveState } from "@/lib/actions/tenant";
import type { TenantSummaryDto } from "@/lib/dto/tenant";
import type { ContactFormInput } from "@/lib/validations/contact-schema";
import ProfileInlineEditor from "@/components/dashboard/profile-inline-editor";

export type DashboardTileItem = {
  label: string;
  value: string;
};

export type DashboardTile = {
  id: string;
  title: string;
  subtitle: string;
  tone: "emerald" | "blue" | "amber" | "violet" | "slate";
  items: DashboardTileItem[];
  icon: "profile" | "security" | "products" | "payments" | "communications";
};

type OrganizationTenant = TenantSummaryDto;

type OrganizationFilter = "all" | "active" | "inactive";
type OrganizationSort =
  | "name-asc"
  | "name-desc"
  | "operating-as-asc"
  | "operating-as-desc";

const toneStyles: Record<DashboardTile["tone"], string> = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
};

const iconMap: Record<DashboardTile["icon"], typeof UserCircle> = {
  profile: UserCircle,
  security: Shield,
  products: Package,
  payments: CreditCard,
  communications: MessageSquare,
};

export default function DashboardTiles({
  tiles,
  userGivenName,
  userFamilyName,
  userEmail,
  userPrimaryPostalCode,
  userContactId,
  profileInitialData,
}: {
  tiles: DashboardTile[];
  userGivenName?: string | null;
  userFamilyName?: string | null;
  userEmail: string;
  userPrimaryPostalCode?: string | null;
  userContactId: string;
  profileInitialData: ContactFormInput;
}) {
  const PROFILE_EDIT_STATE_KEY = "dashboard:profile-editing";
  const OPEN_TILE_STATE_KEY = "dashboard:open-tile";
  const router = useRouter();
  const profileFormId = "profile-inline-editor-form";
  const defaultId = tiles[0]?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(defaultId);
  const { tenants, tenantsLoading } = useTenant();
  const [organizationTenants, setOrganizationTenants] = useState<
    OrganizationTenant[]
  >([]);
  const [openOrganizationActionId, setOpenOrganizationActionId] = useState<
    string | null
  >(null);
  const [pendingOrganizationAction, setPendingOrganizationAction] = useState<
    string | null
  >(null);
  const [organizationFilter, setOrganizationFilter] =
    useState<OrganizationFilter>("all");
  const [organizationSort, setOrganizationSort] =
    useState<OrganizationSort>("name-asc");
  const [isOrganizationListMenuOpen, setIsOrganizationListMenuOpen] =
    useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showProfileChanges, setShowProfileChanges] = useState(false);
  const [profileChangeCount, setProfileChangeCount] = useState(0);

  useEffect(() => {
    try {
      const persistedOpenId =
        window.sessionStorage.getItem(OPEN_TILE_STATE_KEY);
      const isValidTile = tiles.some((tile) => tile.id === persistedOpenId);
      if (isValidTile) {
        setOpenId(persistedOpenId);
      }
    } catch {
      // Ignore storage access errors.
    }
  }, [tiles]);

  useEffect(() => {
    try {
      const persistedProfileEdit =
        window.sessionStorage.getItem(PROFILE_EDIT_STATE_KEY) === "1";
      const persistedOpenId =
        window.sessionStorage.getItem(OPEN_TILE_STATE_KEY);
      const hasValidPersistedOpenId = tiles.some(
        (tile) => tile.id === persistedOpenId,
      );

      // Only restore profile editing if profile itself is the active persisted tile
      // (or if no valid tile was persisted). This prevents stale profile flags
      // from hijacking Payments/other tiles after remount.
      if (
        persistedProfileEdit &&
        (!hasValidPersistedOpenId || persistedOpenId === "profile")
      ) {
        setOpenId("profile");
        setIsEditingProfile(true);
        return;
      }

      if (
        persistedProfileEdit &&
        hasValidPersistedOpenId &&
        persistedOpenId !== "profile"
      ) {
        window.sessionStorage.removeItem(PROFILE_EDIT_STATE_KEY);
      }
    } catch {
      // Ignore storage access errors.
    }
  }, [tiles]);

  useEffect(() => {
    try {
      if (isEditingProfile && openId === "profile") {
        window.sessionStorage.setItem(PROFILE_EDIT_STATE_KEY, "1");
      } else {
        window.sessionStorage.removeItem(PROFILE_EDIT_STATE_KEY);
      }
    } catch {
      // Ignore storage access errors.
    }
  }, [isEditingProfile, openId]);

  useEffect(() => {
    try {
      if (openId) {
        window.sessionStorage.setItem(OPEN_TILE_STATE_KEY, openId);
      } else {
        window.sessionStorage.removeItem(OPEN_TILE_STATE_KEY);
      }
    } catch {
      // Ignore storage access errors.
    }
  }, [openId]);

  useEffect(() => {
    setOrganizationTenants(tenants);
  }, [tenants]);

  const activeTile = useMemo(
    () => tiles.find((tile) => tile.id === openId) || null,
    [openId, tiles],
  );
  const profileDisplayName = [userGivenName?.trim(), userFamilyName?.trim()]
    .filter(Boolean)
    .join(" ")
    .trim();
  const profileHeading = profileDisplayName
    ? `${profileDisplayName} (${userEmail})`
    : userEmail;
  const hasOpenTile = openId !== null;

  useEffect(() => {
    if (activeTile?.id !== "organizations") {
      setIsOrganizationListMenuOpen(false);
      setOpenOrganizationActionId(null);
    }
  }, [activeTile?.id]);

  useEffect(() => {
    if (activeTile?.id !== "organizations") {
      return;
    }

    const handleOutsideMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) {
        return;
      }

      const clickedSortFilterMenu = Boolean(
        target.closest("[data-org-list-menu]"),
      );
      const clickedActionMenu = Boolean(
        target.closest("[data-org-actions-menu]"),
      );

      if (!clickedSortFilterMenu) {
        setIsOrganizationListMenuOpen(false);
      }

      if (!clickedActionMenu) {
        setOpenOrganizationActionId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, [activeTile?.id]);

  const handleOrganizationAction = async (
    tenant: OrganizationTenant,
    action: "toggle-active" | "delete",
  ) => {
    setOpenOrganizationActionId(null);

    if (action === "toggle-active") {
      const nextIsActive = !tenant.isActive;
      const confirmed = window.confirm(
        nextIsActive
          ? `Reactivate ${tenant.nameCached.coreName}?`
          : `Set ${tenant.nameCached.coreName} inactive?`,
      );

      if (!confirmed) {
        return;
      }

      setPendingOrganizationAction(`${tenant.id}:toggle-active`);
      const result = await setTenantActiveState(tenant.id, nextIsActive);
      setPendingOrganizationAction(null);

      if (!result.success) {
        alert(result.error || "Employer status could not be updated.");
        return;
      }

      setOrganizationTenants((currentTenants) =>
        currentTenants.map((currentTenant) =>
          currentTenant.id === tenant.id
            ? { ...currentTenant, isActive: nextIsActive }
            : currentTenant,
        ),
      );
      router.refresh();
      return;
    }

    const confirmed = window.confirm(
      `Delete ${tenant.nameCached.coreName}? This only works when the employer has no related records.`,
    );
    if (!confirmed) {
      return;
    }

    setPendingOrganizationAction(`${tenant.id}:delete`);
    const result = await deleteTenant(tenant.id);
    setPendingOrganizationAction(null);

    if (!result.success) {
      alert(
        result.error ||
          "Employer could not be deleted. Set it inactive instead.",
      );
      return;
    }

    setOrganizationTenants((currentTenants) =>
      currentTenants.filter((currentTenant) => currentTenant.id !== tenant.id),
    );
    router.refresh();
  };

  const organizationItems = useMemo(() => {
    if (tenantsLoading) {
      return [{ label: "Employers", value: "Loading..." }];
    }
    if (organizationTenants.length === 0) {
      return [{ label: "Employers", value: "No employers yet" }];
    }

    const filteredTenants = organizationTenants
      .filter((tenant) => {
        if (organizationFilter === "active") {
          return tenant.isActive;
        }
        if (organizationFilter === "inactive") {
          return !tenant.isActive;
        }
        return true;
      })
      .sort((leftTenant, rightTenant) => {
        const sortByOperatingAs =
          organizationSort === "operating-as-asc" ||
          organizationSort === "operating-as-desc";
        const leftName = sortByOperatingAs
          ? leftTenant.operatingAsName.toLowerCase()
          : leftTenant.displayName.toLowerCase();
        const rightName = sortByOperatingAs
          ? rightTenant.operatingAsName.toLowerCase()
          : rightTenant.displayName.toLowerCase();
        if (leftName === rightName) {
          return 0;
        }
        if (
          organizationSort === "name-asc" ||
          organizationSort === "operating-as-asc"
        ) {
          return leftName < rightName ? -1 : 1;
        }
        return leftName > rightName ? -1 : 1;
      });

    if (filteredTenants.length === 0) {
      return [
        {
          label: "Employers",
          value:
            organizationFilter === "active"
              ? "No active employers"
              : "No inactive employers",
        },
      ];
    }

    return filteredTenants.map((tenant) => ({
      ...tenant,
      businessNumber:
        tenant.displayBusinessNumber ||
        "Valid business no. is required in remitting and reporting.",
    }));
  }, [
    organizationFilter,
    organizationSort,
    organizationTenants,
    tenantsLoading,
  ]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => {
          const isOpen = tile.id === openId;
          const Icon = iconMap[tile.icon];
          const toneClass = toneStyles[tile.tone];
          const handleClick = () => {
            const nextOpenId = isOpen ? null : tile.id;

            // Reset profile edit state immediately when leaving profile so remounts
            // do not restore it from stale session storage.
            if (tile.id !== "profile" || isOpen) {
              setIsEditingProfile(false);
              setShowProfileChanges(false);
              setProfileChangeCount(0);

              try {
                window.sessionStorage.removeItem(PROFILE_EDIT_STATE_KEY);
              } catch {
                // Ignore storage access errors.
              }
            }

            try {
              if (nextOpenId) {
                window.sessionStorage.setItem(OPEN_TILE_STATE_KEY, nextOpenId);
              } else {
                window.sessionStorage.removeItem(OPEN_TILE_STATE_KEY);
              }
            } catch {
              // Ignore storage access errors.
            }

            setOpenId(nextOpenId);
          };

          return (
            <button
              key={tile.id}
              type="button"
              onClick={handleClick}
              aria-pressed={isOpen}
              className={`group rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 ease-out transform-gpu hover:-translate-y-0.5 hover:shadow-md ${
                isOpen
                  ? "scale-110 ring-2 ring-emerald-200 shadow-md"
                  : hasOpenTile
                    ? "scale-90 opacity-85"
                    : ""
              }`}
            >
              <div
                className={`aspect-[4/3] w-full rounded-lg border flex flex-col items-center justify-center gap-2 text-center transition-all duration-300 ${toneClass} ${
                  isOpen ? "scale-100" : hasOpenTile ? "scale-95" : ""
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  {tile.title}
                </span>
                <span className="text-xs font-medium text-slate-700">
                  {tile.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div
        className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
          activeTile?.id === "organizations" &&
          (isOrganizationListMenuOpen || openOrganizationActionId !== null)
            ? "overflow-visible"
            : "overflow-hidden"
        }`}
      >
        {activeTile ? (
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-5 py-3 bg-slate-50">
              {activeTile.id === "profile" ? (
                <div className="grid w-full grid-cols-3 items-center gap-2">
                  <div className="flex items-center justify-start">
                    {isEditingProfile ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setShowProfileChanges(false);
                          setProfileChangeCount(0);
                        }}
                        className="inline-flex h-8 min-w-[88px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    ) : (
                      <div className="h-8 min-w-[88px]" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-center">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${toneStyles[activeTile.tone].split(" ")[2]}`}
                    >
                      {(() => {
                        const Icon = iconMap[activeTile.icon];
                        return <Icon className="h-3 w-3" />;
                      })()}
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {profileHeading}
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    {isEditingProfile && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setShowProfileChanges((showChanges) => !showChanges)
                          }
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                          aria-pressed={showProfileChanges}
                          aria-label={
                            showProfileChanges ? "Hide changes" : "Show changes"
                          }
                          title={
                            showProfileChanges ? "Hide changes" : "Show changes"
                          }
                        >
                          {showProfileChanges ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <span className="text-xs text-slate-600">
                          {profileChangeCount} change
                          {profileChangeCount === 1 ? "" : "s"}
                        </span>
                      </>
                    )}
                    {isEditingProfile ? (
                      <button
                        type="button"
                        onClick={() => {
                          const profileForm = document.getElementById(
                            profileFormId,
                          ) as HTMLFormElement | null;
                          profileForm?.requestSubmit();
                        }}
                        className={`${contactProfileStyles.editButton} gap-2 border-emerald-200 bg-emerald-100 text-emerald-800 shadow-sm`}
                        aria-label="Save changes"
                        title="Save changes"
                      >
                        <Save className="text-emerald-700" size={16} />
                        <span className="text-xs font-semibold text-emerald-800">
                          Save
                        </span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setShowProfileChanges(false);
                        }}
                        className={contactProfileStyles.editButton}
                        aria-label="Edit profile"
                        title="Edit profile"
                      >
                        <Pencil
                          className={contactProfileStyles.editIcon}
                          size={16}
                        />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full ${toneStyles[activeTile.tone].split(" ")[2]}`}
                  >
                    {(() => {
                      const Icon = iconMap[activeTile.icon];
                      return <Icon className="h-3 w-3" />;
                    })()}
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    {activeTile.title}
                  </span>
                </div>
              )}
              {activeTile.id === "organizations" && (
                <div className="relative" data-org-list-menu>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenOrganizationActionId(null);
                      setIsOrganizationListMenuOpen((isOpen) => !isOpen);
                    }}
                    aria-expanded={isOrganizationListMenuOpen}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Sort / Filter
                  </button>
                  {isOrganizationListMenuOpen && (
                    <div className="absolute right-0 top-10 z-20 min-w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                      <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Filter
                      </p>
                      <div className="space-y-1 pb-2">
                        <button
                          type="button"
                          onClick={() => {
                            setOrganizationFilter("all");
                          }}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                            organizationFilter === "all"
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          All employers
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrganizationFilter("active");
                          }}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                            organizationFilter === "active"
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Active only
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrganizationFilter("inactive");
                          }}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                            organizationFilter === "inactive"
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Inactive only
                        </button>
                      </div>
                      <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Sort
                      </p>
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setOrganizationSort("name-asc");
                          }}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                            organizationSort === "name-asc"
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Name A-Z
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrganizationSort("name-desc");
                          }}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                            organizationSort === "name-desc"
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Name Z-A
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrganizationSort("operating-as-asc");
                          }}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                            organizationSort === "operating-as-asc"
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Operating As A-Z
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOrganizationSort("operating-as-desc");
                          }}
                          className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition ${
                            organizationSort === "operating-as-desc"
                              ? "bg-slate-100 text-slate-900"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          Operating As Z-A
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
              {activeTile.id === "payments" ? (
                <PaymentMethodDetails
                  variant="tile"
                  userGivenName={userGivenName}
                  userFamilyName={userFamilyName}
                  userPrimaryPostalCode={userPrimaryPostalCode}
                />
              ) : activeTile.id === "profile" && isEditingProfile ? (
                <ProfileInlineEditor
                  contactId={userContactId}
                  formId={profileFormId}
                  initialData={profileInitialData}
                  showChanges={showProfileChanges}
                  onEyeToggle={() =>
                    setShowProfileChanges((showChanges) => !showChanges)
                  }
                  onChangeCount={setProfileChangeCount}
                  onCancel={() => setIsEditingProfile(false)}
                  onSaved={() => {
                    setShowProfileChanges(false);
                    router.refresh();
                  }}
                />
              ) : (
                <div className="space-y-3 text-sm">
                  {activeTile.id === "organizations"
                    ? organizationItems.map((tenant) => {
                        if (!("id" in tenant)) {
                          return (
                            <div
                              key={`${activeTile.id}-${tenant.label}-${tenant.value}`}
                              className="flex items-center justify-between text-slate-600"
                            >
                              <span>{tenant.label}</span>
                              <span className="font-medium text-slate-900">
                                {tenant.value}
                              </span>
                            </div>
                          );
                        }

                        const isActionMenuOpen =
                          openOrganizationActionId === tenant.id;
                        const isToggling =
                          pendingOrganizationAction ===
                          `${tenant.id}:toggle-active`;
                        const isDeleting =
                          pendingOrganizationAction === `${tenant.id}:delete`;

                        return (
                          <div
                            key={tenant.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/payroll?tenantId=${tenant.id}`}
                                    className="font-semibold text-slate-900 transition hover:text-violet-700"
                                  >
                                    {tenant.displayName}
                                  </Link>
                                  {!tenant.isActive && (
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                  {tenant.businessNumber}
                                </p>
                              </div>
                              <div
                                className="relative flex shrink-0 justify-end"
                                data-org-actions-menu
                              >
                                <button
                                  type="button"
                                  aria-label={`Manage ${tenant.displayName}`}
                                  aria-expanded={isActionMenuOpen}
                                  onClick={() => {
                                    setIsOrganizationListMenuOpen(false);
                                    setOpenOrganizationActionId((currentId) =>
                                      currentId === tenant.id
                                        ? null
                                        : tenant.id,
                                    );
                                  }}
                                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                                {isActionMenuOpen && (
                                  <div className="absolute right-0 top-11 z-10 min-w-44 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenOrganizationActionId(null);
                                        router.push(
                                          `/tenants/${tenant.id}/edit`,
                                        );
                                      }}
                                      disabled={isToggling || isDeleting}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <Pencil className="h-4 w-4" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleOrganizationAction(
                                          tenant,
                                          "toggle-active",
                                        )
                                      }
                                      disabled={isToggling || isDeleting}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <UserRoundX className="h-4 w-4" />
                                      <span>
                                        {tenant.isActive
                                          ? isToggling
                                            ? "Setting inactive..."
                                            : "Set inactive"
                                          : isToggling
                                            ? "Reactivating..."
                                            : "Reactivate"}
                                      </span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleOrganizationAction(
                                          tenant,
                                          "delete",
                                        )
                                      }
                                      disabled={isToggling || isDeleting}
                                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span>
                                        {isDeleting ? "Deleting..." : "Delete"}
                                      </span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    : activeTile.items.map((item, index) => (
                        <div
                          key={`${activeTile.id}-${item.label}-${item.value}-${index}`}
                          className="flex items-center justify-between text-slate-600"
                        >
                          <span>{item.label}</span>
                          <span className="font-medium text-slate-900">
                            {item.value}
                          </span>
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="px-5 py-8">
            <p className="text-sm text-slate-500">
              Select a tile to view details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
