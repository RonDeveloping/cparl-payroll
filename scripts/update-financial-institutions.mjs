#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_BADGE = "text-slate-600";
const INPUT_FILE = path.resolve(
  process.cwd(),
  "data",
  "payments-canada-directory.csv",
);
const OUTPUT_FILE = path.resolve(
  process.cwd(),
  "constants",
  "financial-institutions.data.json",
);

const ALIASES = {
  code: [
    "institution_number",
    "institution number",
    "institution_no",
    "institution no",
    "institution",
    "number",
    "code",
  ],
  shortName: ["short_name", "short name", "abbreviation", "abbr"],
  displayName: ["display_name", "display name", "name", "institution_name"],
};

const KNOWN_SHORT_NAMES_BY_CODE = {
  "001": "BMO",
  "002": "Scotia",
  "003": "RBC",
  "004": "TD",
  "006": "NBC",
  "010": "CIBC",
  "016": "HSBC",
  "030": "CWB",
  "039": "LBC",
};

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  out.push(current);
  return out.map((value) => value.trim());
}

function pickHeaderIndex(headers, candidates) {
  const normalized = headers.map(normalizeHeader);
  for (const candidate of candidates) {
    const index = normalized.indexOf(normalizeHeader(candidate));
    if (index >= 0) {
      return index;
    }
  }
  return -1;
}

function toCode(raw) {
  return String(raw || "")
    .replace(/\D/g, "")
    .slice(0, 3)
    .padStart(3, "0");
}

function toShortName(code, displayName) {
  const known = KNOWN_SHORT_NAMES_BY_CODE[code];
  if (known) {
    return known;
  }

  const stopWords = new Set(["the", "of", "and", "for", "to", "a", "an"]);
  const words = displayName
    .replace(/[^A-Za-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "Unknown";
  }

  if (words.length === 1) {
    return words[0].slice(0, 10);
  }

  const meaningfulWords = words.filter(
    (word) => !stopWords.has(word.toLowerCase()),
  );

  const abbreviation = (meaningfulWords.length > 0 ? meaningfulWords : words)
    .slice(0, 4)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return abbreviation || words[0].slice(0, 10);
}

function parseArgs(argv) {
  const args = { input: INPUT_FILE, output: OUTPUT_FILE };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--input") {
      args.input = argv[i + 1] || "";
      i += 1;
    } else if (token === "--output") {
      args.output = path.resolve(process.cwd(), argv[i + 1] || OUTPUT_FILE);
      i += 1;
    }
  }

  return args;
}

async function downloadPaymentsCandidateDirectory(filePath) {
  console.log("Downloading Payments Canada directory from official feed...");
  const url =
    "https://www.payments.ca/payment-resources/directories?field_directory_type=10&page=";
  const rows = [];
  const seenSignatures = new Set();

  for (let page = 0; page < 80; page += 1) {
    try {
      const resp = await fetch(`${url}${page}`);
      if (!resp.ok) break;

      const html = await resp.text();
      const codeRegex =
        /<td[^>]*class="views-field views-field-natural-title1"[^>]*>(?<v>.*?)<\/td>/gs;
      const nameRegex =
        /<td[^>]*class="views-field views-field-natural-title"[^>]*>(?<v>.*?)<\/td>/gs;

      const codes = Array.from(html.matchAll(codeRegex)).map((m) =>
        m.groups.v.replace(/<[^>]+>/g, "").trim(),
      );
      const names = Array.from(html.matchAll(nameRegex)).map((m) =>
        m.groups.v.replace(/<[^>]+>/g, "").trim(),
      );

      if (codes.length === 0 || names.length === 0) break;

      const sig = codes.slice(0, 3).join("|");
      if (seenSignatures.has(sig)) break;
      seenSignatures.add(sig);

      const count = Math.min(codes.length, names.length);
      for (let i = 0; i < count; i += 1) {
        const code = String(codes[i] || "")
          .replace(/\D/g, "")
          .padStart(3, "0")
          .slice(0, 3);
        const name = String(names[i] || "").trim();

        if (code.length === 3 && name) {
          rows.push({ institution_number: code, display_name: name });
        }
      }

      console.log(`  page ${page}: ${count} rows`);
    } catch (error) {
      console.error(`  page ${page}: fetch failed`, error.message);
      break;
    }
  }

  if (rows.length === 0) {
    throw new Error("Failed to download directory data from Payments Canada.");
  }

  const unique = Array.from(
    new Map(
      rows.map((row) => [`${row.institution_number}|${row.display_name}`, row]),
    ).values(),
  ).sort((a, b) => a.institution_number.localeCompare(b.institution_number));

  const csv = ["institution_number,display_name"];
  for (const row of unique) {
    csv.push(
      `"${row.institution_number}","${row.display_name.replace(/"/g, '""')}"`,
    );
  }

  await fs.writeFile(filePath, csv.join("\n") + "\n", "utf8");
  console.log(`Downloaded ${unique.length} institutions to ${filePath}`);
}

async function main() {
  const { input, output } = parseArgs(process.argv.slice(2));

  const inputPath = path.resolve(process.cwd(), input);
  try {
    await fs.access(inputPath);
  } catch {
    if (input === INPUT_FILE) {
      console.log(`CSV not found at ${inputPath}. Attempting auto-download...`);
      try {
        await downloadPaymentsCandidateDirectory(inputPath);
      } catch (error) {
        throw new Error(
          `Auto-download failed: ${error.message}. Manual workflow: put your CSV at data/payments-canada-directory.csv or pass --input <path>.`,
        );
      }
    } else {
      throw new Error(
        `Input CSV not found at ${inputPath}. Put your file at data/payments-canada-directory.csv or pass --input <path>.`,
      );
    }
  }

  const raw = await fs.readFile(inputPath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headers = parseCsvLine(lines[0]);
  const codeIndex = pickHeaderIndex(headers, ALIASES.code);
  const shortNameIndex = pickHeaderIndex(headers, ALIASES.shortName);
  const displayNameIndex = pickHeaderIndex(headers, ALIASES.displayName);

  if (codeIndex < 0 || displayNameIndex < 0) {
    throw new Error(
      `CSV headers must include institution code and display name. Found headers: ${headers.join(", ")}`,
    );
  }

  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]);
    const code = toCode(values[codeIndex]);
    const displayName = String(values[displayNameIndex] || "").trim();

    if (!code || code.length !== 3 || !displayName) {
      continue;
    }

    const explicitShort =
      shortNameIndex >= 0 ? String(values[shortNameIndex] || "").trim() : "";

    rows.push({
      code,
      shortName: explicitShort || toShortName(code, displayName),
      displayName,
      badgeClass: DEFAULT_BADGE,
    });
  }

  const uniqueSorted = Array.from(
    new Map(rows.map((row) => [row.code, row])).values(),
  ).sort((a, b) => a.code.localeCompare(b.code));

  const outputObject = Object.fromEntries(
    uniqueSorted.map((row) => [
      row.code,
      {
        shortName: row.shortName,
        displayName: row.displayName,
        badgeClass: row.badgeClass,
      },
    ]),
  );

  await fs.writeFile(
    output,
    `${JSON.stringify(outputObject, null, 2)}\n`,
    "utf8",
  );

  console.log(`Updated ${output} with ${uniqueSorted.length} institutions.`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
