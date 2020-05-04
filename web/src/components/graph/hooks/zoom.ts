import React, { useReducer, useMemo, useEffect } from 'react';
import { throttle } from 'throttle-debounce';

import { NULL } from '~client/modules/data';
import { GRAPH_ZOOM_SPEED } from '~client/constants/graph';
import { genPixelCompute, pointVisible } from '~client/components/graph/helpers';
import { Dimensions, Range, RangeX, Calc, Line } from '~client/types/graph';

const threshold = 4;

const pointsVisible = (lines: Line[]): boolean => lines.some(({ data }) => data.length > threshold);

export type ZoomedDimensions = Range & {
  tickSizeY?: number;
};

export type ZoomEffect = (
  zoomedLines?: Line[],
  zoomedMinX?: number,
  zoomedMaxX?: number,
) => ZoomedDimensions;

function getZoomedLines(lines: Line[], minX: number, maxX: number): Line[] {
  const zoomedLines = lines.map(({ data, ...rest }) => ({
    data: data.filter(
      ([xValue], index) =>
        pointVisible(xValue, minX, maxX) ||
        (index < data.length - 1 && pointVisible(data[index + 1][0], minX, maxX)) ||
        (index > 0 && pointVisible(data[index - 1][0], minX, maxX)),
    ),
    ...rest,
  }));

  if (!pointsVisible(zoomedLines)) {
    return lines;
  }

  return zoomedLines;
}

function getZoomedRange(
  position: number,
  zoomedWidth: number,
  { minX, maxX }: RangeX,
): [number, number] {
  let zoomedMinX = position - zoomedWidth / 2;
  let zoomedMaxX = position + zoomedWidth / 2;
  if (zoomedMinX < minX) {
    zoomedMaxX += minX - zoomedMinX;
    zoomedMinX = minX;
  } else if (zoomedMaxX > maxX) {
    zoomedMinX -= zoomedMaxX - maxX;
    zoomedMaxX = maxX;
  }

  return [Math.max(minX, Math.round(zoomedMinX)), Math.min(maxX, Math.round(zoomedMaxX))];
}

type ZoomState = {
  disabled?: boolean;
  valX?: (p: number) => number;
  zoomEffect?: ZoomEffect;
  graphRef: React.MutableRefObject<HTMLDivElement | null>;
  fullWidth: number;
  calc: Calc;
  lines: Line[];
  lastLines: Line[];
  dimensions: Dimensions;
  lastDimensions: Dimensions;
  level: number;
  position: number;
  zoomedLines: Line[];
  zoomedDimensions: Dimensions;
};

enum ActionType {
  Wheel,
  SetPosition,
  Reset,
}

type WheelAction = {
  type: ActionType.Wheel;
  deltaY: number;
};

type SetPositionAction = {
  type: ActionType.SetPosition;
  clientX: number;
};

type ResetAction = {
  type: ActionType.Reset;
  disabled: boolean;
  dimensions: Dimensions;
  lines: Line[];
  calc: Calc;
  zoomEffect: ZoomEffect;
  graphRef: ZoomState['graphRef'];
};

type Action = WheelAction | SetPositionAction | ResetAction;

const init = (
  state: ZoomState,
  { disabled, dimensions, lines, calc, zoomEffect, graphRef }: ResetAction,
): ZoomState => ({
  ...state,
  disabled,
  valX: calc && calc.valX,
  zoomEffect,
  graphRef,
  fullWidth: dimensions.maxX - dimensions.minX,
  lastLines: lines,
  lastDimensions: dimensions,
  level: 0,
  position: 0,
  zoomedLines: lines,
  zoomedDimensions: dimensions,
});

function onWheel(state: ZoomState, { deltaY }: WheelAction): ZoomState {
  if (state.disabled || !state.zoomEffect || !state.graphRef.current || !deltaY) {
    return state;
  }

  const level = Math.max(0, state.level - deltaY / Math.abs(deltaY));
  const position = state.position;

  if (!position) {
    return state;
  }

  const zoomedWidth = state.fullWidth * (1 - GRAPH_ZOOM_SPEED) ** level;

  const [zoomedMinX, zoomedMaxX] = getZoomedRange(position, zoomedWidth, state.lastDimensions);

  const zoomedLines = getZoomedLines(state.lastLines, zoomedMinX, zoomedMaxX);

  const nextZoomedDimensions = state.zoomEffect(zoomedLines, zoomedMinX, zoomedMaxX);

  if (
    nextZoomedDimensions.minX === state.zoomedDimensions.minX &&
    nextZoomedDimensions.maxX === state.zoomedDimensions.maxX
  ) {
    return state;
  }

  const zoomedDimensions = { ...state.zoomedDimensions, ...nextZoomedDimensions };

  return {
    ...state,
    level,
    zoomedLines,
    zoomedDimensions,
  };
}

function reducer(state: ZoomState, action: Action): ZoomState {
  if (action.type === ActionType.Reset) {
    return init(state, action);
  }
  if (action.type === ActionType.SetPosition) {
    return {
      ...state,
      position: state.valX
        ? state.valX(action.clientX - (state.graphRef.current?.offsetLeft ?? 0))
        : state.position,
    };
  }
  if (action.type === ActionType.Wheel) {
    return onWheel(state, action);
  }
  return state;
}

type ZoomProps = {
  dimensions: Dimensions;
  lines: Line[];
  isMobile?: boolean;
  graphRef: ZoomState['graphRef'];
  calc: Calc;
  setCalc: (next: Calc) => void;
  zoomEffect?: ZoomEffect;
};

type OnWheel = (evt: WheelEvent) => void;

export function useZoom({
  dimensions,
  lines,
  isMobile,
  graphRef,
  calc,
  setCalc,
  zoomEffect,
}: ZoomProps): [Line[], Dimensions] {
  const disabled = isMobile || !zoomEffect;

  const [state, dispatch] = useReducer(reducer, {
    dimensions,
    lastDimensions: dimensions,
    zoomedDimensions: dimensions,
    lines,
    lastLines: lines,
    calc,
    zoomEffect,
    graphRef,
    fullWidth: 0,
    level: 0,
    position: 0,
    zoomedLines: [],
  });

  useEffect(() => {
    if (
      (disabled && !state.disabled) ||
      lines !== state.lastLines ||
      dimensions !== state.lastDimensions
    ) {
      const nextCalc = genPixelCompute(dimensions);
      dispatch({
        type: ActionType.Reset,
        disabled,
        dimensions,
        lines,
        calc: nextCalc,
        zoomEffect,
        graphRef,
      } as ResetAction);
      setCalc(nextCalc);
    }
  }, [
    disabled,
    state.disabled,
    state.lastLines,
    state.lastDimensions,
    setCalc,
    dimensions,
    lines,
    calc,
    zoomEffect,
    graphRef,
  ]);

  useEffect(() => {
    setCalc(genPixelCompute(state.zoomedDimensions));
  }, [setCalc, state.zoomedLines, state.zoomedDimensions]);

  const onWheelThrottled = useMemo<OnWheel>(() => {
    if (disabled) {
      return NULL;
    }

    const handler = throttle(10, ({ deltaY }: WheelEvent) =>
      dispatch({
        type: ActionType.Wheel,
        deltaY,
      }),
    );

    return (evt: WheelEvent): void => {
      evt.preventDefault();
      handler(evt);
    };
  }, [disabled]);

  const onMouseMoveThrottled = useMemo(
    () =>
      throttle(10, ({ clientX }: MouseEvent) => {
        dispatch({ type: ActionType.SetPosition, clientX });
      }),
    [],
  );

  useEffect(() => {
    let lastRef: HTMLElement | null;
    setImmediate(() => {
      if (graphRef.current && onWheelThrottled !== NULL) {
        graphRef.current.addEventListener<'mousemove'>('mousemove', onMouseMoveThrottled);
        graphRef.current.addEventListener<'wheel'>('wheel', onWheelThrottled);
      }
      lastRef = graphRef.current;
    });

    return (): void => {
      if (lastRef) {
        lastRef.removeEventListener('wheel', onWheelThrottled);
        lastRef.removeEventListener('mousemove', onMouseMoveThrottled);
      }
    };
  }, [graphRef, onWheelThrottled, onMouseMoveThrottled]);

  return [state.zoomedLines, state.zoomedDimensions];
}
