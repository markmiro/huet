// Color emoji are font glyphs, not images: CSS and SVG filters can't apply a
// 3D LUT to them, so rasterize them into a canvas and recolor the pixels.
export const emojiRows = [
  ["🌸", "🌻", "🌷", "🌹", "🌼", "🪻", "🌿", "🍀", "🌲", "🍁", "🌈", "🔥"],
  ["🍎", "🍊", "🍋", "🍏", "🫐", "🍇", "🍉", "🥑", "🥕", "🌶️", "🍄", "💧"],
  ["😀", "😍", "🥳", "😎", "🤖", "👻", "🐸", "🦊", "🐝", "🦋", "🐳", "🦜"],
  ["❤️", "🧡", "💛", "💚", "💙", "💜", "🤎", "🖤", "🤍", "⭐", "✅", "🚫"],
  ["👍🏻", "👍🏼", "👍🏽", "👍🏾", "👍🏿", "👋", "🙌🏻", "🙌🏽", "🙌🏿", "🧑🏻", "🧑🏽", "🧑🏿"],
];

/** Draws rows of emoji with the system emoji font and returns a PNG data URL. */
export function emojiSheet(rows: string[][] = emojiRows, cell = 96, scale = 2) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(...rows.map((row) => row.length)) * cell * scale;
  canvas.height = rows.length * cell * scale;
  const context = canvas.getContext("2d")!;
  context.scale(scale, scale);
  context.font = `${cell * 0.72}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  rows.forEach((row, y) =>
    row.forEach((emoji, x) => context.fillText(emoji, (x + 0.5) * cell, (y + 0.55) * cell)),
  );
  return canvas.toDataURL("image/png");
}
