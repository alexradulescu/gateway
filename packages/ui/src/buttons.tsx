import type { ComponentProps } from "react";
export type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "plain" | "danger";
  fullWidth?: boolean;
};
export function Button({
  variant = "primary",
  fullWidth = false,
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`ui-button ${className}`}
      data-variant={variant}
      data-full-width={fullWidth}
      {...props}
    />
  );
}
export type IconButtonProps = ButtonProps & { "aria-label": string };
export function IconButton({ className = "", variant = "secondary", ...props }: IconButtonProps) {
  return <Button variant={variant} className={`ui-icon-button ${className}`} {...props} />;
}
