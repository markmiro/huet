import React from "react";
import huet from "./huet";

const Icon = React.memo(
  ({ name, contrast, ramp, className, style, alt = "icon" }) => {
    const ctx = huet.useTheme();
    const color = ctx
      .contrast(contrast, { ramp })
      .toString()
      .substring(1);

    return (
      <img
        src={`https://icon.now.sh/${name}/${color}`}
        className={className}
        style={style}
        alt={alt}
      />
    );
  }
);

export default Icon;
