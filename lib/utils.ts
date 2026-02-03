// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/*
b/c RegisterPage -> user-register-form -> form-grid -> styles -> utils.ts
Keep utils.ts for browser-safe helpers (like class merging or formatting).
*/
