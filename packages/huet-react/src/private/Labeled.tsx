import React from "react";

export default function Labeled({
  label,
  children,
  className,
  ...rest
}: {
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  if (!label) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    );
  }
  return (
    <label className={className} {...rest}>
      <span className="hc:mb-1 hc:cursor-default">{label}</span>
      {children}
    </label>
  );
}
