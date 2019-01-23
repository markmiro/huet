import React, { useContext } from "react";
import styled from "styled-components";
import { BackgroundContext } from "./reactContexts";
import __ from "../atoms";

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
      <span style={{ ...__.ba, color, borderStyle: "dotted" }}>{name}</span>
    </Container>
  );
};
export default Icon;
