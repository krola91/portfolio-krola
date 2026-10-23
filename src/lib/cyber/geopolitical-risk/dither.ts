export const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5] as const;
/** Ordered dithering is applied to luminance, before nearest-neighbour display scaling. */
export const bayerPixel = (luminance: number, x: number, y: number) => luminance > (BAYER_4[(y & 3) * 4 + (x & 3)] + 0.5) / 16 ? 1 : 0;
