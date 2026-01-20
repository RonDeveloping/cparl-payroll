// utils\formRegister.ts
import { FieldValues, UseFormRegister, Path } from "react-hook-form";

export function registerWithOnBlurFormat<T extends FieldValues>(
  register: UseFormRegister<T>,
  formatters: Partial<Record<Path<T>, (value: string) => string>>,
): UseFormRegister<T> {
  return ((name, options) =>
    register(name, {
      ...(options ?? {}),
      onBlur: (e) => {
        const formatter = formatters[name];
        if (formatter) {
          e.target.value = formatter(e.target.value);
        }
        options?.onBlur?.(e);
      },
    })) as UseFormRegister<T>;
}
