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
      args: [[r, r], [0, 0, 1], arcEnd],
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
  slice: number;
  color: string;
};

const ANIMATION_DURATION = 640;
const ANIMATION_FPS = 60;

const stepTime = 1000 / ANIMATION_FPS;
const numSteps = ANIMATION_DURATION / stepTime;

export const Pie: React.FC<Props> = ({ size, startAngle = 0, slice, color }) => {
  const offsetAngle = startAngle - Math.PI / 2; // start from the top of the circle
  const [state, setState] = useState<{ start: number; slice: number }>({
    start: offsetAngle,
    slice: 0,
  });

  const timer = useRef<number>(0);

  const lastStart = useRef<number>(offsetAngle);
  const lastSlice = useRef<number>(0);

  useEffect(() => {
    clearTimeout(timer.current);

    const stepDiffStart = (offsetAngle - lastStart.current) / numSteps;
    const stepDiffSlice = (slice - lastSlice.current) / numSteps;

    lastStart.current = offsetAngle;
    lastSlice.current = slice;

    const animate = (step = 0): void => {
      timer.current = setTimeout(() => {
        setState((last) => ({
          start: last.start + stepDiffStart,
          slice: last.slice + stepDiffSlice,
        }));

        if (step < numSteps - 1) {
          animate(step + 1);
        } else {
          setState({ start: offsetAngle, slice });
        }
      }, stepTime);
    };

    animate();
    return (): void => {
      clearTimeout(timer.current);
    };
  }, [offsetAngle, slice]);

  useEffect(
    () => (): void => {
      clearTimeout(timer.current);
    },
    [],
  );

  return (
    <svg width={size} height={size}>
      <g>
        <circle cx={size / 2} cy={size / 2} r={size / 2} stroke={color} fill="none" />
        <path d={getSectorPath(size / 2, state.start, state.slice)} stroke="none" fill={color} />
      </g>
    </svg>
  );
};
