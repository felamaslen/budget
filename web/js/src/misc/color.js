/**
 * Colour functions
 */

import { leadingZeroes } from "misc/misc";

export function rgb(color) {
  return "#" + color.map((item) => {
    return leadingZeroes(item, 16);
  }).join("");
}
export function rgba(color, alpha) {
  return "rgba(" + color.join(",") + "," + alpha + ")";
}
export function getColorFromScore(color, score, negative) {
  if (!color) {
    console.warn("No colour given to getColor!");
    color = [36, 191, 55];
  }

  if (color.length === 2) {
    color = color[negative ? 1 : 0];
  }
  else if (negative) {
    score = 0;
  }

  return rgb(color.map(value => {
    return Math.round(255 - (255 - value) * score);
  }));
}

