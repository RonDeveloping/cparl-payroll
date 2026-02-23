// lib/name-logic.ts

import { Contact, Subject } from "@prisma/client";

export function getFriendlyName(contact: Contact) {
  // If it's a company with a DBA (Starbucks), show that.
  if (contact.subject === Subject.ORGANIZATION && contact.aliasName) {
    return contact.aliasName;
  }

  // If it's a person with a nickname (Bobby), show "Bobby Doe"
  if (contact.subject === Subject.INDIVIDUAL && contact.aliasName) {
    return `${contact.aliasName} ${contact.kindName}`;
  }

  // Fallback to full legal name
  return `${contact.coreName} ${contact.kindName}`.trim();
}
