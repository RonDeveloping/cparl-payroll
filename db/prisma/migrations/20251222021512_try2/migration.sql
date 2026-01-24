/*
  Warnings:

  - The primary key for the `Address` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `personId` on the `Address` table. All the data in the column will be lost.
  - The primary key for the `BankAccount` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `personId` on the `BankAccount` table. All the data in the column will be lost.
  - The primary key for the `Email` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `personId` on the `Email` table. All the data in the column will be lost.
  - The primary key for the `Phone` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `personId` on the `Phone` table. All the data in the column will be lost.
  - You are about to drop the `Person` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[contactId,addressHash]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactId,email]` on the table `Email` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contactId,number]` on the table `Phone` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addressHash` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `BankAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactId` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Email` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactId` to the `Phone` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConversationalNameSource" AS ENUM ('USER', 'SUPPORT', 'IMPORT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'TERMINATED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "ROEReasonCode" AS ENUM ('A_SHORTAGE_OF_WORK', 'B_STRIKE_LOCKOUT', 'C_RETURN_TO_SCHOOL', 'D_ILLNESS_INJURY', 'E_QUIT', 'F_MATERNITY', 'G_RETIREMENT', 'H_WORK_SHARING', 'J_DISMISSAL', 'M_DISMISSAL_PROBATION', 'N_LEAVE_OF_ABSENCE', 'P_PARENTAL', 'OTHER');

-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('HOURLY', 'SALARY');

-- CreateEnum
CREATE TYPE "EarningType" AS ENUM ('REGULAR', 'OVERTIME', 'BONUS', 'COMMISSION', 'OTHER');

-- CreateEnum
CREATE TYPE "PayrollRunStatus" AS ENUM ('DRAFT', 'FINALIZED', 'PAID');

-- CreateEnum
CREATE TYPE "DeductionType" AS ENUM ('TAX', 'CPP', 'EI', 'BENEFIT', 'OTHER');

-- CreateEnum
CREATE TYPE "DisbursementStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "DistributionType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE', 'REMAINDER');

-- CreateEnum
CREATE TYPE "JournalStatus" AS ENUM ('PENDING', 'POSTED', 'FAILED', 'VOIDED');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "RemittanceStatus" AS ENUM ('PENDING', 'REVIEWED', 'FILED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'SEMIMONTHLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "AccountCategory" AS ENUM ('CASH', 'PAYROLL_EXPENSE', 'TAX_PAYABLE', 'BENEFIT_PAYABLE', 'WAGES_PAYABLE', 'OTHER');

-- CreateEnum
CREATE TYPE "MappingType" AS ENUM ('EARNING', 'DEDUCTION', 'EMPLOYER_TAX', 'NET_PAY_CLEARING');

-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_personId_fkey";

-- DropForeignKey
ALTER TABLE "BankAccount" DROP CONSTRAINT "BankAccount_personId_fkey";

-- DropForeignKey
ALTER TABLE "Email" DROP CONSTRAINT "Email_personId_fkey";

-- DropForeignKey
ALTER TABLE "Phone" DROP CONSTRAINT "Phone_personId_fkey";

-- DropIndex
DROP INDEX "Email_email_key";

-- AlterTable
ALTER TABLE "Address" DROP CONSTRAINT "Address_pkey",
DROP COLUMN "personId",
ADD COLUMN     "addressHash" TEXT NOT NULL,
ADD COLUMN     "contactId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "city" SET DEFAULT 'Ottawa',
ADD CONSTRAINT "Address_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Address_id_seq";

-- AlterTable
ALTER TABLE "BankAccount" DROP CONSTRAINT "BankAccount_pkey",
DROP COLUMN "personId",
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "priority" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "type" "DistributionType" NOT NULL DEFAULT 'REMAINDER',
ADD COLUMN     "value" DECIMAL(10,2),
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BankAccount_id_seq";

-- AlterTable
ALTER TABLE "Email" DROP CONSTRAINT "Email_pkey",
DROP COLUMN "personId",
ADD COLUMN     "contactId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Email_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Email_id_seq";

-- AlterTable
ALTER TABLE "Phone" DROP CONSTRAINT "Phone_pkey",
DROP COLUMN "personId",
ADD COLUMN     "contactId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Phone_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Phone_id_seq";

-- DropTable
DROP TABLE "Person";

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "middleName" TEXT,
    "suffix" TEXT,
    "prefix" TEXT,
    "nickName" TEXT,
    "displayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LegalNameHistory" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "middleName" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "changedBy" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LegalNameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationalNameHistory" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "suffix" TEXT,
    "prefix" TEXT,
    "nickName" TEXT,
    "displayName" TEXT,
    "source" "ConversationalNameSource",
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationalNameHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "employeeNumber" TEXT,
    "taxIdEncrypted" BYTEA NOT NULL,
    "taxIdLast4" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "hireDate" TIMESTAMP(3) NOT NULL,
    "status" "EmployeeStatus" NOT NULL,
    "terminationDate" TIMESTAMP(3),
    "terminationReason" "ROEReasonCode",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressCached" JSONB NOT NULL,
    "emailCached" TEXT,
    "phoneCached" JSONB,
    "nameCached" JSONB NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT,
    "department" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "countryCode" TEXT NOT NULL DEFAULT 'CA',
    "provinceCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobAssignment" (
    "id" TEXT NOT NULL,
    "employmentId" TEXT NOT NULL,
    "departmentId" TEXT,
    "costCenterId" TEXT,
    "projectCode" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "payRate" DECIMAL(10,2) NOT NULL,
    "payType" "PayType" NOT NULL,

    CONSTRAINT "JobAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "jobAssignmentId" TEXT NOT NULL,
    "workDate" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRun" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "runDate" TIMESTAMP(3) NOT NULL,
    "status" "PayrollRunStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollRunEmployee" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "addressSnapshot" TEXT NOT NULL,
    "grossPay" DECIMAL(10,2) NOT NULL,
    "deductions" DECIMAL(10,2) NOT NULL,
    "netPay" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollRunEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollLine" (
    "id" TEXT NOT NULL,
    "payrollRunEmployeeId" TEXT NOT NULL,
    "jobAssignmentId" TEXT,
    "rate" DECIMAL(10,2) NOT NULL,
    "units" DECIMAL(6,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "earningType" "EarningType" NOT NULL,
    "costCenterId" TEXT,
    "departmentId" TEXT,

    CONSTRAINT "PayrollLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatHoliday" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL,
    "provinceCode" TEXT NOT NULL DEFAULT 'CA',

    CONSTRAINT "StatHoliday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deduction" (
    "id" TEXT NOT NULL,
    "payrollRunEmployeeId" TEXT NOT NULL,
    "type" "DeductionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollDisbursement" (
    "id" TEXT NOT NULL,
    "payrollRunEmployeeId" TEXT NOT NULL,
    "institutionNumber" INTEGER NOT NULL,
    "branchNumber" INTEGER NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "bankLabel" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "DisbursementStatus" NOT NULL DEFAULT 'PENDING',
    "referenceNumber" TEXT,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "PayrollDisbursement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollJournal" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "JournalStatus" NOT NULL DEFAULT 'PENDING',
    "postedAt" TIMESTAMP(3),
    "totalDebit" DECIMAL(12,2) NOT NULL,
    "totalCredit" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "payrollJournalId" TEXT NOT NULL,
    "glAccountNumber" TEXT,
    "glAccountName" TEXT NOT NULL,
    "type" "EntryType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaySlip" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "s3Key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "employeeId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "PaySlip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Remittance" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "totalGrossPayroll" DECIMAL(12,2) NOT NULL,
    "totalEmployees" INTEGER NOT NULL,
    "totalDue" DECIMAL(12,2) NOT NULL,
    "status" "RemittanceStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" TEXT,
    "filedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Remittance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemittanceToPayrollRun" (
    "remittanceId" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,

    CONSTRAINT "RemittanceToPayrollRun_pkey" PRIMARY KEY ("remittanceId","payrollRunId")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "businessNumber" TEXT,
    "industry" TEXT,
    "baseCurrency" TEXT NOT NULL DEFAULT 'CAD',
    "standardWorkDayHours" DECIMAL(4,2) NOT NULL DEFAULT 8.0,
    "standardWorkWeekHours" DECIMAL(4,2) NOT NULL DEFAULT 40.0,
    "remittanceFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSettings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enableGarnishments" BOOLEAN NOT NULL DEFAULT true,
    "autoApproveTime" BOOLEAN NOT NULL DEFAULT false,
    "timezone" TEXT NOT NULL DEFAULT 'America/Toronto',
    "dateFormat" TEXT NOT NULL DEFAULT 'YYYY-MM-DD',

    CONSTRAINT "TenantSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollCycle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" "PayFrequency" NOT NULL,
    "firstPeriodStart" TIMESTAMP(3) NOT NULL,
    "firstPayDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChartOfAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "AccountType" NOT NULL,
    "category" "AccountCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartOfAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GLMapping" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "chartOfAccountId" TEXT NOT NULL,
    "mappingType" "MappingType" NOT NULL,
    "earningType" "EarningType",
    "deductionType" "DeductionType",
    "departmentId" TEXT,

    CONSTRAINT "GLMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LegalNameHistory_contactId_effectiveFrom_idx" ON "LegalNameHistory"("contactId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "ConversationalNameHistory_contactId_effectiveFrom_idx" ON "ConversationalNameHistory"("contactId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_tenantId_contactId_key" ON "Employee"("tenantId", "contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_tenantId_employeeNumber_key" ON "Employee"("tenantId", "employeeNumber");

-- CreateIndex
CREATE INDEX "Employment_tenantId_employeeId_startDate_idx" ON "Employment"("tenantId", "employeeId", "startDate");

-- CreateIndex
CREATE INDEX "Employment_employeeId_startDate_idx" ON "Employment"("employeeId", "startDate");

-- CreateIndex
CREATE INDEX "JobAssignment_employmentId_startDate_idx" ON "JobAssignment"("employmentId", "startDate");

-- CreateIndex
CREATE INDEX "TimeEntry_jobAssignmentId_workDate_idx" ON "TimeEntry"("jobAssignmentId", "workDate");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_tenantId_periodStart_periodEnd_key" ON "PayrollRun"("tenantId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRunEmployee_payrollRunId_employeeId_key" ON "PayrollRunEmployee"("payrollRunId", "employeeId");

-- CreateIndex
CREATE INDEX "StatHoliday_tenantId_date_idx" ON "StatHoliday"("tenantId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StatHoliday_tenantId_date_provinceCode_key" ON "StatHoliday"("tenantId", "date", "provinceCode");

-- CreateIndex
CREATE UNIQUE INDEX "Deduction_payrollRunEmployeeId_type_key" ON "Deduction"("payrollRunEmployeeId", "type");

-- CreateIndex
CREATE INDEX "PayrollDisbursement_payrollRunEmployeeId_idx" ON "PayrollDisbursement"("payrollRunEmployeeId");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollJournal_payrollRunId_key" ON "PayrollJournal"("payrollRunId");

-- CreateIndex
CREATE INDEX "PayrollJournal_tenantId_idx" ON "PayrollJournal"("tenantId");

-- CreateIndex
CREATE INDEX "PaySlip_employeeId_idx" ON "PaySlip"("employeeId");

-- CreateIndex
CREATE INDEX "PaySlip_tenantId_idx" ON "PaySlip"("tenantId");

-- CreateIndex
CREATE INDEX "PaySlip_tenantId_createdAt_idx" ON "PaySlip"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "PaySlip_employeeId_createdAt_idx" ON "PaySlip"("employeeId", "createdAt");

-- CreateIndex
CREATE INDEX "Remittance_tenantId_status_idx" ON "Remittance"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Remittance_tenantId_periodYear_periodMonth_key" ON "Remittance"("tenantId", "periodYear", "periodMonth");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettings_tenantId_key" ON "TenantSettings"("tenantId");

-- CreateIndex
CREATE INDEX "PayrollCycle_tenantId_idx" ON "PayrollCycle"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Department_tenantId_code_key" ON "Department"("tenantId", "code");

-- CreateIndex
CREATE INDEX "ChartOfAccount_tenantId_idx" ON "ChartOfAccount"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "ChartOfAccount_tenantId_code_key" ON "ChartOfAccount"("tenantId", "code");

-- CreateIndex
CREATE INDEX "GLMapping_tenantId_mappingType_idx" ON "GLMapping"("tenantId", "mappingType");

-- CreateIndex
CREATE INDEX "Address_contactId_idx" ON "Address"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_contactId_addressHash_key" ON "Address"("contactId", "addressHash");

-- CreateIndex
CREATE INDEX "BankAccount_employeeId_idx" ON "BankAccount"("employeeId");

-- CreateIndex
CREATE INDEX "Email_contactId_idx" ON "Email"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_contactId_email_key" ON "Email"("contactId", "email");

-- CreateIndex
CREATE INDEX "Phone_contactId_idx" ON "Phone"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "Phone_contactId_number_key" ON "Phone"("contactId", "number");

-- AddForeignKey
ALTER TABLE "LegalNameHistory" ADD CONSTRAINT "LegalNameHistory_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationalNameHistory" ADD CONSTRAINT "ConversationalNameHistory_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Phone" ADD CONSTRAINT "Phone_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employment" ADD CONSTRAINT "Employment_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobAssignment" ADD CONSTRAINT "JobAssignment_employmentId_fkey" FOREIGN KEY ("employmentId") REFERENCES "Employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_jobAssignmentId_fkey" FOREIGN KEY ("jobAssignmentId") REFERENCES "JobAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_payrollRunId_fkey" FOREIGN KEY ("payrollRunId") REFERENCES "PayrollRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollRunEmployee" ADD CONSTRAINT "PayrollRunEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLine" ADD CONSTRAINT "PayrollLine_payrollRunEmployeeId_fkey" FOREIGN KEY ("payrollRunEmployeeId") REFERENCES "PayrollRunEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollLine" ADD CONSTRAINT "PayrollLine_jobAssignmentId_fkey" FOREIGN KEY ("jobAssignmentId") REFERENCES "JobAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_payrollRunEmployeeId_fkey" FOREIGN KEY ("payrollRunEmployeeId") REFERENCES "PayrollRunEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollDisbursement" ADD CONSTRAINT "PayrollDisbursement_payrollRunEmployeeId_fkey" FOREIGN KEY ("payrollRunEmployeeId") REFERENCES "PayrollRunEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_payrollJournalId_fkey" FOREIGN KEY ("payrollJournalId") REFERENCES "PayrollJournal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemittanceToPayrollRun" ADD CONSTRAINT "RemittanceToPayrollRun_remittanceId_fkey" FOREIGN KEY ("remittanceId") REFERENCES "Remittance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSettings" ADD CONSTRAINT "TenantSettings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollCycle" ADD CONSTRAINT "PayrollCycle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GLMapping" ADD CONSTRAINT "GLMapping_chartOfAccountId_fkey" FOREIGN KEY ("chartOfAccountId") REFERENCES "ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
