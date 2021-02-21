import React, { useEffect, useRef, useState } from 'react';

import { joinLinePath, LineDescription } from '~client/components/graph';

function getSectorPath(r: number, startAngle: number, slice: number): string {
  const arcBegin = [r * (1 + Math.cos(startAngle)), r * (1 + Math.sin(startAngle))];
  const arcEnd = [r * (1 + Math.cos(startAngle + slice)), r * (1 + Math.sin(startAngle + slice))];

  return joinLinePath([
    {
      type: 'M',
      args: [[r, r]],
    },
    {
      type: 'L',
      args: [arcBegin],
    },
    {
      type: 'A',
      args: [[r, r], [0, slice > Math.PI ? 1 : 0, 1], arcEnd],
    },
    {
      type: 'L',
      args: [[r, r]],
    },
  ] as LineDescription);
}

type Props = {
  size: number;
  startAngle?: number;
  isAnimated?: boolean;
  slice: number;
  color: string;
};

const ANIMATION_DURATION = 640;
const ANIMATION_FPS = 60;

const stepTime = 1000 / ANIMATION_FPS;
const numSteps = ANIMATION_DURATION / stepTime;

type SVGProps = Pick<Props, 'color' | 'size' | 'slice' | 'startAngle'>;

const PieSVG: React.FC<SVGProps> = ({ color, size, slice, startAngle = 0 }) => (
  <svg width={size} height={size}>
    <g>
      <circle cx={size / 2} cy={size / 2} r={size / 2} stroke={color} fill="none" />
      <path
        d={getSectorPath(size / 2, startAngle - Math.PI / 2, slice)}
        stroke="none"
        fill={color}
      />
    </g>
  </svg>
);

const PieAnimated: React.FC<Omit<Props, 'isAnimated'>> = (props) => {
  const { startAngle = 0, slice } = props;
  const [state, setState] = useState<{ start: number; slice: number }>({
    start: startAngle,
    slice: 0,
  });

  const timer = useRef<number>(0);

  const lastStart = useRef<number>(startAngle);
  const lastSlice = useRef<number>(0);

  useEffect(() => {
    clearTimeout(timer.current);

    const stepDiffStart = (startAngle - lastStart.current) / numSteps;
    const stepDiffSlice = (slice - lastSlice.current) / numSteps;

    lastStart.current = startAngle;
    lastSlice.current = slice;

    const animate = (step = 0): void => {
      timer.current = window.setTimeout(() => {
        setState((last) => ({
          start: last.start + stepDiffStart,
          slice: last.slice + stepDiffSlice,
        }));

        if (step < numSteps - 1) {
          animate(step + 1);
        } else {
          setState({ start: startAngle, slice });
        }
      }, stepTime);
    };

    animate();

    return (): void => {
      clearTimeout(timer.current);
    };
  }, [startAngle, slice]);

  useEffect(
    () => (): void => {
      clearTimeout(timer.current);
    },
    [],
  );

  return <PieSVG {...props} slice={state.slice} startAngle={state.start} />;
};

export const Pie: React.FC<Props> = ({ isAnimated = true, ...props }) => {
  if (isAnimated) {
    return <PieAnimated {...props} />;
  }
  return <PieSVG {...props} />;
};
