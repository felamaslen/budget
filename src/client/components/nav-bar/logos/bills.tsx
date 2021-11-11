import type { Props } from './types';

export const LogoBills: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <g fillRule="evenodd" fill={color}>
      <path
        d={[
          'M',
          12,
          4,
          'l',
          12,
          10,
          'l',
          12,
          -10,
          'l',
          12,
          10,
          'l',
          12,
          -10,
          'l',
          12,
          10,
          'l',
          12,
          -10,
          'l',
          0,
          92,
          'l',
          -12,
          -10,
          'l',
          -12,
          10,
          'l',
          -12,
          -10,
          'l',
          -12,
          10,
          'l',
          -12,
          -10,
          'l',
          -12,
          10,
          'M 24,34 h33 v4 h-33 v-4',
          'M 24,46 h44 v4 h-44 v-4',
          'M 24,58 h44 v4 h-44 v-4',
          'z',
        ].join(' ')}
      />
    </g>
  </svg>
);
