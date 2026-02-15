//constants/styles.ts
import { cn } from "@/lib/utils";

export const FORM_GRID_STYLE =
  "grid grid-cols-1 md:grid-cols-2 gap-4 mt-1 px-1";

export const LABEL_STYLE =
  "text-[11px] font-bold text-slate-500 uppercase ml-1";

export const BUTTON_VARIANTS = {
  // Bold, clear, and high-priority
  primary: cn(
    "flex items-center justify-center gap-2 p-2 rounded transition-all text-white font-medium",
    "bg-blue-600 cursor-pointer hover:bg-blue-700 active:scale-[0.98]",
    "disabled:bg-slate-300 disabled:cursor-not-allowed disabled:active:scale-100 disabled:opacity-70",
  ),
  // Subtle, secondary, and less "loud"
  secondary: cn(
    "flex items-center justify-center gap-2 p-2 rounded border border-slate-300 transition-all",
    "bg-white text-slate-700 cursor-pointer hover:bg-slate-50",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ),
};

export const authStyles: AuthStyleSchema = {
  // Layout Containers
  pageWrapper:
    "flex flex-col items-center justify-center min-h-screen p-0 text-center",
  card: "max-w-md w-full bg-white p-5 rounded-xl shadow-sm border border-slate-200",
  divider: "my-8 border-slate-100",

  // Typography
  title: "text-2xl font-bold text-slate-900 mb-2",
  bodyText: "text-slate-600 mb-6",
  subText: "text-xs text-slate-500 leading-relaxed", // For your smaller "if" sentence
  // Secondary Instructions (The "Keep page open" text)
  instructionText: "text-slate-500 text-sm mb-6 leading-relaxed",

  // Interactive Elements
  buttonResend:
    "text-blue-600 font-medium hover:underline disabled:text-slate-400 disabled:no-underline flex items-center justify-center w-full gap-2",
  linkBack:
    "text-sm text-slate-400 hover:text-slate-600 transition-colors inline-block",

  // Troubleshooting Section (The "Didn't receive email?" part)
  troubleshootWrapper: "space-y-1 mb-6",
  troubleshootText: "text-sm text-slate-500",
  // Notice/Alert Boxes
  alertBox:
    "mb-6 flex items-start gap-3 p-4 text-left bg-amber-50 border border-amber-100 rounded-lg",
  alertText: "text-xs text-amber-800 leading-relaxed",
  // Small Reminder (The one you asked to make smaller)
  reminderBox:
    "mb-6 p-3 bg-slate-50 rounded-md border border-slate-100 text-left",
  reminderText: "text-[11px] text-slate-500 leading-tight italic",

  // Icon Styles
  iconCenter: "flex justify-center mb-4",
  iconWrapper: "p-3 bg-blue-50 rounded-full inline-flex mb-4",
  iconMain: "w-12 h-12 text-blue-600",
  iconAlert: "w-5 h-5 text-amber-600 shrink-0 mt-0.5",
  iconInfo: "w-4 h-4 text-slate-400 shrink-0 mt-0.5",
  iconSpinner: "w-4 h-4 animate-spin",
};

/*
Benefits of using interface:
Autocompletion: As soon as you type className={authStyles., your IDE will pop up a list of all constants.
Type Safety: If you accidentally mistype a constant name (e.g., authStyles.pageWrpper), TypeScript will throw an error, preventing runtime bugs.
Refactoring: If you want to rename buttonResend to actionButton, you can use your IDE's "Rename Symbol" feature.
*/
interface AuthStyleSchema {
  // Layout
  pageWrapper: string;
  card: string;
  iconWrapper: string;
  iconCenter: string;
  divider: string;

  // Typography
  title: string;
  bodyText: string;
  instructionText: string;
  subText: string;

  // Interactive
  buttonResend: string;
  linkBack: string;

  // Troubleshooting & Feedback
  troubleshootWrapper: string;
  troubleshootText: string;
  alertBox: string;
  alertText: string;
  reminderBox: string;
  reminderText: string;

  // Icons
  iconMain: string;
  iconAlert: string;
  iconInfo: string;
  iconSpinner: string;
}

/*
Variant	Visual Style	Common Use Case
Primary	High contrast (Solid background).	The main goal: Register, Save, Pay.
Secondary	Low contrast (Ghost/Outline/Soft background).	The alternative: Cancel, Go Back, Skip.

When you add an icon or a spinner next to your text, flex becomes the easiest way to solve three common CSS headaches:

Alignment: It perfectly centers the Spinner and the text vertically so the text doesn't look "sunk" or "raised" compared to the icon.

Spacing: The gap-2 utility only works in a flex/grid container. It creates a consistent space between the spinner and the text without needing manual margins.

Consistency: It ensures the button's total height doesn't "jump" or change when the spinner appears and disappears during submission.
*/
