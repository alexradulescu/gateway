import { useId, type ComponentProps, type ReactNode } from "react";

type FieldDecoration = { label: string; hint?: string; error?: string };
export type TextFieldProps = ComponentProps<"input"> & FieldDecoration;
export function TextField({
  label,
  hint,
  error,
  id,
  className = "",
  "aria-describedby": describedBy,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const description =
    [describedBy, error || hint ? `${inputId}-description` : null].filter(Boolean).join(" ") ||
    undefined;
  return (
    <div className="ui-field">
      <label htmlFor={inputId}>{label}</label>
      <input
        className={`ui-input ${className}`}
        id={inputId}
        {...props}
        aria-invalid={error ? true : props["aria-invalid"]}
        aria-describedby={description}
      />
      {(error || hint) && (
        <p id={`${inputId}-description`} className={error ? "ui-field__error" : "ui-field__hint"}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
export type SearchFieldProps = Omit<TextFieldProps, "type">;
export function SearchField(props: SearchFieldProps) {
  return <TextField {...props} type="search" className={`ui-search ${props.className ?? ""}`} />;
}
export type SelectFieldProps = ComponentProps<"select"> & {
  label: string;
  hint?: string;
  children: ReactNode;
};
export function SelectField({
  label,
  hint,
  id,
  className = "",
  children,
  "aria-describedby": describedBy,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <div className="ui-field">
      <label htmlFor={inputId}>{label}</label>
      <select
        id={inputId}
        className={`ui-input ${className}`}
        aria-describedby={
          [describedBy, hint ? `${inputId}-hint` : null].filter(Boolean).join(" ") || undefined
        }
        {...props}
      >
        {children}
      </select>
      {hint && (
        <p className="ui-field__hint" id={`${inputId}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
}
export type SwitchProps = Omit<
  ComponentProps<"input">,
  "type" | "role" | "size" | "defaultChecked"
> & {
  label: string;
  checked: boolean;
};
export function Switch({ label, className = "", ...props }: SwitchProps) {
  return (
    <label className={`ui-switch ${className}`}>
      <input
        type="checkbox"
        role="switch"
        aria-checked={props.checked}
        aria-label={label}
        {...props}
      />
      <span aria-hidden="true" />
    </label>
  );
}
