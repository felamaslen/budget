import React, { useRef, useCallback } from 'react';

import { Block, Preview, OnBlockClick } from './types';
import BlockBits, { PropsSubBlock } from './block-bits';

import * as Styled from './styles';

export type Props = {
  deep?: boolean;
  blocks: Block[];
  activeMain: string | null;
  activeSub: string | null;
  onClick: OnBlockClick;
} & Pick<PropsSubBlock, 'onHover'>;

type OuterProps = {
  block: Block;
} & Pick<Props, 'activeMain' | 'activeSub' | 'onHover' | 'onClick'>;

const OuterBlockGroupComponent: React.FC<OuterProps> = ({
  block,
  activeMain,
  activeSub,
  onClick,
  onHover,
}) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const onClickBlock = useCallback(
    (name, color) => {
      if (!blockRef.current) {
        return;
      }

      const preview: Preview = {
        left: blockRef.current?.offsetLeft,
        top: blockRef.current?.offsetTop,
        width: block.width,
        height: block.height,
        name,
        blockColor: color,
      };

      onClick(name, preview);
    },
    [onClick, block.width, block.height],
  );

  return (
    <Styled.BlockGroup ref={blockRef} width={block.width} height={block.height}>
      {block.bits.map(blockBit => (
        <BlockBits
          key={blockBit.name}
          blockBit={blockBit}
          active={activeMain === blockBit.name}
          activeSub={activeMain === blockBit.name ? activeSub : null}
          onClick={onClickBlock}
          onHover={onHover}
        />
      ))}
    </Styled.BlockGroup>
  );
};

export const OuterBlockGroup = React.memo(OuterBlockGroupComponent);

const Blocks: React.FC<Props> = ({
  deep = false,
  blocks,
  activeMain,
  activeSub,
  onHover,
  onClick,
}) => (
  <Styled.BlockTree deep={deep}>
    {blocks.map(block => (
      <OuterBlockGroup
        key={block.bits[0].name}
        block={block}
        activeMain={
          block.bits && block.bits.some(({ name }) => name === activeMain) ? activeMain : null
        }
        activeSub={
          block.bits &&
          block.bits.some(
            ({ name, blocks: subBlocks }) =>
              name === activeMain &&
              subBlocks &&
              subBlocks.some(
                ({ bits: subBits }) =>
                  subBits && subBits.some(({ name: subName }) => subName === activeSub),
              ),
          )
            ? activeSub
            : null
        }
        onHover={onHover}
        onClick={onClick}
      />
    ))}
  </Styled.BlockTree>
);

export default Blocks;
