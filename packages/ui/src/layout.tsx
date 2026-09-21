import type { ComponentProps, CSSProperties, ReactNode } from "react";

export type SurfaceProps = ComponentProps<"div"> & {
  theme?: "light" | "dark";
  palette?: "ios" | "bookster";
};
/** Scope tokens and styles to a subtree. No provider or global CSS reset required. */
export function Surface({
  theme = "light",
  palette = "ios",
  className = "",
  ...props
}: SurfaceProps) {
  return (
    <div
      className={`ui-surface ${className}`}
      data-ui-theme={theme}
      data-ui-palette={palette}
      {...props}
    />
  );
}
export type StackProps = ComponentProps<"div"> & {
  gap?: 8 | 12 | 16 | 24 | 32;
  direction?: "vertical" | "horizontal";
  wrap?: boolean;
};
export function Stack({
  gap = 16,
  direction = "vertical",
  wrap = false,
  style,
  className = "",
  ...props
}: StackProps) {
  return (
    <div
      className={`ui-stack ${className}`}
      style={
        {
          "--ui-gap": `${gap}px`,
          flexDirection: direction === "vertical" ? "column" : "row",
          flexWrap: wrap ? "wrap" : "nowrap",
          ...style,
        } as CSSProperties
      }
      {...props}
    />
  );
}
export type TopBarProps = Omit<ComponentProps<"header">, "title"> & {
  title: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  subtitle?: string;
  large?: boolean;
};
export function TopBar({
  title,
  leading,
  trailing,
  subtitle,
  large = false,
  className = "",
  ...props
}: TopBarProps) {
  return (
    <header className={`ui-top-bar ${className}`} data-large={large} {...props}>
      <div className="ui-top-bar__line">
        <div className="ui-top-bar__side">{leading}</div>
        {!large && <div className="ui-top-bar__title">{title}</div>}
        <div className="ui-top-bar__side">{trailing}</div>
      </div>
      {large && <div className="ui-top-bar__large">{title}</div>}
      {subtitle && <p className="ui-top-bar__subtitle">{subtitle}</p>}
    </header>
  );
}
