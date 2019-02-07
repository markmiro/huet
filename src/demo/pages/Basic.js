import React, { useContext } from "react";
import { Icon } from "react-icons-kit";
import { ic_sentiment_satisfied } from "react-icons-kit/md/ic_sentiment_satisfied";
import { ic_notifications } from "react-icons-kit/md/ic_notifications";
import { Block } from "../../huet";
import __ from "../../private/atoms";
import Theme from "../../Theme";
import { BackgroundContext, ThemeContext } from "../../reactContexts";

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
  const theme = useContext(ThemeContext);
  return (
    <>
      <Block as="label" style={__.db.mb1.mt2}>
        Username
      </Block>
      <Block
        as="input"
        contrast="b=25 fg=100"
        value="foobar"
        readOnly
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
        readOnly
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
        contrast="bg=100 bg/fg=white"
        style={{
          ...__.pa2.tc.w100.br2.mt3.bn.db.flex.justify_center.items_center,
          fontSize: "inherit",
          fontFamily: "inherit",
          maxWidth: "20em"
        }}
      >
        Submit
      </Block>
      <Block
        theme={
          new Theme({
            ...theme.config,
            contrastMultiplier: theme.config.contrastMultiplier * 0.5
          })
        }
        as="button"
        contrast="bg=100 bg/fg=white"
        style={{
          ...__.pa2.tc.w100.br2.mt2.bn.db.flex.justify_center.items_center,
          fontSize: "inherit",
          fontFamily: "inherit",
          maxWidth: "20em"
        }}
      >
        Submit Disabled
      </Block>
      <Block contrast="fg=50" style={{ ...__.mt1, fontSize: "75%" }}>
        By signing up you agree to the{" "}
        <Block as="a" href="#" base="blue">
          Terms and Conditions
        </Block>
        .
      </Block>
    </>
  );
}

function Charts() {
  const parentBg = useContext(BackgroundContext);
  const { ramps } = parentBg.theme;
  return (
    <div>
      <svg
        width="500"
        height="200"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <rect
          x="10%"
          y="40%"
          width="20%"
          height="60%"
          fill={parentBg.contrast(100, ramps.red)}
        />
        <rect
          x="40%"
          y="20%"
          width="20%"
          height="80%"
          fill={parentBg.contrast(100, ramps.green)}
        />
        <rect
          x="70%"
          y="0%"
          width="20%"
          height="100%"
          fill={parentBg.contrast(100, ramps.blue)}
        />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="100%"
          stroke={parentBg.contrast(50)}
          strokeWidth="2"
        />
        <line
          x1="0"
          y1="100%"
          x2="100%"
          y2="100%"
          stroke={parentBg.contrast(50)}
          strokeWidth="2"
        />
      </svg>
      <p>
        <small>
          Note: The above chart might not be accessible to people with color
          blindness.
        </small>
      </p>
    </div>
  );
}

function NamedColors() {
  const theme = useContext(ThemeContext);
  return (
    <>
      {[100, 50, 25, 12.5, 6.25].map(contrast => (
        <div key={contrast} style={__.flex.mb2}>
          {Object.keys(theme.ramps).map(rampKey => (
            <Block
              key={rampKey}
              contrast={`bg=${contrast}-${rampKey} bg/fg=white`}
              style={__.pa1.tc.w100.f4.mr2.br1}
            >
              {rampKey}
            </Block>
          ))}
        </div>
      ))}
    </>
  );
}

function Nav() {
  return (
    <Block contrast="bg=100" style={__.pa3.flex.items_center.justify_between}>
      <Block contrast="fg=50">
        <Icon icon={ic_sentiment_satisfied} style={__.mr2} size={32} />
      </Block>
      <div style={__.flex.items_center}>
        <div style={__.mr3}>Home &nbsp;&nbsp; About &nbsp;&nbsp; Contact</div>
        <Block
          as="input"
          readOnly
          contrast="bg=25 bg/b=25 bg/fg=50"
          value="Search"
          style={parentBg => ({
            ...__.ba.br2.pa2.mr3,
            backgroundColor: "transparent",
            boxShadow: `inset 0 2px 10px ${parentBg.shadowColor(0.2)}`,
            width: "15em"
          })}
        />
        <div style={{ position: "relative" }}>
          <Icon icon={ic_notifications} size={24} />
          <Block
            base="red"
            contrast="bg=100 b=0"
            style={{
              ...__.ba.br100.absolute,
              width: 10,
              height: 10,
              right: 0,
              top: 0
            }}
          />
        </div>
      </div>
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
      <Section title="Colors">
        <NamedColors />
      </Section>
      <Section title="Nav">
        <Nav />
      </Section>
      <Section title="Form">
        <Form />
      </Section>
      <Section title="Alert">
        {["red", "yellow", "green", "blue", "purple"].map(base => (
          <Block
            key={base}
            base={base}
            contrast="b=50 bg=25"
            style={__.mt3.pa3.ba.br2.flex.justify_between.items_center}
          >
            <div style={{ lineHeight: 1.4 }}>
              Hold up! We need to notify you about something.
              <br />
              Click{" "}
              <Block as="a" href="#" base="blue">
                this link
              </Block>{" "}
              to find out more.
            </div>
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
      <Section title="SVG Chart">
        <Charts />
      </Section>
    </div>
  );
}
