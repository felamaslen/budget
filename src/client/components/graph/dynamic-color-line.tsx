import { getDynamicLinePaths } from '~client/components/graph/helpers';
import { RangeY, Pix, Data, PathProps, DynamicLineColor, GraphStack } from '~client/types/graph';

type Props = {
  fill?: boolean;
  data: Data;
  stack?: GraphStack;
  smooth?: boolean;
  color: DynamicLineColor;
  pathProps: PathProps;
} & RangeY &
  Pix;

export const DynamicColorLine: React.FC<Props> = ({
  fill,
  data,
  smooth,
  color,
  pathProps,
  ...props
}) => {
  if (props.minY === props.maxY) {
    return null;
  }
  if (fill) {
    throw new Error('Dynamically coloured, filled graph not implemented');
  }

  return (
    <>
      {getDynamicLinePaths({
        data,
        smooth,
        color,
        ...props,
      }).map(({ path, stroke }, key) => (
        <path key={key} d={path} stroke={stroke} {...pathProps} fill="none" />
      ))}
    </>
  );
};
