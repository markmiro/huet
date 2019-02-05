import React, { useContext } from "react";
import { Block } from "../../huet";
import __ from "../../private/atoms";

function Red({ children }) {
  return (
    <Block as="span" contrast="fg=100-red">
      {children}
    </Block>
  );
}

function Purple({ children }) {
  return (
    <Block as="span" contrast="fg=100-purple">
      {children}
    </Block>
  );
}

function Blue({ children }) {
  return (
    <Block as="span" contrast="fg=100-blue">
      {children}
    </Block>
  );
}

function Green({ children }) {
  return (
    <Block as="span" contrast="fg=100-green">
      {children}
    </Block>
  );
}

function Yellow({ children }) {
  return (
    <Block as="span" contrast="fg=100-yellow">
      {children}
    </Block>
  );
}

function Code() {
  return (
    <Block as="pre" contrast="bg=6" style={__.pa3.f5}>
      <Red>function</Red> <Purple>Purple</Purple>({"{"} children }) {"{"}
      <br />
      &nbsp;&nbsp;
      <Red>return</Red> (
      <br />
      <Block as="span" contrast="bg=25-red">
        <Red>-</Red>&nbsp;&nbsp;&nbsp;
        {"<"}
        <Blue>Block</Blue> <Purple>contrast</Purple>
        <Red>=</Red>
        <Yellow>"fg=100-purple"</Yellow>>
      </Block>
      <br />
      <Block as="span" contrast="bg=35-green">
        <Green>+</Green>&nbsp;&nbsp;&nbsp;
        {"<"}
        <Blue>Block</Blue> <Purple>as</Purple>
        <Red>=</Red>
        <Yellow>"span"</Yellow> <Purple>contrast</Purple>
        <Red>=</Red>
        <Yellow>"fg=100-purple"</Yellow>>
      </Block>
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{"{"}children}
      <br />
      &nbsp;&nbsp;&nbsp;&nbsp;{"</"}
      <Blue>Block</Blue>><br />
      &nbsp;&nbsp;);
      <br />}
    </Block>
  );
}

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
      <h1 style={__.f1}>Examples</h1>
      <h2 style={__.f2}>Form</h2>
      <h2 style={__.f2}>Code</h2>
      <Code />
      <h2 style={__.f2}>Icons</h2>
      <h2 />
    </div>
  );
}
