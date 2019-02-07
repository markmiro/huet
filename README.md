# Huet ([alpha](#future-developments))

**NOTE: THIS PROJECT IS UNDER ACTIVE CONSTRUCTION AND LIKELY DOESN'T WORK**

Huet is named to resemble the word duet. The idea is to have colors work in harmony together.

## Why Huet?

This library is an exploration of what the future of coloring UIs might look like:
- Trivial dark mode without having to explicitly design one
- Trivial high contrast mode
- Trivial re-theming. Allow you to decide that black should be blue and white should be yellow and the library should adjust the grays in between and other colors like red, blue, etc. to maintain good contrast.

We achieve the above with a simple concept. Instead of specifying the hex color you want directly, you specify some parameters for how the color should be calculated. The most important parameter you specify is *contrast*. With Huet, all colors except for the background color of your page are relative. The standard way to use Huet is to base all colors on their parent. This might not seem like an idea that would work, but I'm happy with the final result and I hope you are too.

There are a couple ways to use Huet.
1. [React Block component](). This is the easiest way to use Huet, but the API is experimental and incomplete.
2. [Use the utilities](). You can use the utilities to create your own React library. Using these utilities on their own likely isn't what you want.
3. Use a combination of the two.

## Index
- [Docs](#docs)
- [Demo]()
- [Usage - React]()
- [Usage - Utils]()
- [Gotchas]()
- [Future Developments]()
- [Glossary]()
- [Credits]()

### Demo

### Usage - React

The React API is likely to change. I don't recommend using it in real projects just yet. Still, the API is terse and allows you to build up very flexible UIs.

### Usage - Utils

### Usage - Defininig your own theme

The [default theme]() lets you use Huet without having to create your own theme.
```
{
  pallet: {
    black: '#000000',
    white: '#ffffff',
    ramps: {
      gray: {
        isNeutral: true,
        colors: ['black', 'white'], // dark color first
      },
    }
  },
  bgRamp: "gray",
  bgRampValue: 1,
  minColorLightness: 30,
  maxColorLightness: 70,
  contrastMultiplier: 1,
  saturationContrastMultiplier: 1
}
```

#### pallet config

#### ramp config options
##### colors
##### classes
##### mode
##### isNeutral
##### colorModel
##### correctLightness

#### bgRamp
#### bgRampValue
#### minColorLightness
#### maxColorLightness
#### contrastMultiplier
#### saturationContrastMultiplier

### Gotchas

- You rarely want non-Huet components sitting inside Huet components. If you have a large product, it may be better to introduce it in your smaller React components (like buttons and form elements). Otherwise, you may end up with unexpected color clashing.
- Most of the time, you'll want to base the color of an element on the immediate parent.
- Transparent colors are tricky. I recommend you only use transparency in gradients and shadows. The way browsers implement transparency means that colors don't get mixed in a perceptually intuitive way in some cases. By using transparency, the resulting color is created by mixing colors in a way that isn't as good as the perceptually-based systemt that Huet uses. Transparent colors therefore reduce your flexibility with rethemability.
- Changing colors on hover is really complicated. You either need to use local state or you need to 
- Keeping your styles and markup separate becomes harder with Huet especially when using the Huet's React Block component. You may be ok with this if you're already using Atomic CSS.

### Future Developments

This project is in alpha. This is because it's still not seemlesss to use Huet within a web project. Some things I'm thinking about:
- Gamma correction to ensure that differences between dark colors are increased to match percieved difference between light colors.
- Performance improvements. Huet seems fast enough, but I haven't tested it on sufficiently large web pages.
- The themer has limited functionality. Ideally you'd be able to create an entire theme from this area.
- Remove dependency on chroma.js to reduce bundle size
- Make the API better. The React API in particular isn't as easy to use as I'd like. [Changing colors on hover](#future-developments) is way too complicated.

### Glossary

**Theme config**: This is the JSON-serializable definition that create the ultimate theme that we use.

**Theme**: This is the object that all Huet colors use to determine how they should be displayed.

**Pallet**: The set of key/value pairs to define colors and their hex values in your theme config / theme.

**Ramp**: A ramp represents the range of acceptable colors.

**Huet color**: An instance of a Huet Color class.

# Credits

D3
chroma.js
Intial version created with CodeSandbox
