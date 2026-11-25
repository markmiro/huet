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
export declare function overlay(target: HTMLElement, layers: HTMLElement[]): Overlay;
