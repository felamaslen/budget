import type { Props } from './types';

export const LogoIncome: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <path
      d={[
        'M',
        10,
        25,
        'C',
        30,
        14,
        70,
        36,
        90,
        25,
        'L',
        90,
        75,
        'C',
        70,
        90,
        30,
        64,
        10,
        75,
        'L',
        10,
        25,
      ].join(' ')}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth={6}
    />
    <path
      d={['M', 66, 36, 'C', 68, 36, 72, 38, 78, 36].join(' ')}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth={4}
    />
    <path
      d={['M', 34, 64, 'C', 32, 64, 28, 62, 22, 64].join(' ')}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth={4}
    />
    <path
      d={[
        'M',
        56,
        40,
        'C',
        56,
        38,
        48,
        30,
        42,
        38,
        'C',
        36,
        45,
        50,
        58,
        44,
        62,
        'l',
        15,
        3,
        'M',
        53,
        51,
        'l',
        -15,
        -3,
      ].join(' ')}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeWidth={4}
    />
  </svg>
);
