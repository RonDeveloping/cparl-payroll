import { UseFormRegister, FieldValues, Path } from "react-hook-form";

interface InputGroupProps<T extends FieldValues> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  type?: string;
}

export default function InputGroup<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder,
  type = "text",
}: InputGroupProps<T>) {
  return (
    <div className="flex flex-col space-y-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">
        {label}
      </label>
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-lg border transition-all text-sm outline-none ${
          error
            ? "border-red-500 focus:ring-2 focus:ring-red-100"
            : "border-slate-200 focus:ring-2 focus:ring-blue-500"
        }`}
      />
      {error && (
        <span className="text-[10px] text-red-500 font-medium ml-1">
          {error}
        </span>
      )}
    </div>
  );
}
