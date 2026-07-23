/*
  Warnings:

  - The values [taxable_benefit,reasonable_allowance] on the enum `earning_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- Add IN_KIND and PER_DIEM to the earning_type enum
ALTER TYPE "earning_type" ADD VALUE 'in_kind' BEFORE 'other';
ALTER TYPE "earning_type" ADD VALUE 'per_diem' BEFORE 'other';
