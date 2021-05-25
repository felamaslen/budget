import { ReactElement, ReactText } from 'react';

export type FlexFlow = 'row' | 'column';

export type Box = {
  flex: number; // 0 < flex <= 1; root node has flex: 1
  flow: FlexFlow;
};

type WithBlockDimensions<T> = T & { box: Box };
type WithFlex<T> = T & { flex: number };
export type WithSubTree<T> = T & { subTree?: T[] };
export type WithArea<T> = T & { area: number };

export type FlexBlocks<T> = WithBlockDimensions<{
  box: Box;
  items?: {
    box: Box;
    blocks: (WithFlex<T> & {
      subTree?: FlexBlocks<T>;
    })[];
  };
  children?: FlexBlocks<T>;
  childIndex?: number;
}>;

export type BlockItem = {
  name: string;
  total: number;
  color?: string;
  childCount?: number;
  hasBreakdown?: boolean;
  text?: ReactElement | ReactText;
  onClick?: () => void;
};
