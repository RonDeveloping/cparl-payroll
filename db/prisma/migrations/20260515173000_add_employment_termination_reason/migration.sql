-- CreateEnum
CREATE TYPE "termination_reason" AS ENUM (
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'J',
    'K',
    'M',
    'N',
    'P',
    'Z'
);

-- ROE code descriptions:
-- A = Shortage of work / end of contract or season
-- B = Strike or lockout
-- C = Return to school
-- D = Illness or injury
-- E = Quit
-- F = Maternity
-- G = Retirement
-- H = Work-sharing
-- J = Apprentice training
-- K = Other
-- M = Dismissal
-- N = Leave of absence
-- P = Parental
-- Z = Compassionate care / family caregiver

-- AlterTable
ALTER TABLE "employment"
ADD COLUMN "termination_reason" "termination_reason";

-- Enforce both-or-none consistency between end date and reason
ALTER TABLE "employment"
ADD CONSTRAINT "employment_termination_consistency_check"
CHECK (
    ("end_date" IS NULL AND "termination_reason" IS NULL)
    OR
    ("end_date" IS NOT NULL AND "termination_reason" IS NOT NULL)
);
