// lib/mail.ts
import "server-only"; // This will crash if a Client Component imports this file
import { Resend } from "resend";

// This ensures this code NEVER runs on the client/browser
if (typeof window !== "undefined") {
  throw new Error("This file can only be imported on the server.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the verification link to the user.
 * In production, ensure 'from' is a domain you own.
 */
export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: "CPARL Notifications<noreply@verify.cparl.com>", // Replace with your verified domain
    to: email,
    subject: "Confirm your email address provided in registration",
    replyTo: "ron@cparl.com",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Verify your account</h2>
        <p>Click the button below to verify your email address and activate your account:</p>
        <a href="${confirmLink}" 
           style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: white; text-decoration: none; border-radius: 5px;">
           Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};
