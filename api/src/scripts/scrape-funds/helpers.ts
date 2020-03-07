export const removeWhitespace = (data: string): string =>
  data
    .replace(/\n/g, '')
    .replace(/\r/g, '')
    .replace(/\t/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+>/g, '>');
