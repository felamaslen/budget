import React, { useRef, useState, useCallback, useEffect } from 'react';

import * as Styled from './styles';
import { Block, Preview, BlockName } from './types';
import Blocks, { Props as BlocksProps } from './blocks';

export type Props = {
  blocks: Block[];
  blocksDeep?: Block[];
  deepBlock: BlockName;
  status: string;
} & Pick<BlocksProps, 'activeMain' | 'activeSub' | 'onHover' | 'onClick'>;

const BlockPacker: React.FC<Props> = ({
  blocks,
  blocksDeep,
  activeMain,
  activeSub,
  onHover,
  onClick,
  status,
}) => {
  const onMouseOut = useCallback(() => onHover(null), [onHover]);
  const [preview, setPreview] = useState<Preview | undefined>();
  const onClickMain = useCallback(
    (name, nextPreview) => {
      onClick(name);
      setPreview(nextPreview);
    },
    [onClick],
  );

  const [expanded, setExpanded] = useState<boolean>(false);
  const expandTimer = useRef<number>();
  const havePreview = !!preview;
  useEffect(() => (): void => clearTimeout(expandTimer.current), []);
  useEffect(() => {
    if (havePreview) {
      setExpanded(true);
      clearTimeout(expandTimer.current);
      expandTimer.current = setTimeout(() => {
        setPreview(last => (last ? { ...last, opened: true } : undefined));
      }, Styled.fadeTime);
    } else {
      setExpanded(false);
    }
  }, [havePreview]);

  const haveDeep = !!(blocksDeep && preview?.opened);
  useEffect(() => {
    if (haveDeep) {
      setPreview(last => (last ? { ...last, hidden: true } : undefined));
      clearTimeout(expandTimer.current);
      expandTimer.current = setTimeout(() => {
        setPreview(undefined);
      }, Styled.fadeTime);
    }
  }, [haveDeep]);

  return (
    <Styled.BlockView onMouseOut={onMouseOut} onTouchEnd={onMouseOut}>
      <Styled.BlockTreeOuter data-testid="block-tree">
        {blocks && (
          <Blocks
            blocks={blocks}
            activeMain={activeMain}
            activeSub={activeSub}
            onHover={onHover}
            onClick={onClickMain}
          />
        )}
        {blocksDeep && !(preview && !preview.hidden) && (
          <Blocks
            deep
            blocks={blocksDeep}
            activeMain={activeMain}
            activeSub={activeSub}
            onHover={onHover}
            onClick={onClick}
          />
        )}
        {preview && <Styled.Preview {...preview} expanded={expanded} />}
      </Styled.BlockTreeOuter>
      <Styled.StatusBar data-testid="status-bar">{status}</Styled.StatusBar>
    </Styled.BlockView>
  );
};

export default BlockPacker;
