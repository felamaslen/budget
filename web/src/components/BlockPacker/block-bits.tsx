import React, { useCallback, memo } from 'react';

import * as Types from './types';
import * as Styled from './styles';

export type PropsSubBlock = {
  name: string;
  value: number;
  subBlockBit: Types.SubBlockBit;
  active?: boolean;
  onHover: (name: string | null, subBlock?: string | null) => void;
};

const SubBlockComponent: React.FC<PropsSubBlock> = ({ name, subBlockBit, active, onHover }) => {
  const onBlockHover = useCallback(() => onHover(name, subBlockBit.name), [
    onHover,
    name,
    subBlockBit.name,
  ]);

  return (
    <Styled.SubBlock
      width={subBlockBit.width}
      height={subBlockBit.height}
      active={active}
      onTouchStart={onBlockHover}
      onMouseOver={onBlockHover}
    />
  );
};

export const SubBlock = memo(SubBlockComponent);

export type PropsBlockGroup = {
  subBlock: Types.SubBlock;
  activeSub: string | null;
} & Omit<PropsSubBlock, 'subBlockBit' | 'active'>;

const BlockGroupComponent: React.FC<PropsBlockGroup> = ({ subBlock, activeSub, ...props }) => (
  <Styled.BlockGroup width={subBlock.width} height={subBlock.height}>
    {subBlock.bits.map(subBlockBit => (
      <SubBlock
        key={subBlockBit.name}
        subBlockBit={subBlockBit}
        active={activeSub === subBlockBit.name}
        {...props}
      />
    ))}
  </Styled.BlockGroup>
);

export const BlockGroup = memo(BlockGroupComponent);

export type Props = {
  blockBit: Types.BlockBit;
  active?: boolean;
  activeSub: string | null;
  deep?: string | null;
  onClick: (name: string, color: Types.Color) => void;
} & Pick<PropsSubBlock, 'onHover'>;

const BlockBits: React.FC<Props> = ({
  blockBit,
  active = false,
  activeSub,
  deep,
  onHover,
  onClick,
}) => (
  <Styled.Block
    width={blockBit.width}
    height={blockBit.height}
    blockColor={blockBit.color}
    active={!activeSub && active}
    name={deep ? undefined : blockBit.name}
    onClick={(): void => onClick(blockBit.name, blockBit.color)}
  >
    {(blockBit.blocks || []).map(subBlock => (
      <BlockGroup
        key={subBlock.bits[0].name}
        activeSub={activeSub}
        name={blockBit.name}
        value={blockBit.value}
        subBlock={subBlock}
        onHover={onHover}
      />
    ))}
  </Styled.Block>
);

export default memo(BlockBits);
