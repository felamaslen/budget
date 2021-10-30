import { generateImage } from 'jsdom-screenshot';

type VisualOptions = {
  isMobile: boolean;
};

export async function renderVisualTest({ isMobile = false }: Partial<VisualOptions> = {}): Promise<
  string | Buffer
> {
  return generateImage({
    serve: ['src/client/images'],
    viewport: {
      height: isMobile ? 520 : 768,
      width: isMobile ? 360 : 1024,
    },
  });
}

export function setInfiniteGridViewport({ isMobile = false }: Partial<VisualOptions> = {}): void {
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    value: isMobile ? 520 : 768,
  });
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    value: isMobile ? 360 : 1024,
  });
}
