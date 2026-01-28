// components/PostalCodeInput.tsx
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  ContactFormInput,
} from "@/lib/validations/contact-schema";

export default function PostalCodeForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur", // <-- validate on blur instead of on change
  });

  const onSubmit = (data: ContactFormInput) => {
    console.log("Form submitted:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="postalCode"
        control={control}
        render={({ field }) => (
          <div>
            <label htmlFor="postalCode">Postal Code</label>
            <input {...field} id="postalCode" placeholder="K1A 0B1" />
            {errors.postalCode && (
              <p style={{ color: "red" }}>{errors.postalCode.message}</p>
            )}
          </div>
        )}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
