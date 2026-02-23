import PaymentMethodDetails from "@/components/payments/payment-method-details";
import { getCurrentUser } from "@/lib/auth-utils";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  return (
    <div className="p-10">
      <PaymentMethodDetails
        userGivenName={user?.givenName}
        userFamilyName={user?.familyName}
        userPrimaryPostalCode={user?.primaryPostalCode}
      />
    </div>
  );
}
