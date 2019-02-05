import React, { useContext } from "react";
import { Block } from "../../huet";
import __ from "../../private/atoms";

function Section({ title, children }) {
  return (
    <section>
      <Block as="h2" contrast="b=50" style={__.f2.pb1.mv5.bb}>
        {title}
      </Block>
      {children}
    </section>
  );
}

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

function Form() {
  return (
    <>
      <Block as="label" style={__.db.mb1.mt2}>
        Username
      </Block>
      <Block
        as="input"
        contrast="b=25 fg=100"
        value="foobar"
        style={{
          ...__.ba.br2.pa2,
          backgroundColor: "transparent",
          width: "20em"
        }}
      />
      <Block base="green" style={__.f7.mt1}>
        ✓ Username is available
      </Block>
      <Block as="label" style={__.db.mb1.mt3}>
        Email
      </Block>
      <Block
        as="input"
        contrast="b=100-red fg=100"
        value="foo@bar"
        style={{
          ...__.ba.br2.pa2,
          backgroundColor: "transparent",
          width: "20em"
        }}
      />
      <Block base="red" style={__.f7.mt1}>
        Invalid email
      </Block>
      <Block
        as="button"
        contrast="bg=100-blue bg/fg=white"
        style={{
          ...__.pa2.tc.w100.br2.mt3.bn.db,
          fontSize: "inherit",
          fontFamily: "inherit",
          maxWidth: "20em"
        }}
      >
        Submit
      </Block>
    </>
  );
}

export default function Basic() {
  const rampKey = "red";
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
      <Section title="Form">
        <Form />
      </Section>
      <Section title="Alert">
        {["red", "yellow", "green"].map(base => (
          <Block
            base={base}
            contrast="b=50 bg=25"
            style={__.mt3.pa3.ba.br2.flex.justify_between.items_center}
          >
            Hold up! We need to notify you about something.
            <Block
              base={base}
              contrast="bg=12"
              style={__.w2.h2.br100.flex.flex.items_center.justify_center}
            >
              ✕
            </Block>
          </Block>
        ))}
      </Section>
      <Section title="Code">
        <Code />
      </Section>
      <Section title="Icons" />
    </div>
  );
}
