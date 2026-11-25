/*
  Lays elements over another element's content box, for media Huet can't
  replace: a video has to keep playing, and an iframe has to stay usable.
  The layers are absolutely positioned siblings inserted right after the
  element, so they scroll with it and paint above it. They ignore the
  pointer, so clicks, hovers and scrolling reach the element underneath.

  Each layer is placed by measuring where the layers' containing block puts
  `left: 0; top: 0`, which works for any positioned ancestor (or none). The
  layers follow the element when it or that ancestor resizes, when it moves
  in the DOM, and whenever the mount calls `place()`. Layout shifts that
  resize neither, such as content above it in a fixed-height box, aren't
  noticed until then. A transform on the element itself isn't copied; its
  bounding box is used.
*/

export interface Overlay {
  /** The content box's last measured size, in CSS pixels. */
  width: number;
  height: number;
  /** Measure the element again and move the layers over it. */
  place(): void;
  /** Take the layers out of the page, until `attach`. */
  detach(): void;
  attach(): void;
  remove(): void;
}

const px = (value: string) => parseFloat(value) || 0;

export function overlay(target: HTMLElement, layers: HTMLElement[]): Overlay {
  for (const layer of layers) {
    layer.setAttribute("aria-hidden", "true");
    Object.assign(layer.style, {
      position: "absolute",
      pointerEvents: "none",
      margin: "0",
      padding: "0",
      border: "0",
      maxWidth: "none",
      maxHeight: "none",
      boxSizing: "content-box",
    });
  }
  const self: Overlay = { width: 0, height: 0, place, detach, attach, remove };
  let attached = true;
  // The layers' containing block, watched so the layers follow it.
  let container: Element | null = null;
  const resize = new ResizeObserver(() => place());
  resize.observe(target);

  function place() {
    if (!attached || !target.isConnected) return;
    if (target.nextSibling !== layers[0]) target.after(...layers);
    const box = target.getBoundingClientRect();
    if (!target.getClientRects().length) {
      for (const layer of layers) layer.style.display = "none";
      return;
    }
    const style = getComputedStyle(target);
    for (const layer of layers) {
      layer.style.display = "";
      layer.style.left = layer.style.top = "0px";
    }
    const origin = layers[0].getBoundingClientRect();
    const [top, right, bottom, left] = ["top", "right", "bottom", "left"].map(
      (side) => px(style.getPropertyValue(`border-${side}-width`)) + px(style.getPropertyValue(`padding-${side}`)),
    );
    self.width = Math.max(0, box.width - left - right);
    self.height = Math.max(0, box.height - top - bottom);
    // Rounded corners, inset by the border, as the content is clipped.
    const radius = (corner: string, vertical: string, horizontal: string) => {
      // Elliptical corners ("8px 4px") use their horizontal radius.
      const value = style.getPropertyValue(`border-${corner}-radius`).split(" ")[0];
      const inset = Math.max(
        px(style.getPropertyValue(`border-${vertical}-width`)),
        px(style.getPropertyValue(`border-${horizontal}-width`)),
      );
      return value.endsWith("px") ? `${Math.max(0, px(value) - inset)}px` : value;
    };
    const zIndex = style.position !== "static" && style.zIndex !== "auto" ? style.zIndex : "";
    for (const layer of layers)
      Object.assign(layer.style, {
        left: `${box.left - origin.left + left}px`,
        top: `${box.top - origin.top + top}px`,
        width: `${self.width}px`,
        height: `${self.height}px`,
        borderRadius: [
          radius("top-left", "top", "left"),
          radius("top-right", "top", "right"),
          radius("bottom-right", "bottom", "right"),
          radius("bottom-left", "bottom", "left"),
        ].join(" "),
        zIndex,
      });
    const next = layers[0].offsetParent ?? document.body;
    if (next !== container) {
      if (container) resize.unobserve(container);
      resize.observe((container = next));
    }
  }

  function detach() {
    attached = false;
    for (const layer of layers) layer.remove();
  }

  function attach() {
    attached = true;
    place();
  }

  function remove() {
    resize.disconnect();
    detach();
  }

  target.after(...layers);
  place();
  return self;
}
