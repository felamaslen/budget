export interface DimensionsX {
    minX: number;
    maxX: number;
}

export interface DimensionsY {
    minY: number;
    maxY: number;
}

export type Dimensions = DimensionsX & DimensionsY;

export interface PixX {
    pixX: (x: number) => number;
}

export interface PixY {
    pixY: (y: number) => number;
}

export interface ValX {
    valX: (p: number) => number;
}

export interface ValY {
    valY: (p: number) => number;
}

export type Pix = PixX & PixY;

export type Line = {
    key: string;
    data: [number, number][];
    color: string;
    smooth: boolean;
};
