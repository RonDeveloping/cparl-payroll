//app\contacts\[id]\edit\page.tsx
/*runs on the server, talks to db via prisma and prepares a flat object that the form can understand*/
import prisma from "@/lib/prisma";
import EditContactForm from "./EditContactForm"; // client component to handle the form state
import { ContactFormValues } from "@/lib/schemas/contact";

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  //URL is /contacts/new/edit: The server sees id === "new", skips Prisma, and sends a blank form.
  if (id === "new") {
    const emptyData: ContactFormValues = {
      givenName: "",
      familyName: "",
      nickName: "",
      displayName: "",
      email: "",
      phone: "",
      street: "",
      city: "Ottawa",
      province: "ON",
      postalCode: "",
      country: "Canada",
    };
    return <EditContactForm paramsPromise={params} initialData={emptyData} />;
  }

  // 2. Otherwise, URL this-app/app/contacts/123/edit must be self-suffient; if a user clicks the link directly from an email, his/her browser goes straight to this Edit Page and the server fetches the freshest  contact details("Single Source of Truth") from db very fast even though cache, not over the user's slow mobile data if any;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      emails: { where: { isPrimary: true }, take: 1 },
      addresses: { where: { isPrimary: true }, take: 1 },
      phones: { where: { isPrimary: true }, take: 1 },
    },
  });

  if (!contact) return <div>Contact not found</div>;

  // FLATTEN the data for the form
  const initialData = {
    givenName: contact.givenName,
    familyName: contact.familyName,
    email: contact.emails[0]?.email || "",
    street: contact.addresses[0]?.street || "",
    city: contact.addresses[0]?.city || "",
    province: "ON",
    country: "Canada",
    nickName: "",
    displayName: "",
    phone: "",
    postalCode: "",
  };

  return <EditContactForm paramsPromise={params} initialData={initialData} />;
}
