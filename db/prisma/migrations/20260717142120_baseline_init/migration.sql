-- CreateEnum
CREATE TYPE "ItemClass" AS ENUM ('GROSS_PAY', 'TAXABLE_ALLOWANCES', 'KIND_BENEFITS', 'TAXES_PAYABLE', 'EMPLOYER_CPP', 'EMPLOYER_EI', 'CPP_PAYABLE', 'EI_PAYABLE', 'BENEFITS_PAYABLE', 'REASONABLE_ALLOWANCES', 'PAYROLL_CLEARING');

-- CreateEnum
CREATE TYPE "token_type" AS ENUM ('email_verification', 'password_reset', 'email_change', 'setup_password');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('owner', 'admin', 'manager', 'accountant', 'employee');

-- CreateEnum
CREATE TYPE "conversational_name_source" AS ENUM ('user', 'support', 'import', 'system');

-- CreateEnum
CREATE TYPE "phone_type" AS ENUM ('mobile', 'home', 'work');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('active', 'terminated', 'inactive');

-- CreateEnum
CREATE TYPE "termination_reason" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Z');

-- CreateEnum
CREATE TYPE "earning_type" AS ENUM ('regular', 'overtime', 'sick', 'holiday', 'vacation', 'bonus', 'commission', 'taxable_benefit', 'reasonable_allowance', 'other');

-- CreateEnum
CREATE TYPE "payroll_run_status" AS ENUM ('draft', 'finalized', 'paid');

-- CreateEnum
CREATE TYPE "deduction_type" AS ENUM ('tax', 'cpp', 'ei', 'benefit', 'other');

-- CreateEnum
CREATE TYPE "DistributionType" AS ENUM ('fixed_amount', 'percentage', 'remainder');

-- CreateEnum
CREATE TYPE "bank_account_verification_status" AS ENUM ('unverified', 'pending', 'verified', 'failed');

-- CreateEnum
CREATE TYPE "disbursement_status" AS ENUM ('pending', 'sent', 'failed', 'reconciled');

-- CreateEnum
CREATE TYPE "pay_frequency" AS ENUM ('monthly', 'semimonthly', 'biweekly', 'weekly');

-- CreateEnum
CREATE TYPE "weekday" AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- CreateEnum
CREATE TYPE "account_type" AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');

-- CreateEnum
CREATE TYPE "account_category" AS ENUM ('cash', 'payroll_expense', 'tax_payable', 'benefit_payable', 'wages_payable', 'other');

-- CreateEnum
CREATE TYPE "mapping_type" AS ENUM ('earning', 'deduction', 'employer_tax', 'net_pay_clearing');

-- CreateEnum
CREATE TYPE "remittance_status" AS ENUM ('pending', 'reviewed', 'filed', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "journal_status" AS ENUM ('pending', 'posted', 'failed', 'voided');

-- CreateEnum
CREATE TYPE "entry_type" AS ENUM ('debit', 'credit');

-- CreateEnum
CREATE TYPE "subject" AS ENUM ('organization', 'individual');

-- CreateEnum
CREATE TYPE "billing_interval" AS ENUM ('monthly', 'yearly');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('trialing', 'active', 'past_due', 'paused', 'canceled', 'expired');

-- CreateEnum
CREATE TYPE "invoice_status" AS ENUM ('draft', 'open', 'paid', 'overdue', 'void', 'uncollectible');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'reversed');

-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('stripe', 'paddle', 'manual', 'other');

-- CreateEnum
CREATE TYPE "payment_method_type" AS ENUM ('card', 'pap');

-- CreateEnum
CREATE TYPE "province_code" AS ENUM ('AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT', 'CA');

-- CreateEnum
CREATE TYPE "tax_calculation_method" AS ENUM ('regular', 'bonus', 'flat', 'exempt');

-- CreateEnum
CREATE TYPE "holiday_pay_method" AS ENUM ('statutory', 'fixed');

-- CreateEnum
CREATE TYPE "overtime_period_type" AS ENUM ('daily', 'weekly', 'holiday');

-- CreateEnum
CREATE TYPE "overtime_type" AS ENUM ('standard', 'double', 'custom');

-- CreateEnum
CREATE TYPE "vacation_balance_unit" AS ENUM ('amount', 'hours');

-- CreateEnum
CREATE TYPE "vacation_ledger_entry_type" AS ENUM ('accrual', 'usage', 'payout', 'adjustment');

-- CreateEnum
CREATE TYPE "severance_type" AS ENUM ('retiring_direct', 'retiring_transfer', 'salary_continuation');

-- CreateTable
CREATE TABLE "service_plan" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "monthly_price" DECIMAL(10,2) NOT NULL,
    "yearly_price" DECIMAL(10,2) NOT NULL,
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "max_employees" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_customer" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "billing_email" TEXT,
    "external_customer_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoice" (
    "id" TEXT NOT NULL,
    "billing_customer_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "status" "invoice_status" NOT NULL DEFAULT 'draft',
    "billing_interval" "billing_interval" NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "tax_total" DECIMAL(12,2) NOT NULL,
    "total" DECIMAL(12,2) NOT NULL,
    "amount_paid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "due_date" TIMESTAMP(3),
    "issued_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "voided_at" TIMESTAMP(3),
    "external_invoice_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_invoice_line" (
    "id" TEXT NOT NULL,
    "billing_invoice_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_invoice_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transaction" (
    "id" TEXT NOT NULL,
    "billing_customer_id" TEXT NOT NULL,
    "billing_invoice_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "payment_method_type" "payment_method_type" NOT NULL DEFAULT 'card',
    "status" "payment_status" NOT NULL DEFAULT 'pending',
    "provider" "payment_provider" NOT NULL,
    "payment_method_snapshot" JSONB,
    "provider_transaction_id" TEXT,
    "failure_reason" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_email_token" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_email_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "candidate_email" TEXT,
    "password_hash" TEXT,
    "terms_accepted_at" TIMESTAMP(3),
    "terms_version_accepted" TEXT,
    "contact_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_2fa_at" TIMESTAMP(3),
    "phone" TEXT,
    "phone_verified_at" TIMESTAMP(3),
    "pending_phone" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "token_type" NOT NULL DEFAULT 'email_verification',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_verification" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "two_factor_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_card" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "exp_month" INTEGER NOT NULL,
    "exp_year" INTEGER NOT NULL,
    "cardholder_name" TEXT,
    "billing_postal_code" TEXT,
    "payment_method_id" TEXT NOT NULL,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT,
    "institution_number" INTEGER NOT NULL,
    "branch_number" INTEGER NOT NULL,
    "account_number" TEXT NOT NULL,
    "account_last4" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "verification_status" TEXT NOT NULL DEFAULT 'unverified',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact" (
    "id" TEXT NOT NULL,
    "core_name" TEXT NOT NULL,
    "kind_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "prefix" TEXT,
    "suffix" TEXT,
    "alias_name" TEXT,
    "display_name" TEXT,
    "source" "conversational_name_source",
    "subject" "subject" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_name_history" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "core_name" TEXT NOT NULL,
    "kind_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "changed_by" TEXT,
    "reason" TEXT,
    "source" "conversational_name_source",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_name_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversational_name_history" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "suffix" TEXT,
    "prefix" TEXT,
    "alias_name" TEXT,
    "display_name" TEXT,
    "source" "conversational_name_source",
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversational_name_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "address" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "address_hash" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_address" TEXT NOT NULL,

    CONSTRAINT "email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "phone_type" DEFAULT 'mobile',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "phone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "primary_contact_person_id" TEXT,
    "name_cached" JSONB NOT NULL,
    "slug" TEXT NOT NULL,
    "business_bn9" CHAR(9),
    "business_program_id" CHAR(2),
    "program_ref_num" CHAR(4),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_user" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'employee',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "tenant_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/Toronto',
    "billing_email" TEXT,
    "payment_method_type" "payment_method_type",
    "payment_src_id" TEXT,

    CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_subscription" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "plan_display_name" TEXT NOT NULL,
    "status" "subscription_status" NOT NULL DEFAULT 'trialing',
    "billing_interval" "billing_interval" NOT NULL,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "canceled_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "external_subscription_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pay_schedule" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "payroll_unit_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "frequency" "pay_frequency" NOT NULL,
    "timing_days" INTEGER NOT NULL DEFAULT 2,
    "pay_day" INTEGER,
    "pay_weekday" "weekday",
    "boundary_shift" INTEGER NOT NULL,
    "period_end_day" INTEGER NOT NULL,
    "period_end_weekday" "weekday",
    "payday2" INTEGER,
    "period_end_day2" INTEGER,
    "boundary_shift2" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pay_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_unit" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_unit_employee" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "payroll_unit_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_unit_employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_account" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "account_type" NOT NULL,
    "category" "account_category" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_of_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gl_mapping" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "chart_of_account_id" TEXT NOT NULL,
    "mapping_type" "mapping_type" NOT NULL,
    "earning_type" "earning_type",
    "deduction_type" "deduction_type",
    "department_id" TEXT,

    CONSTRAINT "gl_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_gl_matrix" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "item_class" "ItemClass" NOT NULL,
    "gl_account_id" TEXT NOT NULL,
    "gl_account_name" TEXT NOT NULL,
    "is_debit" BOOLEAN NOT NULL DEFAULT true,
    "payroll_unit_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_gl_matrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "employee_number" TEXT,
    "tax_id_encrypted" BYTEA NOT NULL,
    "tax_id_last_4" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "address_cached" JSONB NOT NULL,
    "email_cached" TEXT,
    "phone_cached" JSONB,
    "name_cached" JSONB NOT NULL,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employment" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "title" TEXT,
    "department" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "termination_reason" "termination_reason",
    "country_code" TEXT NOT NULL DEFAULT 'CA',
    "province_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_assignment" (
    "id" TEXT NOT NULL,
    "employment_id" TEXT NOT NULL,
    "earning_code_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "hours_per_week" DECIMAL(6,2),
    "pay_rate" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "job_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entry" (
    "id" TEXT NOT NULL,
    "job_assignment_id" TEXT NOT NULL,
    "work_date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(6,2) NOT NULL,

    CONSTRAINT "time_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_run" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "payroll_unit_id" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "run_date" TIMESTAMP(3) NOT NULL,
    "status" "payroll_run_status" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_run_employee" (
    "id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "name_snapshot" TEXT NOT NULL,
    "address_snapshot" TEXT NOT NULL,
    "gross_pay" DECIMAL(10,2) NOT NULL,
    "deductions" DECIMAL(10,2) NOT NULL,
    "net_pay" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_run_employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_line" (
    "id" TEXT NOT NULL,
    "payroll_run_employee_id" TEXT NOT NULL,
    "job_assignment_id" TEXT,
    "rate" DECIMAL(10,2) NOT NULL,
    "units" DECIMAL(6,2) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "earning_type" "earning_type" NOT NULL,
    "counts_toward_holiday_pay" BOOLEAN NOT NULL DEFAULT true,
    "counts_toward_vacation_accrual" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "payroll_line_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeDetails" (
    "id" TEXT NOT NULL,
    "payroll_line_id" TEXT NOT NULL,
    "overtimeRate" DECIMAL(10,2) NOT NULL,
    "config_id" TEXT NOT NULL,
    "period_type" "overtime_period_type" NOT NULL DEFAULT 'weekly',
    "work_date" TIMESTAMP(3),
    "regularRate" DECIMAL(10,2) NOT NULL,
    "overtimeHours" DECIMAL(6,2) NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "OvertimeDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "overtime_config" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "province_code" "province_code",
    "description" TEXT NOT NULL,
    "overtime_type" "overtime_type" NOT NULL,
    "custom_multiplier" DECIMAL(4,2),
    "thresholdHours" DECIMAL(6,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "overtime_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deduction" (
    "id" TEXT NOT NULL,
    "payroll_run_employee_id" TEXT NOT NULL,
    "type" "deduction_type" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" TEXT NOT NULL,
    "institution_number" INTEGER NOT NULL,
    "branch_number" INTEGER NOT NULL,
    "account_number" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CAD',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT,
    "type" "DistributionType" NOT NULL DEFAULT 'remainder',
    "value" DECIMAL(10,2),
    "priority" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "verification_status" "bank_account_verification_status" NOT NULL DEFAULT 'unverified',
    "employee_id" TEXT NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_disbursements" (
    "id" TEXT NOT NULL,
    "payroll_run_employee_id" TEXT NOT NULL,
    "institution_number" INTEGER NOT NULL,
    "branch_number" INTEGER NOT NULL,
    "account_number" TEXT NOT NULL,
    "bank_label" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "disbursement_status" NOT NULL DEFAULT 'pending',
    "reference_number" TEXT,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payroll_disbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_journals" (
    "id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" "journal_status" NOT NULL DEFAULT 'pending',
    "posted_at" TIMESTAMP(3),
    "total_debit" DECIMAL(12,2) NOT NULL,
    "total_credit" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payroll_journals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "payroll_journal_id" TEXT NOT NULL,
    "gl_account_number" TEXT,
    "gl_account_name" TEXT NOT NULL,
    "type" "entry_type" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pay_slips" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "s3_key" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "employee_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,

    CONSTRAINT "pay_slips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remittances" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "period_year" INTEGER NOT NULL,
    "period_month" INTEGER NOT NULL,
    "total_gross_payroll" DECIMAL(12,2) NOT NULL,
    "total_employees" INTEGER NOT NULL,
    "total_due" DECIMAL(12,2) NOT NULL,
    "status" "remittance_status" NOT NULL DEFAULT 'pending',
    "payment_reference" TEXT,
    "filed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "remittances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remittance_to_payroll_runs" (
    "remittance_id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,

    CONSTRAINT "remittance_to_payroll_runs_pkey" PRIMARY KEY ("remittance_id","payroll_run_id")
);

-- CreateTable
CREATE TABLE "cpp_ei_rates" (
    "id" TEXT NOT NULL,
    "tax_year" INTEGER NOT NULL,
    "province_code" CHAR(2) NOT NULL,
    "cpp_base_rate" DECIMAL(5,4) NOT NULL,
    "cpp_enhanced_rate" DECIMAL(5,4) NOT NULL,
    "cpp_exemption" DECIMAL(5,4) NOT NULL,
    "cpp_ympe" DECIMAL(10,2) NOT NULL,
    "cpp2_rate" DECIMAL(5,4) NOT NULL,
    "cpp2_ympe" DECIMAL(10,2) NOT NULL,
    "ei_rate" DECIMAL(5,4) NOT NULL,
    "ei_max_earnings" DECIMAL(10,2) NOT NULL,
    "ei_multiplier" DECIMAL(5,4) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cpp_ei_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "tax_year" INTEGER NOT NULL,
    "province_code" CHAR(2) NOT NULL,
    "federal_rate" DECIMAL(5,4) NOT NULL,
    "lower_bound" DECIMAL(10,2) NOT NULL,
    "upper_bound" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earning_codes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "earning_type" "earning_type" NOT NULL,
    "is_hourly" BOOLEAN NOT NULL DEFAULT true,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "is_subject_to_cpp" BOOLEAN NOT NULL DEFAULT true,
    "is_subject_to_ei" BOOLEAN NOT NULL DEFAULT true,
    "t4_box_number" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earning_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_policy" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "vac_rate" DECIMAL(5,4) NOT NULL,
    "is_accrual_based" BOOLEAN NOT NULL DEFAULT true,
    "vac_balance" DECIMAL(10,2) NOT NULL,
    "balance_unit" "vacation_balance_unit" NOT NULL DEFAULT 'amount',
    "vac_hours_balance" DECIMAL(8,2),
    "accrual_hours_per_pay_period" DECIMAL(8,4),
    "accrual_start_date" TIMESTAMP(3),
    "payout_on_termination" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacation_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacation_ledger" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "vac_policy_id" TEXT NOT NULL,
    "entry_type" "vacation_ledger_entry_type" NOT NULL,
    "effective_date" TIMESTAMP(3) NOT NULL,
    "hours" DECIMAL(8,2),
    "amount" DECIMAL(10,2) NOT NULL,
    "payroll_run_id" TEXT,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_policy" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "province_code" "province_code" NOT NULL,
    "method" "holiday_pay_method" NOT NULL,
    "average_window_weeks" INTEGER DEFAULT 4,
    "fixed_percent" DECIMAL(5,4),
    "minimum_employment_days" INTEGER,
    "include_vacation_pay" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_ledger" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "holiday_policy_id" TEXT NOT NULL,
    "payroll_run_id" TEXT,
    "holiday_date" TIMESTAMP(3) NOT NULL,
    "base_earnings" DECIMAL(10,2) NOT NULL,
    "hours" DECIMAL(8,2),
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holiday_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "severance_record" (
    "id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "severance_type" TEXT NOT NULL,
    "gross_amount" DECIMAL(10,2) NOT NULL,
    "tax_withheld" DECIMAL(10,2) NOT NULL,
    "t4_box_code" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "severance_record_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_customer_tenant_id_key" ON "billing_customer"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_customer_external_customer_id_key" ON "billing_customer"("external_customer_id");

-- CreateIndex
CREATE INDEX "billing_customer_tenant_id_idx" ON "billing_customer"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoice_invoice_number_key" ON "billing_invoice"("invoice_number");

-- CreateIndex
CREATE INDEX "billing_invoice_tenant_id_status_idx" ON "billing_invoice"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "billing_invoice_billing_customer_id_status_idx" ON "billing_invoice"("billing_customer_id", "status");

-- CreateIndex
CREATE INDEX "billing_invoice_line_billing_invoice_id_idx" ON "billing_invoice_line"("billing_invoice_id");

-- CreateIndex
CREATE INDEX "billing_invoice_line_plan_id_idx" ON "billing_invoice_line"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transaction_provider_transaction_id_key" ON "payment_transaction"("provider_transaction_id");

-- CreateIndex
CREATE INDEX "payment_transaction_tenant_id_status_idx" ON "payment_transaction"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payment_transaction_tenant_id_payment_method_type_idx" ON "payment_transaction"("tenant_id", "payment_method_type");

-- CreateIndex
CREATE INDEX "payment_transaction_billing_customer_id_status_idx" ON "payment_transaction"("billing_customer_id", "status");

-- CreateIndex
CREATE INDEX "payment_transaction_billing_invoice_id_idx" ON "payment_transaction"("billing_invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_email_token_token_key" ON "verification_email_token"("token");

-- CreateIndex
CREATE INDEX "verification_email_token_email_idx" ON "verification_email_token"("email");

-- CreateIndex
CREATE INDEX "verification_email_token_token_idx" ON "verification_email_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_slug_key" ON "user"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_contact_id_key" ON "user"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "auth_token_token_key" ON "auth_token"("token");

-- CreateIndex
CREATE INDEX "auth_token_user_id_type_idx" ON "auth_token"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "phone_verification_user_id_key" ON "phone_verification"("user_id");

-- CreateIndex
CREATE INDEX "phone_verification_user_id_idx" ON "phone_verification"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "two_factor_codes_user_id_key" ON "two_factor_codes"("user_id");

-- CreateIndex
CREATE INDEX "two_factor_codes_user_id_idx" ON "two_factor_codes"("user_id");

-- CreateIndex
CREATE INDEX "payment_card_user_id_idx" ON "payment_card"("user_id");

-- CreateIndex
CREATE INDEX "payment_accounts_user_id_idx" ON "payment_accounts"("user_id");

-- CreateIndex
CREATE INDEX "legal_name_history_contact_id_effective_from_idx" ON "legal_name_history"("contact_id", "effective_from");

-- CreateIndex
CREATE INDEX "conversational_name_history_contact_id_effective_from_idx" ON "conversational_name_history"("contact_id", "effective_from");

-- CreateIndex
CREATE INDEX "address_contact_id_idx" ON "address"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "address_contact_id_address_hash_key" ON "address"("contact_id", "address_hash");

-- CreateIndex
CREATE INDEX "email_contact_id_idx" ON "email"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_contact_id_email_address_key" ON "email"("contact_id", "email_address");

-- CreateIndex
CREATE INDEX "phone_contact_id_idx" ON "phone"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "phone_contact_id_number_key" ON "phone"("contact_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE INDEX "tenant_business_bn9_business_program_id_program_ref_num_idx" ON "tenant"("business_bn9", "business_program_id", "program_ref_num");

-- CreateIndex
CREATE INDEX "tenant_user_user_id_idx" ON "tenant_user"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_user_tenant_id_user_id_key" ON "tenant_user"("tenant_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenant_id_key" ON "tenant_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_subscription_tenant_id_status_idx" ON "tenant_subscription"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "tenant_subscription_plan_id_idx" ON "tenant_subscription"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_tenant_id_code_key" ON "department"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "pay_schedule_payroll_unit_id_idx" ON "pay_schedule"("payroll_unit_id");

-- CreateIndex
CREATE INDEX "pay_schedule_tenant_id_is_active_idx" ON "pay_schedule"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "pay_schedule_tenant_id_code_key" ON "pay_schedule"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "payroll_unit_tenant_id_is_active_idx" ON "payroll_unit"("tenant_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_unit_tenant_id_code_key" ON "payroll_unit"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "payroll_unit_employee_tenant_id_employee_id_start_date_idx" ON "payroll_unit_employee"("tenant_id", "employee_id", "start_date");

-- CreateIndex
CREATE INDEX "payroll_unit_employee_payroll_unit_id_start_date_idx" ON "payroll_unit_employee"("payroll_unit_id", "start_date");

-- CreateIndex
CREATE INDEX "chart_of_account_tenant_id_idx" ON "chart_of_account"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_account_tenant_id_code_key" ON "chart_of_account"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "gl_mapping_tenant_id_mapping_type_idx" ON "gl_mapping"("tenant_id", "mapping_type");

-- CreateIndex
CREATE INDEX "payroll_gl_matrix_tenant_id_payroll_unit_id_idx" ON "payroll_gl_matrix"("tenant_id", "payroll_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_tenant_id_contact_id_key" ON "employee"("tenant_id", "contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_tenant_id_employee_number_key" ON "employee"("tenant_id", "employee_number");

-- CreateIndex
CREATE INDEX "employment_tenant_id_employee_id_start_date_idx" ON "employment"("tenant_id", "employee_id", "start_date");

-- CreateIndex
CREATE INDEX "employment_employee_id_start_date_idx" ON "employment"("employee_id", "start_date");

-- CreateIndex
CREATE INDEX "job_assignment_employment_id_start_date_idx" ON "job_assignment"("employment_id", "start_date");

-- CreateIndex
CREATE INDEX "job_assignment_earning_code_id_idx" ON "job_assignment"("earning_code_id");

-- CreateIndex
CREATE INDEX "time_entry_job_assignment_id_work_date_idx" ON "time_entry"("job_assignment_id", "work_date");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_run_tenant_id_payroll_unit_id_period_start_period_e_key" ON "payroll_run"("tenant_id", "payroll_unit_id", "period_start", "period_end");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_run_employee_payroll_run_id_employee_id_key" ON "payroll_run_employee"("payroll_run_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeDetails_payroll_line_id_key" ON "OvertimeDetails"("payroll_line_id");

-- CreateIndex
CREATE INDEX "overtime_config_tenant_id_idx" ON "overtime_config"("tenant_id");

-- CreateIndex
CREATE INDEX "overtime_config_tenant_id_province_code_idx" ON "overtime_config"("tenant_id", "province_code");

-- CreateIndex
CREATE UNIQUE INDEX "deduction_payroll_run_employee_id_type_key" ON "deduction"("payroll_run_employee_id", "type");

-- CreateIndex
CREATE INDEX "bank_accounts_employee_id_idx" ON "bank_accounts"("employee_id");

-- CreateIndex
CREATE INDEX "payroll_disbursements_payroll_run_employee_id_idx" ON "payroll_disbursements"("payroll_run_employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_journals_payroll_run_id_key" ON "payroll_journals"("payroll_run_id");

-- CreateIndex
CREATE INDEX "payroll_journals_tenant_id_idx" ON "payroll_journals"("tenant_id");

-- CreateIndex
CREATE INDEX "pay_slips_employee_id_idx" ON "pay_slips"("employee_id");

-- CreateIndex
CREATE INDEX "pay_slips_tenant_id_idx" ON "pay_slips"("tenant_id");

-- CreateIndex
CREATE INDEX "pay_slips_tenant_id_created_at_idx" ON "pay_slips"("tenant_id", "created_at");

-- CreateIndex
CREATE INDEX "pay_slips_employee_id_created_at_idx" ON "pay_slips"("employee_id", "created_at");

-- CreateIndex
CREATE INDEX "remittances_tenant_id_status_idx" ON "remittances"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "remittances_tenant_id_period_year_period_month_key" ON "remittances"("tenant_id", "period_year", "period_month");

-- CreateIndex
CREATE UNIQUE INDEX "cpp_ei_rates_tax_year_province_code_key" ON "cpp_ei_rates"("tax_year", "province_code");

-- CreateIndex
CREATE INDEX "tax_rates_tax_year_province_code_idx" ON "tax_rates"("tax_year", "province_code");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_tax_year_province_code_key" ON "tax_rates"("tax_year", "province_code");

-- CreateIndex
CREATE UNIQUE INDEX "earning_codes_code_tenant_id_key" ON "earning_codes"("code", "tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "vacation_policy_tenant_id_employee_id_key" ON "vacation_policy"("tenant_id", "employee_id");

-- CreateIndex
CREATE INDEX "vacation_ledger_tenant_id_employee_id_effective_date_idx" ON "vacation_ledger"("tenant_id", "employee_id", "effective_date");

-- CreateIndex
CREATE UNIQUE INDEX "holiday_policy_tenant_id_province_code_key" ON "holiday_policy"("tenant_id", "province_code");

-- CreateIndex
CREATE INDEX "holiday_ledger_tenant_id_employee_id_holiday_date_idx" ON "holiday_ledger"("tenant_id", "employee_id", "holiday_date");

-- AddForeignKey
ALTER TABLE "billing_invoice" ADD CONSTRAINT "billing_invoice_billing_customer_id_fkey" FOREIGN KEY ("billing_customer_id") REFERENCES "billing_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_invoice_line" ADD CONSTRAINT "billing_invoice_line_billing_invoice_id_fkey" FOREIGN KEY ("billing_invoice_id") REFERENCES "billing_invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_billing_customer_id_fkey" FOREIGN KEY ("billing_customer_id") REFERENCES "billing_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transaction" ADD CONSTRAINT "payment_transaction_billing_invoice_id_fkey" FOREIGN KEY ("billing_invoice_id") REFERENCES "billing_invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_token" ADD CONSTRAINT "auth_token_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_verification" ADD CONSTRAINT "phone_verification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "two_factor_codes" ADD CONSTRAINT "two_factor_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_card" ADD CONSTRAINT "payment_card_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_accounts" ADD CONSTRAINT "payment_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_name_history" ADD CONSTRAINT "legal_name_history_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversational_name_history" ADD CONSTRAINT "conversational_name_history_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email" ADD CONSTRAINT "email_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone" ADD CONSTRAINT "phone_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_user" ADD CONSTRAINT "tenant_user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_subscription" ADD CONSTRAINT "tenant_subscription_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_schedule" ADD CONSTRAINT "pay_schedule_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pay_schedule" ADD CONSTRAINT "pay_schedule_payroll_unit_id_fkey" FOREIGN KEY ("payroll_unit_id") REFERENCES "payroll_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_unit" ADD CONSTRAINT "payroll_unit_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_unit_employee" ADD CONSTRAINT "payroll_unit_employee_payroll_unit_id_fkey" FOREIGN KEY ("payroll_unit_id") REFERENCES "payroll_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_unit_employee" ADD CONSTRAINT "payroll_unit_employee_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_mapping" ADD CONSTRAINT "gl_mapping_chart_of_account_id_fkey" FOREIGN KEY ("chart_of_account_id") REFERENCES "chart_of_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_gl_matrix" ADD CONSTRAINT "payroll_gl_matrix_payroll_unit_id_fkey" FOREIGN KEY ("payroll_unit_id") REFERENCES "payroll_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employment" ADD CONSTRAINT "employment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_assignment" ADD CONSTRAINT "job_assignment_employment_id_fkey" FOREIGN KEY ("employment_id") REFERENCES "employment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_assignment" ADD CONSTRAINT "job_assignment_earning_code_id_fkey" FOREIGN KEY ("earning_code_id") REFERENCES "earning_codes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entry" ADD CONSTRAINT "time_entry_job_assignment_id_fkey" FOREIGN KEY ("job_assignment_id") REFERENCES "job_assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run" ADD CONSTRAINT "payroll_run_payroll_unit_id_fkey" FOREIGN KEY ("payroll_unit_id") REFERENCES "payroll_unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run_employee" ADD CONSTRAINT "payroll_run_employee_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_run_employee" ADD CONSTRAINT "payroll_run_employee_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line" ADD CONSTRAINT "payroll_line_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_line" ADD CONSTRAINT "payroll_line_job_assignment_id_fkey" FOREIGN KEY ("job_assignment_id") REFERENCES "job_assignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeDetails" ADD CONSTRAINT "OvertimeDetails_payroll_line_id_fkey" FOREIGN KEY ("payroll_line_id") REFERENCES "payroll_line"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeDetails" ADD CONSTRAINT "OvertimeDetails_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "overtime_config"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overtime_config" ADD CONSTRAINT "overtime_config_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deduction" ADD CONSTRAINT "deduction_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_disbursements" ADD CONSTRAINT "payroll_disbursements_payroll_run_employee_id_fkey" FOREIGN KEY ("payroll_run_employee_id") REFERENCES "payroll_run_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_payroll_journal_id_fkey" FOREIGN KEY ("payroll_journal_id") REFERENCES "payroll_journals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remittance_to_payroll_runs" ADD CONSTRAINT "remittance_to_payroll_runs_remittance_id_fkey" FOREIGN KEY ("remittance_id") REFERENCES "remittances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_policy" ADD CONSTRAINT "vacation_policy_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_ledger" ADD CONSTRAINT "vacation_ledger_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_ledger" ADD CONSTRAINT "vacation_ledger_vac_policy_id_fkey" FOREIGN KEY ("vac_policy_id") REFERENCES "vacation_policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vacation_ledger" ADD CONSTRAINT "vacation_ledger_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_policy" ADD CONSTRAINT "holiday_policy_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_ledger" ADD CONSTRAINT "holiday_ledger_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_ledger" ADD CONSTRAINT "holiday_ledger_holiday_policy_id_fkey" FOREIGN KEY ("holiday_policy_id") REFERENCES "holiday_policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_ledger" ADD CONSTRAINT "holiday_ledger_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_run"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "severance_record" ADD CONSTRAINT "severance_record_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "severance_record" ADD CONSTRAINT "severance_record_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_run"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
