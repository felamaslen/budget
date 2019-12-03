export const rem = (value: number): string => `${value / 16}rem`;

export const breakpoint = (size: number): string => `@media only screen and (min-width: ${size}px)`;
