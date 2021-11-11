import { readableColor } from 'polished';
import { CSSProperties, RefObject, useLayoutEffect, useRef, useState } from 'react';

import * as Styled from './styles';

import { defaultPadding, getPixY } from '~client/components/graph/helpers';
import type { HoverEffect, HLPoint, LabelProps } from '~client/components/graph/hooks';
import type { RangeY, Size, Calc } from '~client/types';

type Props = {
  hoverEffect: HoverEffect;
  hlPoint?: HLPoint;
  calc: Calc;
} & RangeY &
  Size;

const isLabelAtTop = (posY: number, height: number): boolean => posY > height / 2;

type SelfAdjustingLabelProps = Pick<LabelProps, 'width' | 'padding' | 'posX' | 'style'>;

export function useSelfAdjustingLabel(
  props: SelfAdjustingLabelProps,
): [RefObject<HTMLDivElement>, CSSProperties] {
  const ref = useRef<HTMLDivElement>(null);
  const { padding, posX, style = {}, width } = props;
  const [offsetX, setOffsetX] = useState<number>(0);

  useLayoutEffect(() => {
    const labelWidth = (ref as RefObject<HTMLDivElement>).current?.offsetWidth ?? 0;
    const spaceLeft = posX - padding[3] - labelWidth / 2;
    const spaceRight = width - padding[1] - posX - labelWidth / 2;
    if (spaceLeft < 0) {
      setOffsetX(-spaceLeft);
    } else if (spaceRight < 0) {
      setOffsetX(spaceRight);
    }
  }, [ref, posX, padding, width]);

  return [ref, { ...style, marginLeft: offsetX }];
}

export const HighlightPoint: React.FC<Props> = ({
  calc,
  minY,
  maxY,
  width,
  height,
  padding = defaultPadding,
  hoverEffect: { Label },
  hlPoint,
}) => {
  if (!hlPoint || maxY === minY) {
    return null;
  }

  const { main, color, secondary, compare } = hlPoint;

  const isComparing = compare && compare?.point[0] !== main.point[0];

  const pixXMain = calc.pixX(main.point[0]);
  const pixXCompare = compare ? calc.pixX(compare.point[0]) : pixXMain;

  const compareLeft = compare && compare.point[0] < main.point[0] ? compare : main;
  const compareRight = compare && compare.point[0] > main.point[0] ? compare : main;

  const pixY = getPixY(calc, secondary);
  const pixYLeft = Math.floor(pixY(compareLeft.point[1])) + 0.5;
  const pixYRight = Math.floor(pixY(compareRight.point[1])) + 0.5;
  if (Number.isNaN(pixYLeft) || Number.isNaN(pixYRight)) {
    return null;
  }

  const pixXLeft = Math.min(pixXMain, pixXCompare);
  const pixXRight = Math.max(pixXMain, pixXCompare);

  const labelPosX = Math.min(width - padding[1], Math.max(padding[3], (pixXLeft + pixXRight) / 2));

  const styleProps = { height, padding, width };
  const labelProps: LabelProps = {
    ...styleProps,
    isAtTop: isLabelAtTop((pixYLeft + pixYRight) / 2, height),
    main: compareLeft,
    secondary: !!secondary,
    name: hlPoint.group,
    color,
    textColor: readableColor(color),
    posX: labelPosX,
    style: { left: labelPosX },
  };

  return (
    <>
      <Styled.HighlightBackground
        {...styleProps}
        isComparing={!!isComparing}
        style={{ left: padding[3], width: pixXLeft - padding[3] }}
      />
      <Styled.LineVertical {...styleProps} style={{ left: pixXLeft }} />
      <Styled.Circle color={color} {...styleProps} style={{ left: pixXLeft, top: pixYLeft }} />
      <Styled.HighlightBackground
        {...styleProps}
        isComparing={!!isComparing}
        style={{ left: pixXRight, width: width - padding[1] - pixXRight }}
      />
      {!isComparing && <Label {...labelProps} />}
      {isComparing && (
        <>
          <Styled.LineVertical {...styleProps} style={{ left: pixXRight }} />
          <Styled.Circle
            color={color}
            {...styleProps}
            style={{ left: pixXRight, top: pixYRight }}
          />
          <Label {...labelProps} compare={compareRight} />
        </>
      )}
    </>
  );
};
