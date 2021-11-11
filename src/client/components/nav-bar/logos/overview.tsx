import type { Props } from './types';

export const LogoOverview: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <path stroke={color} strokeWidth={5} fill="none" d={`M16,45 l22,12 l22,-24 l20,-16`} />
    <circle cx={16} cy={45} r={8} fill={color} />
    <circle cx={38} cy={57} r={8} fill={color} />
    <circle cx={60} cy={33} r={8} fill={color} />
    <circle cx={80} cy={17} r={8} fill={color} />
    <path fill={color} d={`M8,100 h16 v-36 h-16`} />
    <path fill={color} d={`M30,100 h16 v-32 h-16`} />
    <path fill={color} d={`M52,100 h16 v-48 h-16`} />
    <path fill={color} d={`M74,100 h16 v-64 h-16`} />
  </svg>
);
