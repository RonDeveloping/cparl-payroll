#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const CURRENT_FILE = path.resolve(
  process.cwd(),
  "constants",
  "financial-institutions.data.json",
);

function parseArgs(argv) {
  const args = {
    current: CURRENT_FILE,
    previous: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--current") {
      args.current = path.resolve(process.cwd(), argv[i + 1] || CURRENT_FILE);
      i += 1;
    } else if (token === "--previous") {
      args.previous = path.resolve(process.cwd(), argv[i + 1] || "");
      i += 1;
    }
  }

  return args;
}

function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getDuplicatesByDisplayName(entries) {
  const byName = new Map();
  for (const [code, institution] of entries) {
    const key = String(institution.displayName || "")
      .trim()
      .toLowerCase();
    if (!key) {
      continue;
    }
    const codes = byName.get(key) || [];
    codes.push(code);
    byName.set(key, codes);
  }

  return Array.from(byName.entries())
    .filter(([, codes]) => codes.length > 1)
    .map(([displayName, codes]) => ({ displayName, codes }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

function diffInstitutions(previousEntries, currentEntries) {
  const previousMap = new Map(previousEntries);
  const currentMap = new Map(currentEntries);

  const added = [];
  const removed = [];
  const changed = [];

  for (const [code, current] of currentMap.entries()) {
    const prev = previousMap.get(code);
    if (!prev) {
      added.push(code);
      continue;
    }

    if (
      prev.shortName !== current.shortName ||
      prev.displayName !== current.displayName ||
      prev.badgeClass !== current.badgeClass
    ) {
      changed.push(code);
    }
  }

  for (const [code] of previousMap.entries()) {
    if (!currentMap.has(code)) {
      removed.push(code);
    }
  }

  added.sort((a, b) => a.localeCompare(b));
  removed.sort((a, b) => a.localeCompare(b));
  changed.sort((a, b) => a.localeCompare(b));

  return { added, removed, changed };
}

async function readJsonObject(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      `${filePath} must contain a JSON object keyed by institution code.`,
    );
  }
  return parsed;
}

async function main() {
  const { current, previous } = parseArgs(process.argv.slice(2));

  const currentObject = await readJsonObject(current);
  const currentEntries = Object.entries(currentObject).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const missingShortName = currentEntries
    .filter(([, value]) => !isNonEmpty(value.shortName))
    .map(([code]) => code);

  const missingDisplayName = currentEntries
    .filter(([, value]) => !isNonEmpty(value.displayName))
    .map(([code]) => code);

  const missingBadgeClass = currentEntries
    .filter(([, value]) => !isNonEmpty(value.badgeClass))
    .map(([code]) => code);

  const duplicateDisplayNames = getDuplicatesByDisplayName(currentEntries);

  console.log(`Current file: ${current}`);
  console.log(`Total institutions: ${currentEntries.length}`);
  console.log(`Missing short names: ${missingShortName.length}`);
  console.log(`Missing display names: ${missingDisplayName.length}`);
  console.log(`Missing badge class: ${missingBadgeClass.length}`);
  console.log(`Duplicate display names: ${duplicateDisplayNames.length}`);

  if (missingShortName.length > 0) {
    console.log(`Missing short-name codes: ${missingShortName.join(", ")}`);
  }

  if (missingDisplayName.length > 0) {
    console.log(`Missing display-name codes: ${missingDisplayName.join(", ")}`);
  }

  if (missingBadgeClass.length > 0) {
    console.log(`Missing badge-class codes: ${missingBadgeClass.join(", ")}`);
  }

  if (duplicateDisplayNames.length > 0) {
    console.log("Duplicate display names detail:");
    for (const duplicate of duplicateDisplayNames) {
      console.log(`  ${duplicate.displayName}: ${duplicate.codes.join(", ")}`);
    }
  }

  if (previous) {
    const previousObject = await readJsonObject(previous);
    const previousEntries = Object.entries(previousObject).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    const diff = diffInstitutions(previousEntries, currentEntries);

    console.log(`Compared to previous: ${previous}`);
    console.log(`Added codes: ${diff.added.length}`);
    console.log(`Removed codes: ${diff.removed.length}`);
    console.log(`Changed codes: ${diff.changed.length}`);

    if (diff.added.length > 0) {
      console.log(`Added: ${diff.added.join(", ")}`);
    }

    if (diff.removed.length > 0) {
      console.log(`Removed: ${diff.removed.join(", ")}`);
    }

    if (diff.changed.length > 0) {
      console.log(`Changed: ${diff.changed.join(", ")}`);
    }
  } else {
    console.log("No --previous provided; diff skipped.");
  }

  if (
    missingShortName.length > 0 ||
    missingDisplayName.length > 0 ||
    missingBadgeClass.length > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
