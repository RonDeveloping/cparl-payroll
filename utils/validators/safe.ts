// src/db/safe.ts

/**
 * Wraps a promise, catches any errors, logs them, and re-throws a generic error.
 * Useful for handling and standardizing database (Prisma) errors.
 *
 * @param p The promise to safely execute.
 * @returns The result of the promise.
 */

export type SafeResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: string };

export async function safe<T>(p: Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await p;
    return { success: true, data, error: null };
  } catch (e: unknown) {
    // 1. Log the original technical error for debugging purposes
    console.log("--- START DATABASE ERROR ---");
    console.log(e);
    console.log("--- END DATABASE ERROR ---");
    const errorMessage = e instanceof Error ? e.message : "Database error";
    return { success: false, data: null, error: errorMessage };
  }
}
