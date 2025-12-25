// src/db/safe.ts

/**
 * Wraps a promise, catches any errors, logs them, and re-throws a generic error.
 * Useful for handling and standardizing database (Prisma) errors.
 *
 * @param p The promise to safely execute.
 * @returns The result of the promise.
 */
export async function safe<T>(p: Promise<T>): Promise<T> {
  return p.catch((e) => {
    // 1. Log the original technical error for debugging purposes
    console.log("--- START DATABASE ERROR ---");
    console.log(e);
    console.log("--- END DATABASE ERROR ---");

    // 2. Throw a standardized, non-technical error for the consumer (e.g., API response)
    throw new Error("Database error");
  });
}
