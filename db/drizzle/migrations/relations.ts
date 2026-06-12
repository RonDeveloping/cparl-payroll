import { relations } from "drizzle-orm/relations";
import { user, paymentCard, contact, address, email, phone, employment, jobAssignment, timeEntry, employee, payrollRunEmployee, payrollRun, payrollLine, deduction, tenant, tenantSettings, payrollCycle, department, chartOfAccount, glMapping, conversationalNameHistory, legalNameHistory, payrollDisbursements, payrollJournals, journalEntries, phoneVerification, twoFactorCodes, tenantUser, bankAccounts, authToken, remittances, remittanceToPayrollRuns } from "./schema";

export const paymentCardRelations = relations(paymentCard, ({one}) => ({
	user: one(user, {
		fields: [paymentCard.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	paymentCards: many(paymentCard),
	phoneVerifications: many(phoneVerification),
	twoFactorCodes: many(twoFactorCodes),
	authTokens: many(authToken),
}));

export const addressRelations = relations(address, ({one}) => ({
	contact: one(contact, {
		fields: [address.contactId],
		references: [contact.id]
	}),
}));

export const contactRelations = relations(contact, ({many}) => ({
	addresses: many(address),
	emails: many(email),
	phones: many(phone),
	conversationalNameHistories: many(conversationalNameHistory),
	legalNameHistories: many(legalNameHistory),
}));

export const emailRelations = relations(email, ({one}) => ({
	contact: one(contact, {
		fields: [email.contactId],
		references: [contact.id]
	}),
}));

export const phoneRelations = relations(phone, ({one}) => ({
	contact: one(contact, {
		fields: [phone.contactId],
		references: [contact.id]
	}),
}));

export const jobAssignmentRelations = relations(jobAssignment, ({one, many}) => ({
	employment: one(employment, {
		fields: [jobAssignment.employmentId],
		references: [employment.id]
	}),
	timeEntries: many(timeEntry),
	payrollLines: many(payrollLine),
}));

export const employmentRelations = relations(employment, ({one, many}) => ({
	jobAssignments: many(jobAssignment),
	employee: one(employee, {
		fields: [employment.employeeId],
		references: [employee.id]
	}),
}));

export const timeEntryRelations = relations(timeEntry, ({one}) => ({
	jobAssignment: one(jobAssignment, {
		fields: [timeEntry.jobAssignmentId],
		references: [jobAssignment.id]
	}),
}));

export const payrollRunEmployeeRelations = relations(payrollRunEmployee, ({one, many}) => ({
	employee: one(employee, {
		fields: [payrollRunEmployee.employeeId],
		references: [employee.id]
	}),
	payrollRun: one(payrollRun, {
		fields: [payrollRunEmployee.payrollRunId],
		references: [payrollRun.id]
	}),
	payrollLines: many(payrollLine),
	deductions: many(deduction),
	payrollDisbursements: many(payrollDisbursements),
}));

export const employeeRelations = relations(employee, ({many}) => ({
	payrollRunEmployees: many(payrollRunEmployee),
	employments: many(employment),
	bankAccounts: many(bankAccounts),
}));

export const payrollRunRelations = relations(payrollRun, ({many}) => ({
	payrollRunEmployees: many(payrollRunEmployee),
}));

export const payrollLineRelations = relations(payrollLine, ({one}) => ({
	jobAssignment: one(jobAssignment, {
		fields: [payrollLine.jobAssignmentId],
		references: [jobAssignment.id]
	}),
	payrollRunEmployee: one(payrollRunEmployee, {
		fields: [payrollLine.payrollRunEmployeeId],
		references: [payrollRunEmployee.id]
	}),
}));

export const deductionRelations = relations(deduction, ({one}) => ({
	payrollRunEmployee: one(payrollRunEmployee, {
		fields: [deduction.payrollRunEmployeeId],
		references: [payrollRunEmployee.id]
	}),
}));

export const tenantSettingsRelations = relations(tenantSettings, ({one}) => ({
	tenant: one(tenant, {
		fields: [tenantSettings.tenantId],
		references: [tenant.id]
	}),
}));

export const tenantRelations = relations(tenant, ({many}) => ({
	tenantSettings: many(tenantSettings),
	payrollCycles: many(payrollCycle),
	departments: many(department),
	tenantUsers: many(tenantUser),
}));

export const payrollCycleRelations = relations(payrollCycle, ({one}) => ({
	tenant: one(tenant, {
		fields: [payrollCycle.tenantId],
		references: [tenant.id]
	}),
}));

export const departmentRelations = relations(department, ({one}) => ({
	tenant: one(tenant, {
		fields: [department.tenantId],
		references: [tenant.id]
	}),
}));

export const glMappingRelations = relations(glMapping, ({one}) => ({
	chartOfAccount: one(chartOfAccount, {
		fields: [glMapping.chartOfAccountId],
		references: [chartOfAccount.id]
	}),
}));

export const chartOfAccountRelations = relations(chartOfAccount, ({many}) => ({
	glMappings: many(glMapping),
}));

export const conversationalNameHistoryRelations = relations(conversationalNameHistory, ({one}) => ({
	contact: one(contact, {
		fields: [conversationalNameHistory.contactId],
		references: [contact.id]
	}),
}));

export const legalNameHistoryRelations = relations(legalNameHistory, ({one}) => ({
	contact: one(contact, {
		fields: [legalNameHistory.contactId],
		references: [contact.id]
	}),
}));

export const payrollDisbursementsRelations = relations(payrollDisbursements, ({one}) => ({
	payrollRunEmployee: one(payrollRunEmployee, {
		fields: [payrollDisbursements.payrollRunEmployeeId],
		references: [payrollRunEmployee.id]
	}),
}));

export const journalEntriesRelations = relations(journalEntries, ({one}) => ({
	payrollJournal: one(payrollJournals, {
		fields: [journalEntries.payrollJournalId],
		references: [payrollJournals.id]
	}),
}));

export const payrollJournalsRelations = relations(payrollJournals, ({many}) => ({
	journalEntries: many(journalEntries),
}));

export const phoneVerificationRelations = relations(phoneVerification, ({one}) => ({
	user: one(user, {
		fields: [phoneVerification.userId],
		references: [user.id]
	}),
}));

export const twoFactorCodesRelations = relations(twoFactorCodes, ({one}) => ({
	user: one(user, {
		fields: [twoFactorCodes.userId],
		references: [user.id]
	}),
}));

export const tenantUserRelations = relations(tenantUser, ({one}) => ({
	tenant: one(tenant, {
		fields: [tenantUser.tenantId],
		references: [tenant.id]
	}),
}));

export const bankAccountsRelations = relations(bankAccounts, ({one}) => ({
	employee: one(employee, {
		fields: [bankAccounts.employeeId],
		references: [employee.id]
	}),
}));

export const authTokenRelations = relations(authToken, ({one}) => ({
	user: one(user, {
		fields: [authToken.userId],
		references: [user.id]
	}),
}));

export const remittanceToPayrollRunsRelations = relations(remittanceToPayrollRuns, ({one}) => ({
	remittance: one(remittances, {
		fields: [remittanceToPayrollRuns.remittanceId],
		references: [remittances.id]
	}),
}));

export const remittancesRelations = relations(remittances, ({many}) => ({
	remittanceToPayrollRuns: many(remittanceToPayrollRuns),
}));