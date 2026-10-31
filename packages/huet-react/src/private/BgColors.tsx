import type { Theme } from "huet";
import { resolveTheme } from "huet/internal";
import { HSpace } from "./AllExceptFirst";
import Arrow from "./Arrow";
import Button from "./Button";

const positions = [0, 0.25, 0.75, 1];

/**
 * Background positions to pick from, each previewed in the edited theme. Its
 * colors come from that theme, not the panel's, so they're set inline.
 */
export default function BgColors({
  theme,
  background,
  onChange,
}: {
  theme: Theme;
  background: number;
  onChange: (background: number) => void;
}) {
  return (
    <HSpace growEach size={2}>
      {positions.map((position) => {
        const { root, step } = resolveTheme(theme, { background: position });
        const isSelected = position === background;
        return (
          <Button
            key={position}
            colors=""
            aria-pressed={isSelected}
            className="hc:relative hc:h-8"
            style={{
              backgroundColor: root.hex,
              borderColor: step(root, isSelected ? 100 : 10).hex,
              color: step(root, 80).hex,
            }}
            onClick={() => onChange(position)}
          >
            {position * 100}%
            {isSelected && (
              <Arrow
                size=".5em"
                className="hc:absolute hc:bottom-0 hc:left-1/2 hc:-translate-x-1/2 hc:translate-y-px"
                style={{ color: step(root, 100).hex }}
              />
            )}
          </Button>
        );
      })}
    </HSpace>
  );
}
