import React from "react";
import Block from "./Block.jsx";

export default function Text({ contrast = "fg=100", ...rest }) {
  return <Block contrast={contrast} {...rest} />;
}
