export type RangeX = {
  minX: number;
  maxX: number;
};

export type RangeY = {
  minY: number;
  maxY: number;
  minY2?: number;
  maxY2?: number;
  y2Capped?: boolean;
};

export type Range = RangeX & RangeY;

export type Padding = [number, number, number, number];

export type Size = {
  width: number;
  height: number;
  padding?: Padding;
};

export type Dimensions = Range & Size;

export interface PixX {
  pixX: (x: number) => number;
}

export interface PixY {
  pixY1: (y: number) => number;
  pixY2: (y: number) => number;
}

interface ValX {
  valX: (p: number) => number;
}

export interface ValY {
  valY1: (p: number) => number;
  valY2: (p: number) => number;
}

export type Pix = PixX & PixY;
type Val = ValX & ValY;

export type PixPrimary = Pick<Pix, 'pixX' | 'pixY1'>;

export type Calc = Pix & Val;

export type DrawProps = Dimensions & Calc;

export type Point = [number, number];

export type Data = Point[];

export type PathProps = {
  strokeWidth?: number;
  dashed?: boolean;
};

export type SVGPathProps = Pick<PathProps, 'strokeWidth'> & {
  strokeDasharray?: string;
};

type ColorFunction = (point: Point, index: number) => string;

export type ColorSwitcher = {
  changes: number[];
  values: string[];
};

export type DynamicLineColor = ColorSwitcher | ColorFunction;

export type LineColor = string | DynamicLineColor;

export type GraphStack = Data[];

export type LineAppearance = PathProps & {
  color: LineColor;
  smooth?: boolean;
  fill?: boolean;
};

export type Line = LineAppearance & {
  key: string;
  name: string;
  data: Data;
  stack?: GraphStack;
  sliceAtFirstPositive?: number;
  hover?: boolean;
  secondary?: boolean;
  movingAverage?: LineAppearance & {
    period: number;
  };
} & PathProps;

export type UnkeyedLine = Pick<Line, Exclude<keyof Line, 'key'>>;

export type Tick = {
  pix: number;
  major: 0 | 1 | 2;
  text: string | null;
};
