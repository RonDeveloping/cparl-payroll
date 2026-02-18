"use client";

import { useMemo, useState } from "react";
import {
  UserCircle,
  Shield,
  Package,
  CreditCard,
  MessageSquare,
} from "lucide-react";

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

export default function DashboardTiles({ tiles }: { tiles: DashboardTile[] }) {
  const defaultId = tiles[0]?.id ?? null;
  const [openId, setOpenId] = useState<string | null>(defaultId);

  const activeTile = useMemo(
    () => tiles.find((tile) => tile.id === openId) || null,
    [openId, tiles],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map((tile) => {
          const isOpen = tile.id === openId;
          const Icon = iconMap[tile.icon];
          const toneClass = toneStyles[tile.tone];

          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => setOpenId(isOpen ? null : tile.id)}
              aria-pressed={isOpen}
              className={`group rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isOpen ? "ring-2 ring-emerald-200" : ""
              }`}
            >
              <div
                className={`aspect-[4/3] w-full rounded-lg border flex flex-col items-center justify-center gap-2 text-center transition ${toneClass}`}
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

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {activeTile ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                {activeTile.title}
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                {activeTile.subtitle}
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              {activeTile.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-slate-600"
                >
                  <span>{item.label}</span>
                  <span className="font-medium text-slate-900">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Select a tile to view details.
          </p>
        )}
      </div>
    </div>
  );
}
