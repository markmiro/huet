import React from "react";
import { Block } from "../../huet";
import __ from "../../private/atoms";

export default function Basic() {
  return (
    <div
      style={{
        ...__.pa4,
        width: "50em",
        marginLeft: "auto",
        marginRight: "auto"
      }}
    >
      <h1 style={__.f1}>Basic</h1>
      <Block debug contrast="bg=12" base="red">
        Test
      </Block>
    </div>
  );
}
