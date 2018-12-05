import { contrastLightnessAgainst } from "./huet";

test("white background, no contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 100, desiredContrast: 0 })
  ).toBe(100);
});
test("white background, low contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 100, desiredContrast: 20 })
  ).toBe(80);
});
test("white background, medium contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 100, desiredContrast: 50 })
  ).toBe(50);
});
test("white background, highest contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 100, desiredContrast: 100 })
  ).toBe(0);
});

test("white background, low contrast, prefer light", () => {
  expect(
    contrastLightnessAgainst({
      bgLightness: 90,
      desiredContrast: 10,
      bgLightnessAbove: 0
    })
  ).toBe(100);
});
test("light background, highest contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 80, desiredContrast: 100 })
  ).toBe(0);
});

test("medium background, medium contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 50, desiredContrast: 50 })
  ).toBe(0);
});
test("medium background, medium contrast, prefer light", () => {
  expect(
    contrastLightnessAgainst({
      bgLightness: 50,
      desiredContrast: 50,
      bgLightnessAbove: 0
    })
  ).toBe(100);
});
test("medium background, highest contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 50, desiredContrast: 100 })
  ).toBe(0);
});

test("dark background, highest contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 20, desiredContrast: 100 })
  ).toBe(100);
});

test("black background, no contrast", () => {
  expect(contrastLightnessAgainst({ bgLightness: 0, desiredContrast: 0 })).toBe(
    0
  );
});
test("black background, low contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 0, desiredContrast: 20 })
  ).toBe(20);
});
test("black background, medium contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 0, desiredContrast: 50 })
  ).toBe(50);
});
test("black background, higest contrast", () => {
  expect(
    contrastLightnessAgainst({ bgLightness: 0, desiredContrast: 100 })
  ).toBe(100);
});
