import React, { useContext } from "react";
import { default as styled } from "styled-components/dist/styled-components.cjs";
import { default as MicroIcon } from "microicon/lib/Icon";
import { BackgroundContext } from "./reactContexts";

const Container = styled.div`
  & svg {
    display: block;
  }
`;

const Icon = ({ name, contrast, ramp, className, style, size = "1em" }) => {
  const parentBg = useContext(BackgroundContext);
  const color = parentBg.contrast(contrast, ramp);

  return (
    <Container className={className} style={style}>
      <MicroIcon name={name} size={size} color={color} />
    </Container>
  );
};
export default Icon;
