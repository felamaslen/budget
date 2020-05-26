export * from '~client/types/block-packer';

export type Preview = {
  open: boolean;
  name: string | null;
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
};

export type OnBlockClick = (name: string, preview?: Preview) => void | boolean;
