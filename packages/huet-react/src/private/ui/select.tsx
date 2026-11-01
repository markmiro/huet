import { Select as BaseSelect } from "@base-ui/react/select";
import { IconCheck, IconSelector } from "@tabler/icons-react";

import cx from "../cx";
import { itemClass, popupClass } from "./popup";
import { popupLayer, usePortalContainer } from "./portal";

/** shadcn's Select on Base UI, with a themed chevron and list. */
export function Select<T extends string>({
  label,
  value,
  onValueChange,
  options,
  describe,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly T[];
  /** Extra text after an option, such as "(default)" */
  describe?: (option: T) => string | undefined;
}) {
  const container = usePortalContainer();
  return (
    <BaseSelect.Root value={value} onValueChange={(next) => next !== null && onValueChange(next as T)}>
      <BaseSelect.Trigger
        aria-label={label}
        className="huet-border-20 hc:flex hc:items-center hc:justify-between hc:gap-[.5em] hc:w-full hc:h-[2em] hc:px-[.625em] hc:border hc:rounded-md hc:cursor-pointer hc:tint-hover"
      >
        <BaseSelect.Value />
        <BaseSelect.Icon className="hc:flex huet-text-60">
          <IconSelector size="1em" stroke={2} />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal container={container}>
        <BaseSelect.Positioner sideOffset={4} alignItemWithTrigger={false} className={popupLayer}>
          <BaseSelect.Popup
            className={cx(popupClass, "hc:p-1 hc:min-w-(--anchor-width) hc:max-h-(--available-height) hc:overflow-y-auto")}
          >
            {options.map((option) => (
              <BaseSelect.Item key={option} value={option} className={itemClass}>
                <span className="hc:flex hc:w-[1em]">
                  <BaseSelect.ItemIndicator className="hc:flex">
                    <IconCheck size="1em" stroke={2.5} />
                  </BaseSelect.ItemIndicator>
                </span>
                <BaseSelect.ItemText>{option}</BaseSelect.ItemText>
                {describe?.(option) && <span className="huet-text-50">{describe(option)}</span>}
              </BaseSelect.Item>
            ))}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
