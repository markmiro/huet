import React from "react";
import { rule } from "../../unstable/nano";

const lineHeightAdjust = rule({
  "p, ul": {
    lineHeight: 1.25
  }
});

export default function Explanation() {
  return (
    <div className={`center measure f4 ${lineHeightAdjust}`}>
      <h1>How and Why</h1>
      <p>This project combines a few ideas:</p>
      <ul>
        <li>Take lessons from dataviz for building UIs</li>
        <li>
          Set colors in your UI by specifying desired contrast, not the hex code
          or a variable that points to a specific color.
        </li>
      </ul>
      <p>
        Dataviz people are ahead of UI designers in understanding the
        limitations of standard color systems (RGB, HEX, HSL, HSB).
      </p>
      <p>
        When you pick colors using something like the Photoshop color picker,
        you learn that 100% brightness for yellow looks different than 100%
        brightness for a color like blue. This inconsistency may seem odd but
        it's what allows for a simple and intuitive interface for picking
        colors.
      </p>
      <p>
        Picking colors for user interfaces poses a set of problems that you
        don't see in traditional design work. If you changed an existing color
        to a new one in in a print design, it's fairly straightforward to look
        through your design and have confidence that a new color hasn't created
        any issues. With apps, it's difficult even when you have a component
        library or design system.
      </p>
      <p>
        It's difficult to change existing colors for any of the reasons you
        might want to:
      </p>
      <ul>
        <li>Experimenting with a new look</li>
        <li>Increasing accessibility</li>
        <li>Differentiating modes and different parts of your app</li>
        <li>Allowing users to customize their experience</li>
        <li>Shifting your colors to adapt to an image or a logo</li>
      </ul>
      <p>
        The rationale for having a comprehensive way of thinking about color
        interactions becomes more clear if we think about various states and
        modes as themes, or variations of existing themes. Sometimes we want to
        apply "themes" to all or part of the UI. Some examples:
      </p>
      <ul>
        <li>Dark mode</li>
        <li>Admin mode</li>
        <li>Incognito mode</li>
        <li>Disabled state</li>
        <li>Hover state</li>
        <li>Selected state</li>
      </ul>
      <p>
        Using Huet increases your flexibility in making large retheming changes.
        However, it comes with an important limitation. It doesn't let you
        specify whether a given element will be lighter or darker than its
        background. The library will make that choice for you. I intend to make
        this limitation as painless as possible over time.
      </p>
      <p>
        Losing the flexibility to directly choose the lightness of your
        component may seem like a big limitation, but it's' what makes Huet
        possible. This means Huet may not be right for every project. Some
        examples:
      </p>
      <ul>
        <li>
          You have relatively flat views. This means your visual heirarchy is
          largely determined by size, spacing, and text color. EX: your
          backgrounds are constistently some standard color throughout your
          entire app (usually white).
        </li>
        <li>
          You have bespoke UIs where designers have enough time and control to
          produce very polished designs.
        </li>
        <li>You have a simple app with few views.</li>
        <li>
          You have designers who have the time and ability to create a flexible,
          focused pallet.
        </li>
      </ul>
    </div>
  );
}
