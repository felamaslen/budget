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

const colorKeyList = [
  [1, 0, 103],
  [255, 0, 86],
  [158, 0, 142],
  [14, 76, 161],
  [0, 95, 57],
  [149, 0, 58],
  [255, 147, 126],
  [0, 21, 68],
  [107, 104, 130],
  [0, 0, 255],
  [0, 125, 181],
  [106, 130, 108],
  [0, 174, 126],
  [194, 140, 159],
  [190, 153, 112],
  [0, 143, 156],
  [95, 173, 78],
  [255, 0, 0],
  [255, 2, 157]
];

const colorKeyRGB = index => {
  if (index === 0) {
    return [0, 0, 0];
  }
  return colorKeyList[index % colorKeyList.length];
};
export const colorKey = index => {
  return rgb(colorKeyRGB(index));
};

