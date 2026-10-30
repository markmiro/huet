import cx from "./cx";

export default function Checkbox({
  label,
  value,
  onChange,
  className,
}: {
  label?: string;
  value?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={cx(
        "huet-text-100 hc:inline-flex hc:relative hc:cursor-default",
        className,
      )}
    >
      {/* Invisible (the reset removes its appearance) but covers the label */}
      <input
        aria-label={label}
        type="checkbox"
        checked={value}
        onChange={(event) => onChange?.(event.target.checked)}
        className="hc:absolute hc:top-0 hc:left-0 hc:w-full hc:h-full"
      />
      <span className="hc:mr-1 hc:text-[1.25em] hc:leading-none">
        {value ? "☒" : "☐"}
      </span>
      <span>{label}</span>
    </label>
  );
}
