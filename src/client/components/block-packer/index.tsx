/** @jsx jsx */
import { jsx } from '@emotion/react';
import { rgba } from 'polished';
import { useRef, useState, useEffect, useMemo, useCallback, memo, ReactElement } from 'react';

import * as Styled from './styles';
import type { Preview } from './types';
import { useCTA } from '~client/hooks';
import { VOID } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import type { PickUnion, BlockItem, FlexBlocks, Box } from '~client/types';

export { statusHeight } from './styles';

export type BlockName = string | null;
type SetPreview = React.Dispatch<React.SetStateAction<Preview>>;

const emptyBlocks: BlockName[] = [];

export type Props = {
  blocks: FlexBlocks<BlockItem> | null;
  blocksDeep?: FlexBlocks<BlockItem> | null;
  onHover?: (...names: BlockName[]) => void;
  onClick?: (name: string | null) => void;
  activeBlocks?: BlockName[] | null;
  status: string | ReactElement | null;
};

type CommonProps = Box &
  Pick<Props, 'activeBlocks'> & {
    isSubTree?: boolean;
    isDeep: boolean;
    childIndex: number;
    names: BlockName[];
    onHover?: Props['onHover'];
    setPreview: SetPreview;
  };

type InfiniteChildProps = CommonProps &
  PickUnion<BlockItem, 'name' | 'color' | 'childCount' | 'text' | 'hasBreakdown'> & {
    active?: boolean;
    subTree?: FlexBlocks<BlockItem>;
  };

const InfiniteChild = memo<InfiniteChildProps>((props) => {
  const {
    name,
    names,
    flex,
    flow,
    color,
    active,
    activeBlocks,
    childIndex,
    subTree,
    text,
    hasBreakdown,
    isSubTree,
    isDeep,
    onHover,
    setPreview,
  } = props;

  const childRef = useRef<HTMLDivElement>(null);
  const namesConcat = useMemo<BlockName[]>(() => [...names, name], [names, name]);

  const onActivate = useMemo(
    () =>
      onHover
        ? (event: React.MouseEvent | React.FocusEvent | React.TouchEvent): void => {
            if (isSubTree) {
              event.stopPropagation();
            }

            onHover(...namesConcat);
          }
        : VOID,
    [isSubTree, onHover, namesConcat],
  );

  const canDive = isDeep || hasBreakdown;
  const onDiveIn = useMemo(
    () =>
      canDive
        ? (): void => {
            setPreview({
              open: true,
              name,
              color: rgba(color ?? colors.transparent, 0),
              left: childRef.current?.offsetLeft ?? 0,
              top: childRef.current?.offsetTop ?? 0,
              width: childRef.current?.offsetWidth ?? 0,
              height: childRef.current?.offsetHeight ?? 0,
            });
          }
        : VOID,
    [canDive, setPreview, name, color],
  );

  const diveProps = useCTA(onDiveIn);

  return (
    <Styled.InfiniteChild
      ref={childRef}
      style={{
        ...Styled.getBoxStyle({ flex, flow }),
        backgroundColor: color,
      }}
      data-testid={name}
      role={canDive ? 'button' : 'container'}
      name={name}
      active={active}
      tabIndex={0}
      onFocus={onActivate}
      onMouseOver={onActivate}
      onTouchStart={onActivate}
      {...diveProps}
      hasSubTree={!!subTree}
    >
      {text}
      {subTree && (
        <InfiniteBox // eslint-disable-line @typescript-eslint/no-use-before-define
          flex={1}
          flow={flow}
          activeBlocks={activeBlocks}
          childIndex={childIndex}
          blocks={subTree}
          names={namesConcat}
          onHover={onHover}
          setPreview={setPreview}
          isSubTree
          isDeep={isDeep}
        />
      )}
    </Styled.InfiniteChild>
  );
});
InfiniteChild.displayName = 'InfiniteChild';

const InfiniteBox: React.FC<
  CommonProps & {
    blocks: FlexBlocks<BlockItem>;
  }
> = ({ flow, blocks, names, childIndex, activeBlocks, isSubTree, isDeep, onHover, setPreview }) => {
  const items = blocks.items;

  return (
    <Styled.InfiniteBox style={Styled.getBoxStyle({ flex: blocks.box.flex, flow })}>
      {items && (
        <Styled.InfiniteBox
          style={Styled.getBoxStyle({ flex: items.box.flex, flow: blocks.box.flow })}
        >
          {items.blocks.map((item) => (
            <InfiniteChild
              key={item.name}
              name={item.name}
              names={names}
              active={item.name === activeBlocks?.[childIndex]}
              activeBlocks={item.name === activeBlocks?.[childIndex] ? activeBlocks : null}
              childIndex={childIndex + 1}
              flex={item.flex}
              flow={items.box.flow}
              color={item.color}
              childCount={item.childCount ?? 0}
              subTree={item.subTree}
              text={item.text}
              isDeep={isDeep}
              hasBreakdown={item.hasBreakdown}
              isSubTree={isSubTree}
              onHover={onHover}
              setPreview={setPreview}
            />
          ))}
        </Styled.InfiniteBox>
      )}
      {blocks.children && (
        <InfiniteBox
          key={`child-${blocks.children.childIndex}`}
          flex={1}
          flow={blocks.box.flow}
          blocks={blocks.children}
          names={names}
          activeBlocks={activeBlocks}
          childIndex={childIndex}
          isSubTree={isSubTree}
          isDeep={isDeep}
          onHover={onHover}
          setPreview={setPreview}
        />
      )}
    </Styled.InfiniteBox>
  );
};

type DiveState = {
  preview: Preview;
  lastPreview: Preview;
};

const initialPreview: Preview = {
  name: '',
  color: colors.transparent,
  open: false,
  left: 0,
  top: 0,
  width: 0,
  height: 0,
};

const initialDiveState: DiveState = {
  preview: initialPreview,
  lastPreview: initialPreview,
};

function useClickDive(
  onClick: Props['onClick'],
  haveDeepBlocks: boolean,
): [React.RefObject<HTMLDivElement>, Preview, SetPreview, () => void] {
  const container = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useState<DiveState>(initialDiveState);
  const { preview } = state;
  const setPreview = useCallback(
    (action: React.SetStateAction<Preview>): void =>
      dispatch((last) => ({
        ...last,
        preview: typeof action === 'function' ? action(last.preview) : action,
      })),
    [],
  );

  const onDive = useMemo(() => (onClick ? (name: string | null): void => onClick(name) : VOID), [
    onClick,
  ]);

  const fadeTimer = useRef<number>();
  const hadPreview = useRef<boolean>(false);
  useEffect(() => {
    // trigger expand animation when diving
    if (preview.name && preview.open && !hadPreview.current) {
      setTimeout(() => {
        dispatch((last) => ({
          preview: {
            name: last.preview.name,
            open: true,
            color: rgba(last.preview.color, 1),
            left: 0,
            top: 0,
            width: container.current?.offsetWidth ?? 0,
            height: container.current?.offsetHeight ?? 0,
          },
          lastPreview: {
            ...last.preview,
            color: rgba(last.preview.color, 1),
          },
        }));

        clearTimeout(fadeTimer.current);
        fadeTimer.current = window.setTimeout(() => {
          onDive(preview.name);
        }, Styled.fadeTime + 50);
      }, 0);
    }
    hadPreview.current = preview.open;
  }, [preview, onDive]);

  useEffect(() => {
    if (haveDeepBlocks) {
      // hide preview after loading deep blocks
      setTimeout(() => {
        dispatch((last) => ({
          ...last,
          preview: {
            ...last.preview,
            color: rgba(last.preview.color, 0),
          },
        }));

        clearTimeout(fadeTimer.current);
        fadeTimer.current = window.setTimeout(() => {
          dispatch((last) => ({
            ...last,
            preview: {
              ...last.preview,
              open: false,
            },
          }));
        }, Styled.fadeTime);
      }, 0);
    }
  }, [haveDeepBlocks]);

  const surface = useCallback(() => {
    // trigger collapse animation when surfacing
    dispatch((last) => ({
      preview: {
        ...last.preview,
        name: null,
        open: true,
        color: last.lastPreview.color,
      },
      lastPreview: {
        ...last.lastPreview,
        name: null,
      },
    }));

    onDive(null);

    setTimeout(() => {
      dispatch((last) => ({
        ...last,
        preview: {
          ...last.lastPreview,
          color: rgba(last.lastPreview.color, 0),
        },
      }));
      clearTimeout(fadeTimer.current);
      fadeTimer.current = window.setTimeout(() => {
        dispatch(initialDiveState);
      }, Styled.fadeTime);
    }, 0);
  }, [onDive]);

  useEffect(() => (): void => clearTimeout(fadeTimer.current), []);

  return [container, state.preview, setPreview, surface];
}

type BlocksProps = Omit<Props, 'status'>;

const Blocks = memo<BlocksProps>((props) => {
  const { blocks, blocksDeep, activeBlocks = null, onHover, onClick } = props;

  const onDeactivate = useMemo(() => (onHover ? (): void => onHover(null) : VOID), [onHover]);

  const haveDeepBlocks = !!blocksDeep;
  const [container, preview, setPreview, surface] = useClickDive(onClick, haveDeepBlocks);

  return (
    <Styled.BoxContainer
      ref={container}
      data-testid="block-tree"
      onMouseOut={onDeactivate}
      onTouchEnd={onDeactivate}
      onBlur={onDeactivate}
    >
      {preview.open && (
        <Styled.Expander
          data-testid="preview"
          style={{
            backgroundColor: preview.color,
            left: preview.left,
            top: preview.top,
            height: preview.height,
            width: preview.width,
          }}
        />
      )}
      {blocks && !blocksDeep && (
        <InfiniteBox
          flex={1}
          flow={blocks.box.flow}
          blocks={blocks}
          childIndex={0}
          names={emptyBlocks}
          activeBlocks={activeBlocks}
          isDeep={false}
          onHover={onHover}
          setPreview={setPreview}
        />
      )}
      {blocksDeep && (
        <InfiniteBox
          flex={1}
          flow={blocksDeep.box.flow}
          isDeep={true}
          blocks={blocksDeep}
          childIndex={0}
          names={emptyBlocks}
          activeBlocks={activeBlocks}
          onHover={onHover}
          setPreview={surface}
        />
      )}
    </Styled.BoxContainer>
  );
});
Blocks.displayName = 'Blocks';

export const BlockPacker: React.FC<Props> = ({ status, ...props }) => (
  <Styled.Container>
    <Blocks {...props} />
    <Styled.StatusBar data-testid="status-bar">{status}</Styled.StatusBar>
  </Styled.Container>
);
