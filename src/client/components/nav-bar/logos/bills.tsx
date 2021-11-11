import type { Props } from './types';

export const LogoBills: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <g fillRule="evenodd" fill={color}>
      <path
        d={[
          'M',
          10,
          8,
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
          'M 20,40 L53,40 L53,44 L20,44 L20,40',
          'M 20,52 L64,52 L64,56 L20,56 L20,52',
          'M 20,64 L64,64 L64,68 L20,68 L20,64',
          'z',
        ].join(' ')}
      />
    </g>
  </svg>
);
