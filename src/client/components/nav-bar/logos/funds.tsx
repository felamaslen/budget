import type { Props } from './types';

export const LogoFunds: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <path
      d={[
        'M',
        10,
        84,
        'L',
        20,
        72,
        'L',
        30,
        79,
        'L',
        40,
        55,
        'L',
        50,
        47,
        'L',
        60,
        62,
        'L',
        70,
        67,
        'L',
        80,
        38,
        'L',
        90,
        25,
      ].join(' ')}
      stroke={color}
      strokeWidth={8}
      fill="none"
    />
  </svg>
);
