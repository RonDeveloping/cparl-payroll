//how to send email in nextjs 13 app router with resend and upstash redis for email verification and password reset tokens

// lib/mail.ts
import "server-only"; // This will crash if a Client Component imports this file
import { Resend } from "resend";
import { ROUTES } from "@/constants/routes";
import { mailContent } from "@/constants/content";
import { emailStyles as s } from "@/constants/email-styles";

// This ensures this code NEVER runs on the client/browser
if (typeof window !== "undefined") {
  throw new Error("This file can only be imported on the server.");
}

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the verification link to the user.
 * In production, ensure 'from' is a domain you own.
 */
export const sendVerificationEmail = async (
  email: string,
  token: string,
  createdAt: Date = new Date(),
) => {
  const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.AUTH.EMAIL_VERIFIED}?token=${token}`;
  const formattedTime = createdAt.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  const expiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  const formattedExpiry = expiresAt.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });

  await resend.emails.send({
    from: mailContent.verification.from, // Replace with your verified domain
    to: email,
    subject: mailContent.verification.subject1,
    replyTo: mailContent.verification.replyTo,
    html: `
      <div style="${s.container}">
        <h2 style="${s.heading}">Verify your account</h2>
        <p style="${s.text}">Click the button below to verify your email address and activate your account:</p>
        <div style="${s.buttonRow}">
          <div style="${s.buttonCell}">
            <a href="${confirmLink}" style="${s.button}">
               ${mailContent.verification.buttonText}
            </a>
          </div>
          <div style="${s.timestampCell}">
            <span style="${s.timestamp}">Link created: ${formattedTime}</span>
            <span style="${s.timestamp}">Link expires: ${formattedExpiry}</span>
          </div>
        </div>
        <hr />
        <p style="${s.footer}">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

export async function sendResetEmail(email: string, token: string) {
  const createdAt = new Date();
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}${ROUTES.AUTH.RESET_PASSWORD}?token=${token}&email=${encodeURIComponent(email)}`;

  const expiresAt = new Date(createdAt.getTime() + 60 * 60 * 1000); // 1 hour
  const formattedExpiry = expiresAt.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  await resend.emails.send({
    from: mailContent.verification.from,
    to: email,
    subject: mailContent.verification.subject2,
    html: `
      <div style="${s.container}">
        <h2 style="${s.heading}">Reset your password</h2>
        <p style="${s.text}">Click the link below to reset your password:</p>
        <a href="${resetLink}" style="${s.button}">Reset Password</a>
        <p style="${s.expiry}">Link expires: ${formattedExpiry}</p>
        <hr />
        <p style="${s.footer}">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}
