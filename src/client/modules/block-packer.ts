import type { FlexFlow, FlexBlocks, WithArea, WithSubTree } from '~client/types';

type NodeRoot = {
  width: number;
  height: number;
  xPos: number;
  yPos: number;
};

type SimpleNode = Pick<NodeRoot, 'width' | 'height'>;

type Item = {
  total: number;
};

const isLandscape = (root: SimpleNode): boolean => root.width > root.height;

const getFlow = (width: number, height: number): FlexFlow => (width > height ? 'row' : 'column');

const getFilledWidth = (parent: SimpleNode, filledArea: number): number =>
  isLandscape(parent) ? filledArea / parent.height : parent.width;

const getFilledHeight = (parent: SimpleNode, filledArea: number): number =>
  isLandscape(parent) ? parent.height : filledArea / parent.width;

const getChildXPos = (parent: NodeRoot, filledWidth: number): number =>
  isLandscape(parent) ? parent.xPos + filledWidth : parent.xPos;

const getChildYPos = (parent: NodeRoot, filledHeight: number): number =>
  isLandscape(parent) ? parent.yPos : parent.yPos + filledHeight;

const getChildWidth = (parent: SimpleNode, filledWidth: number): number =>
  isLandscape(parent) ? parent.width - filledWidth : parent.width;

const getChildHeight = (parent: SimpleNode, filledHeight: number): number =>
  isLandscape(parent) ? parent.height : parent.height - filledHeight;

const getFlex = (parent: SimpleNode, filledWidth: number, filledHeight: number): number =>
  parent.width > parent.height
    ? (parent.width - filledWidth) / parent.width
    : (parent.height - filledHeight) / parent.height;

function worstPossibleAspectRatio(node: NodeRoot, areas: number[]): number {
  if (areas.length === 0) {
    return Infinity;
  }

  const childArea = areas.reduce<number>((sum, area) => sum + area, 0);

  if (node.width > node.height) {
    // wide, so fill the node from the left
    const childWidth = childArea / node.height;

    return areas.reduce<number>((last, area) => {
      const thisAspect = childWidth / (area / childWidth);
      return Math.max(last, Math.max(thisAspect, 1 / thisAspect));
    }, 0);
  }

  // tall, so fill the node from the bottom
  const childHeight = childArea / node.width;

  return areas.reduce<number>((last, area) => {
    const thisAspect = area / childHeight / childHeight;
    return Math.max(last, Math.max(thisAspect, 1 / thisAspect));
  }, 0);
}

function getChildNode<T extends Item>(
  parent: NodeRoot,
  filledAreas: number[],
): {
  node: NodeRoot;
  container: FlexBlocks<T>;
} {
  const totalFilledArea = filledAreas.reduce<number>((sum, area) => sum + area, 0);

  const filledWidth = getFilledWidth(parent, totalFilledArea);
  const filledHeight = getFilledHeight(parent, totalFilledArea);

  const width = getChildWidth(parent, filledWidth);
  const height = getChildHeight(parent, filledHeight);

  return {
    node: {
      width,
      height,
      xPos: getChildXPos(parent, filledWidth),
      yPos: getChildYPos(parent, filledHeight),
    },
    container: {
      box: {
        flex: getFlex(parent, filledWidth, filledHeight),
        flow: getFlow(width, height),
      },
    },
  };
}

function appendItems<T extends Item>(
  node: NodeRoot,
  itemsToFill: WithArea<WithSubTree<T>>[],
  childCount: number,
): FlexBlocks<T>['items'] {
  const nodeArea = node.width * node.height;

  const itemFlexesRelativeToNode = itemsToFill.map(({ area }) => area / nodeArea);

  const itemsFlex = itemFlexesRelativeToNode.reduce<number>((last, flex) => last + flex, 0);

  const itemFlexesRelativeToBox = itemFlexesRelativeToNode.map((flex) => flex / itemsFlex);

  const itemsWidth = getChildWidth(node, (1 - itemsFlex) * node.width);
  const itemsHeight = getChildHeight(node, (1 - itemsFlex) * node.height);

  const itemsNode = { width: itemsWidth, height: itemsHeight };

  const blocks = itemsToFill.map((child, index) => ({
    ...child,
    childCount: childCount + index,
    flex: itemFlexesRelativeToBox[index],
    subTree: child.subTree
      ? // eslint-disable-next-line @typescript-eslint/no-use-before-define
        blockPacker<T>(
          getChildWidth(itemsNode, (1 - itemFlexesRelativeToBox[index]) * itemsWidth),
          getChildHeight(itemsNode, (1 - itemFlexesRelativeToBox[index]) * itemsHeight),
          child.subTree,
        )
      : undefined,
  }));

  const itemsFlow = getFlow(itemsWidth, itemsHeight);

  return {
    box: {
      flex: itemsFlex,
      flow: itemsFlow,
    },
    blocks,
  };
}

function squarify<T extends Item>(
  node: NodeRoot,
  container: FlexBlocks<T>,
  itemsToFill: WithArea<WithSubTree<T>>[],
  filledAreas: number[] = [],
  childIndex = 0,
  childCount = 0,
): FlexBlocks<T> {
  if (!itemsToFill.length) {
    return { ...container, childIndex };
  }
  if (itemsToFill.length === 1 && filledAreas.length === 0) {
    return {
      ...container,
      childIndex,
      items: appendItems<T>(node, itemsToFill, childCount),
    };
  }

  const optimalReduction = itemsToFill.reduce<{
    reachedOptimum: boolean;
    areasToFill: number[];
    itemsAtThisLevel: WithArea<WithSubTree<T>>[];
    itemsToRecurse: WithArea<WithSubTree<T>>[];
  }>(
    (last, { area }, index) => {
      const nextAreas = [...last.areasToFill, area];
      if (!last.reachedOptimum) {
        if (
          worstPossibleAspectRatio(node, last.areasToFill) >=
          worstPossibleAspectRatio(node, nextAreas)
        ) {
          return {
            ...last,
            areasToFill: nextAreas,
          };
        }
        return {
          reachedOptimum: true,
          areasToFill: last.areasToFill,
          itemsAtThisLevel: itemsToFill.slice(0, index),
          itemsToRecurse: itemsToFill.slice(index),
        };
      }
      return last;
    },
    {
      reachedOptimum: false,
      areasToFill: [],
      itemsAtThisLevel: [],
      itemsToRecurse: [],
    },
  );

  const { areasToFill, itemsAtThisLevel, itemsToRecurse } = optimalReduction;

  const nextChild = getChildNode<T>(node, areasToFill);

  return {
    ...container,
    childIndex,
    items: appendItems<T>(node, itemsAtThisLevel, childCount),
    children: squarify<T>(
      nextChild.node,
      nextChild.container,
      itemsToRecurse,
      [],
      childIndex + 1,
      childCount + itemsAtThisLevel.length,
    ),
  };
}

export function blockPacker<T extends Item>(
  width: number,
  height: number,
  items: WithSubTree<T>[],
): FlexBlocks<T> {
  if (width <= 0 || height <= 0) {
    throw new Error('Width and height must be positive');
  }

  const totalArea = width * height;

  const withoutNegative = items
    .filter(({ total }) => total > 0)
    .map((item) => ({
      ...item,
      subTree: item.subTree?.filter(({ total }) => total > 0),
    }))
    .map((item) => ({
      ...item,
      total: item.subTree?.reduce<number>((last, subItem) => last + subItem.total, 0) ?? item.total,
    }));

  const totalValue = withoutNegative.reduce<number>((sum, { total }) => sum + total, 0);

  const itemsSorted: (T & { area: number })[] = withoutNegative
    .map<WithArea<T>>((item) => ({ ...item, area: (item.total / totalValue) * totalArea }))
    .sort(({ total: a }, { total: b }) => b - a);

  const rootNode: NodeRoot = {
    width,
    height,
    xPos: 0,
    yPos: 0,
  };

  const container: FlexBlocks<T> = {
    box: {
      flex: 1,
      flow: getFlow(width, height),
    },
    items: {
      box: {
        flex: 0,
        flow: getFlow(width, height),
      },
      blocks: [],
    },
  };

  return squarify<T>(rootNode, container, itemsSorted);
}
