import React, { useContext } from "react";
import huet from "./huet";

const { ThemeContext } = huet;

const Icon = React.memo(({ name, contrast, ramp = null, className, style }) => {
  const ctx = useContext(ThemeContext);
  const color = huet
    .relativeColor(ctx, ramp || ctx.ramps.gray, contrast)
    .toString()
    .substring(1);
  return (
    <img
      src={`https://icon.now.sh/${name}/${color}`}
      className={className}
      style={style}
    />
  );
});

export default Icon;
