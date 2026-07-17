"use client";
// components/smart-edit-link.tsx

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

interface SmartEditLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function SmartEditLink({
  href,
  children,
  className,
}: SmartEditLinkProps) {
  const searchParams = useSearchParams();

  // Append fromList=true and preserve existing filters/pagination
  // while correctly handling href values that already contain query params.
  const [basePath, hrefQuery = ""] = href.split("?");
  const mergedParams = new URLSearchParams(searchParams.toString());
  const hrefParams = new URLSearchParams(hrefQuery);

  hrefParams.forEach((value, key) => {
    mergedParams.set(key, value);
  });
  mergedParams.set("fromList", "true");

  const query = mergedParams.toString();
  const smartHref = query ? `${basePath}?${query}` : basePath;

  return (
    <Link href={smartHref} className={className}>
      {children}
    </Link>
  );
}
/*
Where to put the SmartEditLink
You place this in your List/Table view where you display all your contacts. This ensures that when the user clicks "Edit," the URL is tagged with ?fromList=true.
// app/contacts/page.tsx (or your Table component)
import { SmartEditLink } from "@/components/ui/SmartEditLink";

for example:
export default function ContactsTable({ contacts }) {
  return (
    <table>
      {contacts.map(contact => (
        <tr key={contact.id}>
          <td>{contact.displayName}</td>
          <td>
            /* THIS is where the SmartEditLink goes */
// <SmartEditLink href={`/contacts/${contact.id}/edit`}>
// Edit
// </SmartEditLink>
//       </td>
//     </tr>
//   ))}
// </table>
//   );
// }
