import { rgba, mix, setSaturation } from 'polished';
import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';

import * as Styled from './styles';
import { Preview } from './types';
import { useCTA } from '~client/hooks';
import { VOID } from '~client/modules/data';
import { colors } from '~client/styled/variables';
import { PickUnion, BlockItem, FlexBlocks, Box } from '~client/types';

type BlockName = string | null;

type SetPreview = React.Dispatch<React.SetStateAction<Preview>>;

export type Props = {
  blocks: FlexBlocks<BlockItem> | null;
  blocksDeep?: FlexBlocks<BlockItem>;
  onHover?: (name: BlockName, subName?: BlockName) => void;
  onClick?: (name: string | null) => void;
  activeMain?: string | null;
  activeSub?: string | null;
  status: string;
};

type CommonProps = Box & {
  isSubTree?: boolean;
  isDeep: boolean;
  onHover?: Props['onHover'];
  setPreview: SetPreview;
};

const highlightColor = (color = colors.transparent): string =>
  setSaturation(1)(mix(0.2)(color, colors.highlight));

const InfiniteChild: React.FC<
  CommonProps &
    PickUnion<BlockItem, 'name' | 'color' | 'childCount' | 'text' | 'hasBreakdown'> & {
      active?: boolean;
      activeSub?: string | null;
      subTree?: FlexBlocks<BlockItem>;
    }
> = ({
  name,
  flex,
  flow,
  color,
  active,
  activeSub,
  subTree,
  text,
  hasBreakdown,
  isSubTree,
  isDeep,
  onHover,
  setPreview,
}) => {
  const childRef = useRef<HTMLDivElement>(null);

  const onActivate = useMemo(
    () =>
      onHover
        ? (event: React.MouseEvent | React.FocusEvent | React.TouchEvent): void => {
            if (isSubTree) {
              event.stopPropagation();
            }

            onHover(name);
          }
        : VOID,
    [isSubTree, onHover, name],
  );

  const onActivateChild = useMemo(
    () => (onHover ? (subName: BlockName): void => onHover(name, subName) : VOID),
    [onHover, name],
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
      data-testid={name}
      role={canDive ? 'button' : 'container'}
      name={name}
      flex={flex}
      flow={flow}
      bgColor={active ? highlightColor(color) : color}
      tabIndex={0}
      onFocus={onActivate}
      onMouseOver={onActivate}
      onTouchStart={onActivate}
      {...diveProps}
      hasSubTree={!!subTree}
    >
      {text}
      {subTree && (
        <InfiniteBox
          flex={1}
          flow={flow}
          activeMain={activeSub}
          blocks={subTree}
          onHover={onActivateChild}
          setPreview={setPreview}
          isSubTree
          isDeep={isDeep}
        />
      )}
    </Styled.InfiniteChild>
  );
};

const InfiniteChildMemo = React.memo(InfiniteChild);

const InfiniteBox: React.FC<
  CommonProps & {
    blocks: FlexBlocks<BlockItem>;
    activeMain?: string | null;
    activeSub?: string | null;
  }
> = ({ flow, blocks, activeMain, activeSub, isSubTree, isDeep, onHover, setPreview }) => {
  const activeItemIndex = useMemo<number>(
    () =>
      activeMain
        ? blocks.items?.blocks.findIndex(
            (item) =>
              item.name === activeMain ||
              (!!activeSub &&
                item.subTree?.items?.blocks.some((subItem) => subItem.name === activeSub)),
          ) ?? -1
        : -1,
    [activeMain, activeSub, blocks],
  );

  return (
    <Styled.InfiniteBox flex={blocks.box.flex} flow={flow}>
      {blocks.items && (
        <Styled.InfiniteBox flex={blocks.items.box.flex} flow={blocks.box.flow}>
          {blocks.items.blocks.map((item, index) => (
            <InfiniteChildMemo
              key={item.name}
              name={item.name}
              active={!activeSub && index === activeItemIndex}
              activeSub={activeItemIndex === -1 ? null : activeSub}
              flex={item.flex}
              flow={blocks.items!.box.flow}
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
          activeMain={activeItemIndex === -1 ? activeMain : null}
          activeSub={activeItemIndex === -1 ? activeSub : null}
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
      setImmediate(() => {
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
        fadeTimer.current = setTimeout(() => {
          onDive(preview.name);
        }, Styled.fadeTime);
      });
    }
    hadPreview.current = preview.open;
  }, [preview, onDive]);

  useEffect(() => {
    if (haveDeepBlocks) {
      // hide preview after loading deep blocks
      setImmediate(() => {
        dispatch((last) => {
          return {
            ...last,
            preview: {
              ...last.preview,
              color: rgba(last.preview.color, 0),
            },
          };
        });

        clearTimeout(fadeTimer.current);
        fadeTimer.current = setTimeout(() => {
          dispatch((last) => {
            return {
              ...last,
              preview: {
                ...last.preview,
                open: false,
              },
            };
          });
        }, Styled.fadeTime);
      });
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

    setImmediate(() => {
      dispatch((last) => ({
        ...last,
        preview: {
          ...last.lastPreview,
          color: rgba(last.lastPreview.color, 0),
        },
      }));
      clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => {
        dispatch(initialDiveState);
      }, Styled.fadeTime);
    });
  }, [onDive]);

  useEffect(() => (): void => clearTimeout(fadeTimer.current), []);

  return [container, state.preview, setPreview, surface];
}

const Blocks: React.FC<Omit<Props, 'status'>> = ({
  blocks,
  blocksDeep,
  activeMain = null,
  activeSub = null,
  onHover,
  onClick,
}) => {
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
      {preview.open && <Styled.Expander data-testid="preview" {...preview} />}
      {blocks && !blocksDeep && (
        <InfiniteBox
          flex={1}
          flow={blocks.box.flow}
          blocks={blocks}
          isDeep={false}
          activeMain={activeMain}
          activeSub={activeSub}
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
          onHover={onHover}
          setPreview={surface}
        />
      )}
    </Styled.BoxContainer>
  );
};

const BlocksMemo = React.memo(Blocks);

export const BlockPacker: React.FC<Props> = ({ status, ...props }) => (
  <Styled.Container>
    <BlocksMemo {...props} />
    <Styled.StatusBar data-testid="status-bar">{status}</Styled.StatusBar>
  </Styled.Container>
);
