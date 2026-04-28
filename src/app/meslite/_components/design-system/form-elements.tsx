import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const fieldBaseClass =
  "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-indigo-500";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${fieldBaseClass} ${className}`.trim()} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select {...rest} className={`${fieldBaseClass} ${className}`.trim()} />;
}

export function TextAreaInput(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${fieldBaseClass} ${className}`.trim()} />;
}
