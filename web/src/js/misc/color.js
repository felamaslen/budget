/**
 * Colour functions
 */

export const rgb2hex = (rgb) => {
  return '#' + rgb.map(item => {
    const hex = Math.max(0, Math.min(255, item)).toString(16);
    return hex.length < 2 ? `0${hex}` : hex;
  }).join('');
};

