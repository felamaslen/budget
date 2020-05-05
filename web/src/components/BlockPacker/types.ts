export type Color = number | string;

export type BlockName = string;

export type SubBlockBit = {
  name: string;
  color: Color;
  width: number;
  height: number;
  value: number;
};

export type SubBlock = {
  width: number;
  height: number;
  bits: SubBlockBit[];
};

export type BlockBit = {
  name: BlockName;
  color: Color;
  value: number;
  width: number;
  height: number;
  blocks: SubBlock[];
};

export type Block = {
  width: number;
  height: number;
  bits: BlockBit[];
};

export type BlockStyleProps = {
  name?: BlockName;
  width: number;
  height: number;
  left: number;
  top: number;
  active?: boolean;
  blockColor: Color;
  expanded?: boolean;
  hidden?: boolean;
};

export type Preview = BlockStyleProps & { opened?: boolean };

export type OnBlockClick = (name: string, preview?: Preview) => void;
