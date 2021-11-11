import * as Styled from './styles';

const radius = 38;
const arcInitialAngle = (5 * Math.PI) / 7;
const arcFinalAngle = (16 * Math.PI) / 9;

function rotatePoint(x: number, y: number, theta: number): [number, number] {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);

  return [x * cos - y * sin, x * sin + y * cos];
}

export const LogoPlanning: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.FilledPath
      as="circle"
      cx={50 + radius * Math.cos(Math.PI / 7)}
      cy={50 + radius * Math.sin(Math.PI / 7)}
      r={5}
    />
    <Styled.FilledPath
      as="circle"
      cx={50 + radius * Math.cos((2 * Math.PI) / 7)}
      cy={50 + radius * Math.sin((2 * Math.PI) / 7)}
      r={5}
    />
    <Styled.FilledPath
      as="circle"
      cx={50 + radius * Math.cos((3 * Math.PI) / 7)}
      cy={50 + radius * Math.sin((3 * Math.PI) / 7)}
      r={5}
    />
    <Styled.FilledPath
      as="circle"
      cx={50 + radius * Math.cos((4 * Math.PI) / 7)}
      cy={50 + radius * Math.sin((4 * Math.PI) / 7)}
      r={5}
    />
    <Styled.StrokedPath
      d={[
        'M',
        50 + radius * Math.cos(arcInitialAngle),
        50 + radius * Math.sin(arcInitialAngle),
        'A',
        radius,
        radius,
        '0,1,1',
        50 + radius * Math.cos(arcFinalAngle),
        50 + radius * Math.sin(arcFinalAngle),
      ].join(' ')}
      strokeWidth={10}
    />
    <Styled.FilledPath
      d={[
        'M',
        50 + radius * Math.cos(arcFinalAngle),
        50 + radius * Math.sin(arcFinalAngle),
        'l',
        ...rotatePoint(0, 15, arcFinalAngle - Math.PI / 2),
        'l',
        ...rotatePoint(-24, -15, arcFinalAngle - Math.PI / 2),
        'l',
        ...rotatePoint(24, -15, arcFinalAngle - Math.PI / 2),
        'l',
        ...rotatePoint(0, 15, arcFinalAngle - Math.PI / 2),
      ].join(' ')}
    />
    <Styled.StrokedPath
      d={[
        'M',
        50 + radius * 0.5 * Math.cos((3 * Math.PI) / 2),
        50 + radius * 0.5 * Math.sin((3 * Math.PI) / 2),
        'L 50,50',
        'l',
        radius * 0.4 * Math.cos(Math.PI / 5),
        radius * 0.4 * Math.sin(Math.PI / 5),
      ].join(' ')}
      strokeLinecap="round"
      strokeWidth={8}
    />
  </svg>
);
