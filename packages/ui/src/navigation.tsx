import { useId, type ComponentProps, type ReactNode } from "react";

export type TabBarProps = ComponentProps<"nav">;
export function TabBar({
  className = "",
  "aria-label": label = "Main navigation",
  ...props
}: TabBarProps) {
  return <nav aria-label={label} className={`ui-tab-bar ${className}`} {...props} />;
}
export type TabBarItemProps = ComponentProps<"a"> & { icon: ReactNode; active?: boolean };
export function TabBarItem({
  icon,
  active = false,
  children,
  className = "",
  ...props
}: TabBarItemProps) {
  return (
    <a className={`ui-tab-item ${className}`} aria-current={active ? "page" : undefined} {...props}>
      <span aria-hidden="true">{icon}</span>
      <span>{children}</span>
    </a>
  );
}
export type SegmentedControlProps = {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string; disabled?: boolean }[];
  disabled?: boolean;
};
/** Native radio keyboard behavior: Tab enters the group, arrow keys change selection. */
export function SegmentedControl({
  label,
  value,
  onValueChange,
  options,
  disabled,
}: SegmentedControlProps) {
  const name = useId();
  return (
    <fieldset className="ui-segments" disabled={disabled}>
      <legend className="ui-sr-only">{label}</legend>
      {options.map((option) => (
        <label className="ui-segment" key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={option.disabled}
            onChange={() => onValueChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
export type FilterChipProps = ComponentProps<"button"> & { selected?: boolean };
export function FilterChip({
  selected = false,
  className = "",
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`ui-filter-chip ${className}`}
      {...props}
    />
  );
}
