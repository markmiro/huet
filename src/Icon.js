import React from "react";
import huet from "./huet";
import styled from "styled-components";
import { Icon as MicroIcon } from "microicon";

const Container = styled.div`
  & svg {
    display: block;
  }
`;

const Icon = ({
  name,
  contrast,
  ramp,
  className,
  style,
  size = "1em",
  alt = "icon"
}) => {
  const ctx = huet.useTheme();
  const color = ctx.contrast(contrast, { ramp });

  return (
    <Container className={className} style={style}>
      <MicroIcon name={name} size={size} color={color} />
    </Container>
  );
};
export default Icon;
