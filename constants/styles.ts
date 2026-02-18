//constants/styles.ts
import { cn } from "@/lib/utils";

export const FORM_GRID_STYLE = "grid grid-cols-1 md:grid-cols-2 px-1 gap-6";

export const LABEL_STYLE =
  "text-[11px] font-bold text-slate-500 uppercase ml-1";

export const BUTTON_VARIANTS = {
  // Bold, clear, and high-priority
  primary: cn(
    "flex items-center justify-center p-2 rounded transition-all text-white font-medium",
    "bg-blue-600 cursor-pointer hover:bg-blue-700 active:scale-[0.98]",
    "disabled:bg-slate-300 disabled:cursor-not-allowed disabled:active:scale-100 disabled:opacity-70",
    "gap-4",
  ),
  // Subtle, secondary, and less "loud"
  secondary: cn(
    "flex items-center justify-center p-2 rounded border border-slate-300 transition-all",
    "bg-white text-slate-700 cursor-pointer hover:bg-slate-50",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "gap-4",
  ),
};

const sharedStyles: Record<string, string> = {
  relative: "relative",
  // Note: gap-4 will be applied via class composition
  flexCol: "flex flex-col",
  p7: "p-7",
  maxWmdCenter: "max-w-md mx-auto",
  maxWmdFull: "max-w-md w-full",
  cardBase: "bg-white shadow-sm border border-slate-200",
  roundedXl: "rounded-xl",
  rounded2xl: "rounded-2xl",
  headingLg: "text-2xl font-bold text-slate-900",
  labelSmMediumSlate700: "text-sm font-medium text-slate-700",
  textSmSlate500: "text-sm text-slate-500",
  textBlue600: "text-blue-600",
  linkBlueUnderline: "text-blue-600 hover:underline",
  fontSemiboldSlate800: "font-semibold text-slate-800",
  fontMediumZinc: "font-medium text-zinc-950 dark:text-zinc-50",
  camelCase: "camel-case",
  iconLeftInline: "absolute left-3 top-2.5 h-5 w-5 text-slate-400",
  iconToggleRight:
    "absolute right-3 top-2.5 text-slate-400 hover:text-slate-600",
  buttonBlueBase: "bg-blue-600 text-white",
  buttonBlueHover: "hover:bg-blue-700",
  buttonBlueFlex: "transition-colors flex items-center justify-center",
  inlineFlexGap2: "inline-flex items-center",
  // Padding composites (normalized)
  px4Py2: "px-5 py-2",
  p3Box: "p-3",
  // Input specific padding
  inputPaddingLg: "pl-10 pr-12 py-2",
  // Margin composites (consolidated to key breakpoints) - MUST be before tokens that use them
  mt10: "mt-10",
  mb4: "mb-4",
  my8: "my-8",
  ml1: "ml-1",
  mr1: "mr-1",
  mxAuto: "mx-auto",
  // Gap and space composites (consolidated to key breakpoints)
  gap4: "gap-4",
  spaceY8: "space-y-8",
  spaceY1: "space-y-1",
  spaceX3: "space-x-3",
  // Text composites using margin tokens
  textSlate500Mt2: cn("text-slate-500", "mt-2"),
  // Input field composites
  inputBase:
    "w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all",
  inputWithRightPadding:
    "w-full pl-10 pr-12 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all",
  // Container composites
  pageContainerLarge: cn("max-w-5xl p-6", "space-y-6", "mx-auto"),
  pageContainerMedium: cn("max-w-3xl p-6", "mx-auto"),
  centerContainer:
    "flex flex-col items-center justify-center min-h-screen p-4 text-center",
  // Input icon composites
  lockIcon: "absolute left-3 top-2.5 text-slate-400",
  toggleIconRight: cn(
    "absolute right-3 top-[10px]",
    "text-slate-400 hover:text-slate-600",
  ),
  // Alert/Error/Info Box Composites
  errorBox: "text-red-600 bg-red-100 p-2 rounded",
  infoBox: cn("mb-6", "p-3 bg-slate-50 rounded-md border border-slate-100"),
  // Composite tokens (cross-map reusable)
  sectionCard: cn(
    "bg-white shadow-sm border border-slate-200",
    "rounded-xl",
    "p-6",
  ),
  sectionHeaderRow: cn("flex items-center justify-between", "mb-4"),
  sectionHeaderLeftBlueBase: cn("flex items-center text-blue-600", "space-x-3"),
  sectionHeaderLeftPurpleBase: cn(
    "flex items-center text-purple-600",
    "space-x-3",
    "mb-4",
  ),
  sectionHeaderLeftOrangeBase: cn(
    "flex items-center text-orange-600",
    "space-x-3",
    "mb-4",
  ),
  badgeBlueSmall: cn(
    "flex items-center rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5",
    "gap-4",
  ),
  badgeLabel: "text-[10px] font-bold uppercase text-blue-700 tracking-tight",
};

export const authStyles: AuthStyleSchema = {
  // Layout Containers
  pageWrapper:
    "flex flex-col items-center justify-center min-h-screen p-0 text-center",
  card: cn(
    sharedStyles.maxWmdFull,
    sharedStyles.cardBase,
    sharedStyles.roundedXl,
    sharedStyles.p7,
  ),
  divider: cn("my-8", "border-slate-100"),

  // Typography
  title: cn("text-2xl font-bold text-slate-900", "mb-2"),
  bodyText: cn("text-slate-600", "mb-6"),
  subText: "text-xs text-slate-500 leading-relaxed", // For your smaller "if" sentence
  // Secondary Instructions (The "Keep page open" text)
  instructionText: cn(
    "text-slate-500 text-sm leading-relaxed",
    sharedStyles.mb6,
  ),

  // Interactive Elements
  buttonResend: cn(
    "text-blue-600 font-medium hover:underline disabled:text-slate-400 disabled:no-underline flex items-center justify-center w-full",
    sharedStyles.gap4,
  ),
  linkBack:
    "text-sm text-slate-400 hover:text-slate-600 transition-colors inline-block",

  // Troubleshooting Section (The "Didn't receive email?" part)
  troubleshootWrapper: cn(sharedStyles.spaceY5, "mb-6"),
  troubleshootText: "text-sm text-slate-500",
  // Notice/Alert Boxes
  alertBox: cn(
    "flex items-start text-left bg-amber-50 border border-amber-100 rounded-lg px-4 py-0",
    sharedStyles.gap4,
    "mb-6",
  ),
  alertText: "text-xs text-amber-800 leading-relaxed",
  // Small Reminder (The one you asked to make smaller)
  reminderBox: "mb-6 p-3 bg-slate-50 rounded-md border border-slate-100",
  reminderText: "text-[11px] text-slate-500 leading-tight italic",

  // Icon Styles
  iconCenter: cn("flex justify-center", sharedStyles.mb4),
  iconWrapper: cn(
    sharedStyles.p3Box,
    "bg-blue-50 rounded-full inline-flex",
    sharedStyles.mb4,
  ),
  iconMain: "w-12 h-12 text-blue-600",
  iconAlert: "w-5 h-5 text-amber-600 shrink-0 mt-0.5",
  iconInfo: "w-4 h-4 text-slate-400 shrink-0 mt-0.5",
  iconSpinner: "w-4 h-4 animate-spin",

  // Email Verification States
  emailVerificationContainer: sharedStyles.centerContainer,
  missingTokenContainer:
    "flex flex-col items-center justify-center min-h-screen",
  missingTokenTitle: "text-xl font-bold text-red-600",
  errorCard: "bg-red-50 p-8 rounded-lg border border-red-200 shadow-sm",
  errorTitle: cn("text-2xl font-bold text-red-700", sharedStyles.mb4),
  errorMessage: cn("text-red-600", sharedStyles.mb4),
  errorLink: sharedStyles.linkBlueUnderline,
  successCard: "bg-green-50 p-8 rounded-lg border border-green-200 shadow-sm",
  successTitle: cn("text-2xl font-bold text-green-700", sharedStyles.mb4),
  successMessage: cn("text-green-600", sharedStyles.mb4),
  successButton: cn(
    "bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors",
    sharedStyles.px4Py2,
  ),

  // Forgot Password Page
  forgotPasswordCard: cn(
    sharedStyles.maxWmdCenter,
    sharedStyles.mt10,
    sharedStyles.p7,
    sharedStyles.cardBase,
    sharedStyles.rounded2xl,
  ),
  forgotPasswordCardCenter: cn(
    sharedStyles.maxWmdCenter,
    sharedStyles.mt10,
    sharedStyles.p7,
    sharedStyles.cardBase,
    sharedStyles.rounded2xl,
    "text-center",
  ),
  forgotPasswordTitle: sharedStyles.headingLg,
  forgotPasswordDescription: cn(sharedStyles.textSlate500Mt2, sharedStyles.mb4),
  forgotPasswordText: sharedStyles.textSlate500Mt2,
  forgotPasswordForm: sharedStyles.spaceY4,
  forgotPasswordLabel: cn(
    sharedStyles.labelSmMediumSlate700,
    "block",
    sharedStyles.mb4,
  ),
  forgotPasswordInput: cn(
    "w-full border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all",
    sharedStyles.px4Py2,
  ),
  forgotPasswordButton: cn(
    "w-full font-medium py-2 rounded-lg disabled:opacity-70",
    sharedStyles.buttonBlueBase,
    sharedStyles.buttonBlueHover,
    sharedStyles.buttonBlueFlex,
    sharedStyles.gap4,
  ),
  forgotPasswordIcon: cn(
    "w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto",
    sharedStyles.mb4,
  ),
  forgotPasswordBackLink: cn(
    "text-sm font-medium",
    sharedStyles.mt10,
    sharedStyles.inlineFlexGap2,
    sharedStyles.gap4,
    sharedStyles.linkBlueUnderline,
  ),
  forgotPasswordFooter: cn("text-center", sharedStyles.mt10),
  forgotPasswordFooterLink: cn(
    sharedStyles.textSmSlate500,
    "hover:text-blue-600",
  ),

  // Login Page
  loginCard: cn(
    "w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100",
    sharedStyles.spaceY5,
  ),
  loginHeader: "text-center",
  loginTitle: sharedStyles.headingLg,
  loginSubtitle: cn(sharedStyles.textSmSlate500, sharedStyles.mt10),
  loginBanner: cn(
    "bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm",
    sharedStyles.px4Py2,
  ),
  loginForm: sharedStyles.spaceY8,
  loginFieldGroup: sharedStyles.spaceY1,
  loginFieldLabel: sharedStyles.labelSmMediumSlate700,
  loginInputWrapper: sharedStyles.relative,
  loginEmailIcon: sharedStyles.iconLeftInline,
  loginInput: sharedStyles.inputBase,
  loginPasswordHeader: "flex justify-between items-center",
  loginForgotLink: cn("text-xs", sharedStyles.linkBlueUnderline),
  loginPasswordIcon: sharedStyles.iconLeftInline,
  loginPasswordInput: sharedStyles.inputWithRightPadding,
  loginPasswordToggle: sharedStyles.iconToggleRight,
  loginButton: cn(
    "w-full font-semibold py-2 rounded-md",
    sharedStyles.buttonBlueBase,
    sharedStyles.buttonBlueHover,
    sharedStyles.buttonBlueFlex,
    sharedStyles.gap4,
  ),
  loginFooter: cn("text-center", sharedStyles.textSmSlate500),
  loginCreateLink: cn(sharedStyles.linkBlueUnderline, "font-medium"),

  // Register Page
  registerCard: cn(
    sharedStyles.maxWmdCenter,
    sharedStyles.mt10,
    sharedStyles.p7,
    "shadow-lg border",
    sharedStyles.roundedXl,
  ),
  registerTitle: cn("text-2xl font-bold", sharedStyles.mb4),
  registerDescription: cn("text-gray-600", sharedStyles.mb4),
  registerFooter: cn("text-sm text-center", sharedStyles.mt10),
  registerLoginLink: sharedStyles.textBlue600,

  // Resend Verification Page
  resendContainer: sharedStyles.centerContainer,
  resendForm: cn(
    "max-w-sm w-full bg-white p-6 rounded-lg shadow-md border",
    sharedStyles.spaceY4,
  ),
  resendTitle: "text-xl font-bold",
  resendDescription: "text-sm text-gray-600",
  resendInput: "w-full p-2 border rounded",
  resendButton: cn(
    "w-full py-2 rounded disabled:bg-blue-300",
    sharedStyles.buttonBlueBase,
  ),

  // Reset Password Page
  resetInvalidContainer: cn(
    sharedStyles.maxWmdCenter,
    sharedStyles.mt10,
    "text-center",
    sharedStyles.p7,
    "bg-red-50 border border-red-100",
    sharedStyles.roundedXl,
  ),
  resetInvalidMessage: "text-red-600 font-medium",
  resetCard: cn(
    sharedStyles.maxWmdCenter,
    sharedStyles.mt10,
    sharedStyles.p7,
    sharedStyles.cardBase,
    sharedStyles.rounded2xl,
  ),
  resetHeader: cn(
    "flex items-center text-blue-600",
    sharedStyles.gap4,
    sharedStyles.mb4,
  ),
  resetTitle: sharedStyles.headingLg,
  resetEmailBox: cn(
    "flex items-center bg-slate-50 border border-slate-100 rounded-lg",
    sharedStyles.gap4,
    sharedStyles.p3Box,
    sharedStyles.mb4,
  ),
  resetEmailIcon: sharedStyles.textSmSlate500,
  resetEmailText: sharedStyles.textSmSlate500,
  resetEmailSpan: "font-semibold text-slate-900",
  resetForm: sharedStyles.spaceY4,

  // Suspense Fallback Styles
  loadingContainer: "flex items-center justify-center min-h-screen",
};

export const contactProfileStyles: ContactProfileStyleSchema = {
  pageContainer: sharedStyles.pageContainerLarge,
  headerCard: cn(
    "flex items-center",
    sharedStyles.cardBase,
    sharedStyles.roundedXl,
    sharedStyles.p7,
    sharedStyles.spaceX3,
  ),
  avatar: "w-24 h-24 rounded-full border-4 border-blue-50",
  nameTitle: sharedStyles.headingLg,
  subtleText: "text-slate-500",
  infoList: "space-y-0",
  editButton: cn(
    "flex items-center justify-center gap-1.5 bg-transparent hover:bg-green-50 text-slate-600 rounded-md text-sm font-medium transition-all border border-transparent hover:border-green-100",
    sharedStyles.px4Py2,
  ),
  editIcon: "text-green-600",
  sectionCard: sharedStyles.sectionCard,
  sectionHeaderRow: sharedStyles.sectionHeaderRow,
  sectionHeaderLeftBlue: sharedStyles.sectionHeaderLeftBlueBase,
  sectionHeaderLeftPurple: sharedStyles.sectionHeaderLeftPurpleBase,
  sectionHeaderLeftOrange: sharedStyles.sectionHeaderLeftOrangeBase,
  sectionTitle: sharedStyles.fontSemiboldSlate800,
  sectionContent: sharedStyles.spaceY4,
  columnStack: sharedStyles.flexCol,
  accessRow: "flex items-center gap-2 border-b border-slate-100 pb-1",
  metaLabel: "text-xs text-slate-400 uppercase tracking-wider",
  accessIcon: "inline-flex items-center text-purple-600",
  badgeRow: cn("flex items-center gap-3", sharedStyles.mt10),
  badge: sharedStyles.badgeBlueSmall,
  badgeTitle: sharedStyles.fontSemiboldSlate800,
  badgeIcon: sharedStyles.textBlue600,
  badgeText: sharedStyles.badgeLabel,
  detailGrid: "grid grid-cols-1 md:grid-cols-2 gap-6",
  payrollLinkButton: cn(
    "w-full text-sm text-left",
    sharedStyles.mt10,
    sharedStyles.linkBlueUnderline,
  ),
  notFoundContainer: cn("max-w-5xl p-12 text-center", sharedStyles.mxAuto),
  notFoundTitle: "text-2xl font-bold text-slate-800",
  notFoundText: cn(sharedStyles.textSmSlate500, sharedStyles.mb4),
  notFoundLink: sharedStyles.linkBlueUnderline,
  infoItem: sharedStyles.flexCol,
  infoValueRow: "flex items-center space-x-2 text-slate-700 font-medium",
  infoIcon: sharedStyles.textSmSlate500,
};

export const dashboardStyles: DashboardStyleSchema = {
  pageContainer: cn("max-w-4xl", sharedStyles.spaceY6, sharedStyles.mxAuto),
  heroCard: cn(sharedStyles.cardBase, sharedStyles.rounded2xl, sharedStyles.p7),
  heroTitle: sharedStyles.headingLg,
  heroSubtitle: sharedStyles.textSlate500Mt2,
  heroStatus: "text-green-600 font-medium",
  statsGrid: cn("grid grid-cols-1 md:grid-cols-3", sharedStyles.gap4),
  statCard: cn("bg-blue-50 rounded-xl border border-blue-100", sharedStyles.p7),
  statLabel: "text-xs font-semibold text-blue-600 uppercase tracking-wider",
  statValue: "text-slate-700 font-medium",
};

export const homeStyles: HomeStyleSchema = {
  page: "flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black",
  main: "flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start",
  hero: "flex flex-col items-center gap-6 text-center sm:items-start sm:text-left",
  heroTitle:
    "max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50",
  heroText: "max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400",
  heroLink: sharedStyles.fontMediumZinc,
  footer: cn(
    "flex w-full items-center flex-col text-base font-medium sm:flex-row",
    sharedStyles.gap4,
  ),
  footerLink: sharedStyles.fontMediumZinc,
  footerLinkContent: "flex items-center gap-2 font-medium whitespace-nowrap",
  footerLinkContentAlt:
    "flex items-center gap-2 font-medium text-zinc-950 dark:text-zinc-50 whitespace-nowrap",
  footerCopyright:
    "ml-auto flex items-center text-[13px] leading-none text-zinc-500 dark:text-zinc-400 whitespace-nowrap",
};

export const formActionsStyles: FormActionsStyleSchema = {
  container: "flex justify-between items-center w-full",
  saveButtonBase: cn(
    "flex items-center border rounded-lg font-semibold transition-all",
    "px-8 py-2",
    sharedStyles.gap4,
  ),
  saveActive:
    "bg-slate-50 text-emerald-600 border-slate-200 hover:bg-white hover:border-emerald-200 shadow-sm active:scale-95",
  saveLocked:
    "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-70",
  backActionWrapper: "flex items-center group cursor-pointer",
  backArrow: cn("text-slate-400 group-hover:text-slate-700", sharedStyles.mr1),
  backLabelBase: cn("text-sm font-medium", "transition-all duration-300"),
  backLabelActive: "text-slate-500 hover:text-slate-800 cursor-pointer",
  backLabelDisabled: "text-slate-100 select-none",
  showChangesButton: cn(
    "flex items-center text-xs font-semibold tracking-wider text-slate-500 hover:text-slate-800 transition-colors",
    sharedStyles.gap4,
  ),
  showChangesIcon: sharedStyles.textSmSlate500,
  showChangesCount: sharedStyles.camelCase,
};

export const registerFormStyles: RegisterFormStyleSchema = {
  form: "flex flex-col gap-4",
  errorBox: sharedStyles.errorBox,
  termsRow: cn("flex items-start", sharedStyles.gap4),
  termsCheckbox: "mt-1",
  termsLabel: "text-sm",
  termsLink: "underline",
  termsError: "text-red-500 text-sm",
  submitButton: cn(BUTTON_VARIANTS.primary, sharedStyles.relative),
  submitSpinner: "absolute left-3 top-1/2 -translate-y-1/2",
  submitTextHidden: "opacity-0",
};

export const formLayoutStyles: FormLayoutStyleSchema = {
  container: sharedStyles.pageContainerMedium,
  actionsWrapper: sharedStyles.mb4,
};

export const formSectionStyles: FormSectionStyleSchema = {
  section: sharedStyles.sectionCard,
  title: cn(
    "text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b",
    sharedStyles.mb4,
  ),
};

export const inputGroupStyles: InputGroupStyleSchema = {
  wrapper: cn(sharedStyles.flexCol, sharedStyles.spaceY5),
  inputBase: cn(
    "w-full rounded-lg border transition-all text-sm outline-none",
    sharedStyles.px4Py2,
  ),
  inputError: "border-red-500 focus:ring-2 focus:ring-red-100",
  inputDefault: "border-slate-200 focus:ring-2 focus:ring-blue-500",
  errorText: cn("text-[10px] text-red-500 font-medium", sharedStyles.ml1),
};

export const inputWithChangesStyles: InputWithChangesStyleSchema = {
  wrapper: sharedStyles.spaceY5,
  headerRow: "flex items-baseline justify-between",
  changeText: "text-xs text-red-500 line-through text-right",
  inputWrapper: sharedStyles.relative,
  toggleButton: sharedStyles.toggleIconRight,
  changeCount: sharedStyles.camelCase,
};

export const passwordInputStyles: PasswordInputStyleSchema = {
  wrapper: cn(sharedStyles.spaceY5, "w-full"),
  label: cn(sharedStyles.labelSmMediumSlate700, "block"),
  inputWrapper: sharedStyles.relative,
  lockIcon: sharedStyles.lockIcon,
  inputBase: cn(
    "w-full border rounded-lg outline-none transition-all",
    sharedStyles.inputPaddingLg,
  ),
  inputError: "border-red-500 focus:ring-red-200",
  inputDefault: "border-slate-300 focus:ring-blue-500 focus:ring-2",
  toggleButton: sharedStyles.iconToggleRight,
  errorText: "text-xs text-red-500",
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

  // Email Verification States
  emailVerificationContainer: string;
  missingTokenContainer: string;
  missingTokenTitle: string;
  errorCard: string;
  errorTitle: string;
  errorMessage: string;
  errorLink: string;
  successCard: string;
  successTitle: string;
  successMessage: string;
  successButton: string;

  // Forgot Password Page
  forgotPasswordCard: string;
  forgotPasswordCardCenter: string;
  forgotPasswordTitle: string;
  forgotPasswordDescription: string;
  forgotPasswordText: string;
  forgotPasswordForm: string;
  forgotPasswordLabel: string;
  forgotPasswordInput: string;
  forgotPasswordButton: string;
  forgotPasswordIcon: string;
  forgotPasswordBackLink: string;
  forgotPasswordFooter: string;
  forgotPasswordFooterLink: string;

  // Login Page
  loginCard: string;
  loginHeader: string;
  loginTitle: string;
  loginSubtitle: string;
  loginBanner: string;
  loginForm: string;
  loginFieldGroup: string;
  loginFieldLabel: string;
  loginInputWrapper: string;
  loginEmailIcon: string;
  loginInput: string;
  loginPasswordHeader: string;
  loginForgotLink: string;
  loginPasswordIcon: string;
  loginPasswordInput: string;
  loginPasswordToggle: string;
  loginButton: string;
  loginFooter: string;
  loginCreateLink: string;

  // Register Page
  registerCard: string;
  registerTitle: string;
  registerDescription: string;
  registerFooter: string;
  registerLoginLink: string;

  // Resend Verification Page
  resendContainer: string;
  resendForm: string;
  resendTitle: string;
  resendDescription: string;
  resendInput: string;
  resendButton: string;

  // Reset Password Page
  resetInvalidContainer: string;
  resetInvalidMessage: string;
  resetCard: string;
  resetHeader: string;
  resetTitle: string;
  resetEmailBox: string;
  resetEmailIcon: string;
  resetEmailText: string;
  resetEmailSpan: string;
  resetForm: string;

  // Suspense Fallback Styles
  loadingContainer: string;
}

interface ContactProfileStyleSchema {
  pageContainer: string;
  headerCard: string;
  avatar: string;
  nameTitle: string;
  subtleText: string;
  infoList: string;
  editButton: string;
  editIcon: string;
  sectionCard: string;
  sectionHeaderRow: string;
  sectionHeaderLeftBlue: string;
  sectionHeaderLeftPurple: string;
  sectionHeaderLeftOrange: string;
  sectionTitle: string;
  sectionContent: string;
  columnStack: string;
  accessRow: string;
  metaLabel: string;
  accessIcon: string;
  badgeRow: string;
  badge: string;
  badgeTitle: string;
  badgeIcon: string;
  badgeText: string;
  detailGrid: string;
  payrollLinkButton: string;
  notFoundContainer: string;
  notFoundTitle: string;
  notFoundText: string;
  notFoundLink: string;
  infoItem: string;
  infoValueRow: string;
  infoIcon: string;
}

interface DashboardStyleSchema {
  pageContainer: string;
  heroCard: string;
  heroTitle: string;
  heroSubtitle: string;
  heroStatus: string;
  statsGrid: string;
  statCard: string;
  statLabel: string;
  statValue: string;
}

interface HomeStyleSchema {
  page: string;
  main: string;
  hero: string;
  heroTitle: string;
  heroText: string;
  heroLink: string;
  footer: string;
  footerLink: string;
  footerLinkContent: string;
  footerLinkContentAlt: string;
  footerCopyright: string;
}

interface RegisterFormStyleSchema {
  form: string;
  errorBox: string;
  termsRow: string;
  termsCheckbox: string;
  termsLabel: string;
  termsLink: string;
  termsError: string;
  submitButton: string;
  submitSpinner: string;
  submitTextHidden: string;
}

interface FormActionsStyleSchema {
  container: string;
  saveButtonBase: string;
  saveActive: string;
  saveLocked: string;
  backActionWrapper: string;
  backArrow: string;
  backLabelBase: string;
  backLabelActive: string;
  backLabelDisabled: string;
  showChangesButton: string;
  showChangesIcon: string;
  showChangesCount: string;
}

interface FormLayoutStyleSchema {
  container: string;
  actionsWrapper: string;
}

interface FormSectionStyleSchema {
  section: string;
  title: string;
}

interface InputGroupStyleSchema {
  wrapper: string;
  inputBase: string;
  inputError: string;
  inputDefault: string;
  errorText: string;
}

interface InputWithChangesStyleSchema {
  wrapper: string;
  headerRow: string;
  changeText: string;
  inputWrapper: string;
  toggleButton: string;
  changeCount: string;
}

interface PasswordInputStyleSchema {
  wrapper: string;
  label: string;
  inputWrapper: string;
  lockIcon: string;
  inputBase: string;
  inputError: string;
  inputDefault: string;
  toggleButton: string;
  errorText: string;
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
