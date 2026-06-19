// lib/dto/tenant.ts
import formatBusinessNumber, {
  composeBusinessNumberFromParts,
} from "@/utils/formatters/businessNumber";

export type TenantNameCached = {
  coreName: string;
  kindName?: string | null;
  aliasName?: string | null;
};

export type TenantSummaryDto = {
  id: string;
  nameCached: TenantNameCached;
  slug: string;
  businessBn9: string | null;
  businessProgramId: string | null;
  programRefNum: string | null;
  isActive: boolean;
  createdAt: string;
  displayName: string;
  operatingAsName: string;
  displayBusinessNumber: string | null;
};

type TenantRow = {
  id: string;
  nameCached: unknown;
  slug: string;
  businessBn9: string | null;
  businessProgramId: string | null;
  programRefNum: string | null;
  isActive: boolean;
  createdAt: Date;
};

function coerceTenantNameCached(input: unknown): TenantNameCached {
  if (typeof input !== "object" || input === null) {
    return { coreName: "Employer" };
  }

  const value = input as Record<string, unknown>;
  const coreName =
    typeof value.coreName === "string" && value.coreName.trim().length > 0
      ? value.coreName
      : "Employer";

  return {
    coreName,
    kindName: typeof value.kindName === "string" ? value.kindName : null,
    aliasName: typeof value.aliasName === "string" ? value.aliasName : null,
  };
}

export function toTenantSummaryDto(tenant: TenantRow): TenantSummaryDto {
  const nameCached = coerceTenantNameCached(tenant.nameCached);
  const displayName = `${nameCached.coreName}${
    nameCached.kindName ? ` ${nameCached.kindName}` : ""
  }${nameCached.aliasName ? ` (o/a ${nameCached.aliasName})` : ""}`;
  const operatingAsName =
    nameCached.aliasName?.trim() || nameCached.coreName || "Employer";
  const displayBusinessNumber =
    formatBusinessNumber(
      composeBusinessNumberFromParts({
        bn9: tenant.businessBn9,
        programId: tenant.businessProgramId,
        accountRef: tenant.programRefNum,
      }) ?? "",
    ) || null;

  return {
    id: tenant.id,
    nameCached,
    slug: tenant.slug,
    businessBn9: tenant.businessBn9,
    businessProgramId: tenant.businessProgramId,
    programRefNum: tenant.programRefNum,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt.toISOString(),
    displayName,
    operatingAsName,
    displayBusinessNumber,
  };
}
