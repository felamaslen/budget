import type { Props } from './types';

export const LogoSocial: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <path
      d={[
        'M20,40',
        'a30,30 0,0,0 10,0',
        'v40',
        'a3,3 0,0,0 5,0',
        'v-40',
        'a30,30 0,0,0 10,0',
        'v40',
        'a3,3 0,0,0 5,0',
        'v-40',
        'a30,30 0,0,0 10,0',
        'v40',
        'a3,3 0,0,0 5,0',
        'v-40',
        'a30,30 0,0,0 10,0',
        'v44',
        'a10,10 0,0,1 -10,10',
        'h-35',
        'a10,10 0,0,1 -10,-10',
        'v-2',
        'h-5',
        'a12,12 0,0,1 -12,-12',
        'v-17',
        'a12,12 0,0,1 12,-12',
        'h5',
        'v5',
        'h-5',
        'a8,8 0,0,0 -8,8',
        'v15',
        'a8,8 0,0,0 8,8',
        'h5',
      ].join(' ')}
      fill={color}
    />
    <path
      d={[
        'M30,33',
        'a10,10 0,1,1 -4,-18',
        'a10,10 0,0,1 18,-3',
        'a12,12 0,0,1 16,2',
        'a20,20 0,0,1 6,1',
        'a11,11 0,1,1 0,18',
        'a20,20 0,0,1 -16,0',
        'a20,20 0,0,1 -22,0',
      ].join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={4}
    />
  </svg>
);
