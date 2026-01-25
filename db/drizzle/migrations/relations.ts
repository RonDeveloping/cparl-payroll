import { relations } from "drizzle-orm/relations";
import { contact, address, email, employee, bankAccount, phone, legalNameHistory, conversationalNameHistory, employment, jobAssignment, timeEntry, payrollRun, payrollRunEmployee, payrollLine, deduction, payrollDisbursement, payrollJournal, journalEntry, tenant, tenantSettings, payrollCycle, department, chartOfAccount, glMapping, remittance, remittanceToPayrollRun } from "./schema";

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
	legalNameHistories: many(legalNameHistory),
	conversationalNameHistories: many(conversationalNameHistory),
}));

export const emailRelations = relations(email, ({one}) => ({
	contact: one(contact, {
		fields: [email.contactId],
		references: [contact.id]
	}),
}));

export const bankAccountRelations = relations(bankAccount, ({one}) => ({
	employee: one(employee, {
		fields: [bankAccount.employeeId],
		references: [employee.id]
	}),
}));

export const employeeRelations = relations(employee, ({many}) => ({
	bankAccounts: many(bankAccount),
	employments: many(employment),
	payrollRunEmployees: many(payrollRunEmployee),
}));

export const phoneRelations = relations(phone, ({one}) => ({
	contact: one(contact, {
		fields: [phone.contactId],
		references: [contact.id]
	}),
}));

export const legalNameHistoryRelations = relations(legalNameHistory, ({one}) => ({
	contact: one(contact, {
		fields: [legalNameHistory.contactId],
		references: [contact.id]
	}),
}));

export const conversationalNameHistoryRelations = relations(conversationalNameHistory, ({one}) => ({
	contact: one(contact, {
		fields: [conversationalNameHistory.contactId],
		references: [contact.id]
	}),
}));

export const employmentRelations = relations(employment, ({one, many}) => ({
	employee: one(employee, {
		fields: [employment.employeeId],
		references: [employee.id]
	}),
	jobAssignments: many(jobAssignment),
}));

export const jobAssignmentRelations = relations(jobAssignment, ({one, many}) => ({
	employment: one(employment, {
		fields: [jobAssignment.employmentId],
		references: [employment.id]
	}),
	timeEntries: many(timeEntry),
	payrollLines: many(payrollLine),
}));

export const timeEntryRelations = relations(timeEntry, ({one}) => ({
	jobAssignment: one(jobAssignment, {
		fields: [timeEntry.jobAssignmentId],
		references: [jobAssignment.id]
	}),
}));

export const payrollRunEmployeeRelations = relations(payrollRunEmployee, ({one, many}) => ({
	payrollRun: one(payrollRun, {
		fields: [payrollRunEmployee.payrollRunId],
		references: [payrollRun.id]
	}),
	employee: one(employee, {
		fields: [payrollRunEmployee.employeeId],
		references: [employee.id]
	}),
	payrollLines: many(payrollLine),
	deductions: many(deduction),
	payrollDisbursements: many(payrollDisbursement),
}));

export const payrollRunRelations = relations(payrollRun, ({many}) => ({
	payrollRunEmployees: many(payrollRunEmployee),
}));

export const payrollLineRelations = relations(payrollLine, ({one}) => ({
	payrollRunEmployee: one(payrollRunEmployee, {
		fields: [payrollLine.payrollRunEmployeeId],
		references: [payrollRunEmployee.id]
	}),
	jobAssignment: one(jobAssignment, {
		fields: [payrollLine.jobAssignmentId],
		references: [jobAssignment.id]
	}),
}));

export const deductionRelations = relations(deduction, ({one}) => ({
	payrollRunEmployee: one(payrollRunEmployee, {
		fields: [deduction.payrollRunEmployeeId],
		references: [payrollRunEmployee.id]
	}),
}));

export const payrollDisbursementRelations = relations(payrollDisbursement, ({one}) => ({
	payrollRunEmployee: one(payrollRunEmployee, {
		fields: [payrollDisbursement.payrollRunEmployeeId],
		references: [payrollRunEmployee.id]
	}),
}));

export const journalEntryRelations = relations(journalEntry, ({one}) => ({
	payrollJournal: one(payrollJournal, {
		fields: [journalEntry.payrollJournalId],
		references: [payrollJournal.id]
	}),
}));

export const payrollJournalRelations = relations(payrollJournal, ({many}) => ({
	journalEntries: many(journalEntry),
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

export const remittanceToPayrollRunRelations = relations(remittanceToPayrollRun, ({one}) => ({
	remittance: one(remittance, {
		fields: [remittanceToPayrollRun.remittanceId],
		references: [remittance.id]
	}),
}));

export const remittanceRelations = relations(remittance, ({many}) => ({
	remittanceToPayrollRuns: many(remittanceToPayrollRun),
}));