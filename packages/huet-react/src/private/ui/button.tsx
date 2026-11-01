import React from "react";

import cx from "../cx";

/*
  shadcn's Button, on the panel's scoped styles. Colors are Huet classes, so
  each variant is relative to whatever surface the button sits on. Hover is a
  tint of the text color (the `tint-hover` utility in configurator.css),
  because Huet classes have no hover variants inside the panel.
*/

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "icon" | "icon-sm";

const variants: Record<ButtonVariant, string> = {
  primary: "huet-bg-100",
  secondary: "huet-bg-10",
  outline: "huet-border-20 hc:border",
  ghost: "",
};

const sizes: Record<ButtonSize, string> = {
  md: "hc:h-[2.25em] hc:px-[.875em] hc:gap-[.5em]",
  sm: "hc:h-[1.875em] hc:px-[.625em] hc:gap-[.375em]",
  icon: "hc:size-[2.25em]",
  "icon-sm": "hc:size-[1.875em]",
};

/** The classes for a button, for Base UI triggers that render their own `<button>`. */
export function buttonClass({
  variant = "secondary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cx(
    "hc:inline-flex hc:items-center hc:justify-center hc:shrink-0 hc:rounded-md hc:cursor-pointer hc:select-none hc:whitespace-nowrap hc:font-medium",
    "hc:tint-hover hc:disabled:opacity-50 hc:disabled:cursor-default",
    variants[variant],
    sizes[size],
    className,
  );
}

/** Asks first when `verify` is set: `true` for "Are you sure?", or a question. */
export function confirmed(verify: boolean | string | undefined) {
  return !verify || window.confirm(verify === true ? "Are you sure?" : verify);
}

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  verify?: boolean | string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, verify, className, onClick, type = "button", ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass({ variant, size, className })}
      onClick={(event) => {
        if (confirmed(verify)) onClick?.(event);
      }}
      {...rest}
    />
  );
});

/** A small count or label, such as how many advanced settings changed. */
export function Badge({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "huet-bg-blue-100 hc:inline-flex hc:items-center hc:justify-center hc:h-[1.5em] hc:min-w-[1.5em] hc:px-[.5em] hc:rounded-full hc:text-[.75em] hc:font-semibold hc:leading-none hc:tabular-nums",
        className,
      )}
    >
      {children}
    </span>
  );
}
