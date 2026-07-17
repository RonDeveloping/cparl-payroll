// c:/cparl-payroll-app/constants/t4-boxes.ts
export type T4BoxOption = {
  value: number;
  label: string;
};

export const T4_BOX_OPTIONS: readonly T4BoxOption[] = [
  { value: 30, label: "30 - Board and lodging" },
  { value: 31, label: "31 - Special work site" },
  { value: 32, label: "32 - Travel in a prescribed zone" },
  { value: 33, label: "33 - Medical travel assistance" },
  {
    value: 34,
    label: "34 - Personal use of employer automobile or motor vehicle",
  },
  { value: 36, label: "36 - Interest-free and low-interest loans" },
  { value: 38, label: "38 - Security options benefits" },
  { value: 39, label: "39 - Security options deduction (110(1)(d))" },
  { value: 40, label: "40 - Other taxable allowances and benefits" },
  { value: 41, label: "41 - Security options deduction (110(1)(d.1))" },
  { value: 42, label: "42 - Employment commissions" },
  {
    value: 43,
    label: "43 - Canadian Armed Forces personnel and police deduction",
  },
  { value: 66, label: "66 - Eligible retiring allowance" },
  { value: 67, label: "67 - Non-eligible retiring allowance" },
  {
    value: 69,
    label: "69 - Indian Act (exempt income) - Non-eligible retiring allowances",
  },
  { value: 71, label: "71 - Indian (exempt) employment income" },
  {
    value: 74,
    label: "74 - Past service contributions (1989 or earlier, contributor)",
  },
  {
    value: 75,
    label: "75 - Past service contributions (1989 or earlier, non-contributor)",
  },
  {
    value: 77,
    label: "77 - Workers' compensation benefits repaid to employer",
  },
  {
    value: 85,
    label: "85 - Employee-paid premiums for private health services plans",
  },
  { value: 86, label: "86 - Security options election" },
  { value: 87, label: "87 - Emergency services volunteer exempt amount" },
  { value: 88, label: "88 - Indian Act (exempt income) - Self-employment" },
  { value: 90, label: "90 - Security options benefits" },
  { value: 91, label: "91 - Security options deduction (110(1)(d))" },
  { value: 92, label: "92 - Security options deduction (110(1)(d.1))" },
  { value: 94, label: "94 - Indian Act (exempt income) - RPP contributions" },
  { value: 95, label: "95 - Indian Act (exempt income) - Union dues" },
] as const;
