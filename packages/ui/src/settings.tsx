import { useId, type ComponentProps, type ReactNode } from "react";
export type SettingsGroupProps = ComponentProps<"section"> & { title: string; footer?: ReactNode };
export function SettingsGroup({
  title,
  footer,
  children,
  className = "",
  ...props
}: SettingsGroupProps) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={`ui-settings-group ${className}`} {...props}>
      <h3 id={id}>{title}</h3>
      <div className="ui-settings-card">{children}</div>
      {footer && <div className="ui-settings-footer">{footer}</div>}
    </section>
  );
}
export type SettingsRowProps = ComponentProps<"div"> & {
  label: string;
  description?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
};
function RowContent({
  label,
  description,
  icon,
  trailing,
}: Pick<SettingsRowProps, "label" | "description" | "icon" | "trailing">) {
  return (
    <>
      {icon && (
        <span className="ui-settings-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="ui-settings-copy">
        <span>{label}</span>
        {description && <small>{description}</small>}
      </span>
      {trailing && <span className="ui-settings-trailing">{trailing}</span>}
    </>
  );
}
/** Non-interactive row container; trailing may contain an independently labeled control. */
export function SettingsRow({
  label,
  description,
  icon,
  trailing,
  className = "",
  ...props
}: SettingsRowProps) {
  return (
    <div className={`ui-settings-row ${className}`} {...props}>
      <RowContent label={label} description={description} icon={icon} trailing={trailing} />
    </div>
  );
}
export type SettingsLinkProps = ComponentProps<"a"> & {
  label: string;
  description?: string;
  icon?: ReactNode;
  value?: string;
};
/** An anchor, so navigation stays with the consumer's router. Never nest controls here. */
export function SettingsLink({
  label,
  description,
  icon,
  value,
  className = "",
  ...props
}: SettingsLinkProps) {
  return (
    <a className={`ui-settings-row ui-settings-link ${className}`} {...props}>
      <RowContent
        label={label}
        description={description}
        icon={icon}
        trailing={
          <>
            {value && <span>{value}</span>}
            <span aria-hidden="true">›</span>
          </>
        }
      />
    </a>
  );
}
