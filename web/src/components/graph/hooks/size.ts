import { useContext } from 'react';
import { GRAPH_WIDTH } from '~client/constants/graph';
import { ResizeContext } from '~client/hooks';

export function useGraphWidth(graphWidth = GRAPH_WIDTH): number {
  const windowWidth = useContext(ResizeContext);
  return Math.min(windowWidth, graphWidth);
}
