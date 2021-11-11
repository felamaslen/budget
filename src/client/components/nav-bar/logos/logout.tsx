import type { Props } from './types';

export const LogoLogout: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <path
      d={[
        'M15,50',
        'l16,-24',
        'h26',
        'l10,12',
        'v16',
        'h20',
        'v8',
        'h-28',
        'v-8',
        'l-12,16',
        'l12,12',
        'v19',
        'h-8',
        'v-16',
        'l-13,-13',
        'v14',
        'h-28',
        'v-6',
        'h22',
        'v-20',
        'l19,-27',
        'h-17',
        'l-14,20',
      ].join(' ')}
      fill={color}
    />
    <circle cx={73} cy={22} r={10} fill={color} />
  </svg>
);
