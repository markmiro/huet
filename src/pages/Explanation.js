import React from "react";

export default function Explanation() {
  return (
    <div className="center measure f4">
      <h1>How and Why</h1>
      <p>This project combines a few ideas:</p>
      <ul>
        <li>Try ideas from dataviz for UI</li>
        <li>
          Set colors in your UI by specifying desired contrast, not the hex
          code, or a reference to a color in your pallet.
        </li>
      </ul>
      <p>
        The second point may seem like a bad idea, but relaxing this constraint
        opens up possibilities that haven't been explored. My guess is that Huet
        may not provide enough value to be adopted in some scenarios:
      </p>
      <ul>
        <li>
          You have relatively flat views. This means your visual heirarchy is
          largely determined by size, spacing, and text color. EX: your
          backgrounds are usually white or some other predictable color.
        </li>
        <li>
          Bespoke UIs where designers have enough time and control to produce
          very polished designs.
        </li>
        <li>Simple apps with few views.</li>
        <li>
          You have designers who have the time and ability to create a flexible,
          focused pallet.
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
        don't see in traditional design work. If you were picking colors to use
        in print, it's fairly straightforward to look through your design and
        have confidence that a new color hasn't created any issues. With apps,
        it's difficult even when you have a component library, or you use
        Storybook.
      </p>
      <p>
        The result is it's difficult to change existing colors for any of the
        reasons you might want to:
      </p>
      <ul>
        <li>Experimenting with a new look</li>
        <li>Allowing users to customize their experience</li>
        <li>Differentiating modes and different parts of your app</li>
        <li>Increasing accessibility</li>
        <li>Shifting your colors to adapt to an image or a logo</li>
      </ul>
      <p>
        The rationale for having a comprehensive way of thinking about color
        interactions becomes more clear if we think about various states and
        modes as themes, or variations of existing themes. Sometimes we want to
        apply "themes" to only a part of the UI. Some examples:
      </p>
      <ul>
        <li>Dark mode</li>
        <li>Admin mode</li>
        <li>Incognito</li>
        <li>Disabled state</li>
        <li>Hover state</li>
        <li>Active state</li>
        <li>Selected state</li>
      </ul>
      <p>
        Using Huet increases your flexibility in making large retheming changes.
        However, it comes with an important limitation. It doesn't let you
        specify whether your component will be lighter or darker than the
        background. The library will make the choice for you. This may be fixed
        in future iterations, but for now it's an important limitation worth
        knowing about.
      </p>
    </div>
  );
}
