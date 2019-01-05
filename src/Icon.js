import React, { useContext } from "react";
import styled from "styled-components";
import { Icon as MicroIcon } from "microicon";
import { BackgroundContext } from "./huet";

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
