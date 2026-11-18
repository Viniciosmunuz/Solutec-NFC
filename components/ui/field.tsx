"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-line bg-white px-3.5 text-sm text-[#10233f] placeholder:text-[#9aa7bf] outline-none transition-all duration-150 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12 disabled:bg-[#f4f6fa] disabled:text-[#8a97b1]";

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
  htmlFor,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-[13px] font-semibold text-[#3b4a68]"
        >
          {label}
          {required ? <span className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#8a97b1]">{hint}</p>
      ) : null}
    </div>
  );
}

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  wrapperClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, hint, error, icon, className, wrapperClassName, id, ...props },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        required={props.required}
        className={wrapperClassName}
        htmlFor={inputId}
      >
        <div className="relative">
          {icon ? (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa7bf]">
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              control,
              "h-11",
              icon && "pl-10",
              error && "border-danger focus:border-danger focus:ring-danger/12",
              className,
            )}
            {...props}
          />
        </div>
      </Field>
    );
  },
);
Input.displayName = "Input";

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    label?: string;
    hint?: string;
    error?: string;
  };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className, id, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        required={props.required}
        htmlFor={fieldId}
      >
        <textarea
          ref={ref}
          id={fieldId}
          rows={props.rows ?? 3}
          className={cn(control, "resize-y py-2.5 leading-relaxed", className)}
          {...props}
        />
      </Field>
    );
  },
);
Textarea.displayName = "Textarea";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className, children, id, wrapperClassName, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id ?? autoId;
    return (
      <Field
        label={label}
        hint={hint}
        error={error}
        required={props.required}
        htmlFor={fieldId}
        className={wrapperClassName}
      >
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={cn(
              control,
              "h-11 cursor-pointer appearance-none pr-9",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#8a97b1]" />
        </div>
      </Field>
    );
  },
);
Select.displayName = "Select";

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  // Trilho 44x24, bolinha 20, folga 2 de cada lado: ligada ela anda 22px.
  // Os números ficam aqui, e não em classe utilitária, porque a posição da
  // bolinha é o que diz se a chave está ligada — não pode depender de uma
  // classe fracionária que o gerador de CSS talvez não produza.
  const TRILHO = { largura: 44, altura: 24 };
  const BOLA = 20;
  const FOLGA = 2;

  const button = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{ width: TRILHO.largura, height: TRILHO.altura }}
      className={cn(
        "relative shrink-0 rounded-full transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 disabled:opacity-50",
        checked ? "bg-brand-600" : "bg-[#d2dae8]",
      )}
    >
      <span
        className="absolute rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{
          width: BOLA,
          height: BOLA,
          top: FOLGA,
          left: FOLGA,
          transform: checked
            ? `translateX(${TRILHO.largura - BOLA - FOLGA * 2}px)`
            : "translateX(0)",
        }}
      />
    </button>
  );

  if (!label) return button;

  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#3b4a68]">{label}</p>
        {description ? (
          <p className="text-xs text-[#8a97b1]">{description}</p>
        ) : null}
      </div>
      {button}
    </div>
  );
}
