"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MoreHorizontal, Pencil, Trash2, UserRoundX } from "lucide-react";

type ContributoryCodeActionsProps = {
  code: string;
  contributoryCodeId: string;
  tenantId: string;
  editHref: string;
  isActive: boolean;
  deactivateContributoryCode: (formData: FormData) => void | Promise<void>;
  deleteContributoryCode: (formData: FormData) => void | Promise<void>;
};

export default function ContributoryCodeActions({
  code,
  contributoryCodeId,
  tenantId,
  editHref,
  isActive,
  deactivateContributoryCode,
  deleteContributoryCode,
}: ContributoryCodeActionsProps) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  useEffect(() => {
    if (!isActionMenuOpen) return;

    function handleOutsideMouseDown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (
        !target?.closest(
          `[data-contributory-code-actions="${contributoryCodeId}"]`,
        )
      ) {
        setIsActionMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleOutsideMouseDown);
    };
  }, [contributoryCodeId, isActionMenuOpen]);

  return (
    <div
      className="relative inline-flex justify-end"
      data-contributory-code-actions={contributoryCodeId}
    >
      <button
        type="button"
        aria-label={`Manage ${code}`}
        aria-expanded={isActionMenuOpen}
        onClick={() => setIsActionMenuOpen((current) => !current)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isActionMenuOpen ? (
        <div className="absolute right-0 top-11 z-10 min-w-44 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg">
          <Link
            href={editHref}
            onClick={() => setIsActionMenuOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit</span>
          </Link>

          <form action={deactivateContributoryCode}>
            <input type="hidden" name="tenantId" value={tenantId} />
            <input
              type="hidden"
              name="contributoryCodeId"
              value={contributoryCodeId}
            />
            <button
              type="submit"
              disabled={!isActive}
              title={
                isActive
                  ? "Make this contributory code inactive."
                  : "This contributory code is already inactive."
              }
              className={
                !isActive
                  ? "flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400"
                  : "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
              }
            >
              <UserRoundX className="h-4 w-4" />
              <span>Inactive</span>
            </button>
          </form>

          <form action={deleteContributoryCode}>
            <input type="hidden" name="tenantId" value={tenantId} />
            <input
              type="hidden"
              name="contributoryCodeId"
              value={contributoryCodeId}
            />
            <button
              type="submit"
              title="Delete this contributory code."
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
