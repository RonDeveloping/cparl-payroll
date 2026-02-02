import {cn} from "@/lib/utils";

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
/*
Variant	Visual Style	Common Use Case
Primary	High contrast (Solid background).	The main goal: Register, Save, Pay.
Secondary	Low contrast (Ghost/Outline/Soft background).	The alternative: Cancel, Go Back, Skip.

When you add an icon or a spinner next to your text, flex becomes the easiest way to solve three common CSS headaches:

Alignment: It perfectly centers the Spinner and the text vertically so the text doesn't look "sunk" or "raised" compared to the icon.

Spacing: The gap-2 utility only works in a flex/grid container. It creates a consistent space between the spinner and the text without needing manual margins.

Consistency: It ensures the button's total height doesn't "jump" or change when the spinner appears and disappears during submission.
*/
