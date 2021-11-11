import type { Props } from './types';

export const LogoOverview: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <path stroke={color} strokeWidth={5} fill="none" d={`M8,45 L30,57 L52,33 L72,17`} />
    <path fill={color} d={`M0,100 L16,100 L16,64 L0,64`} />
    <circle cx={8} cy={45} r={8} fill={color} />
    <path fill={color} d={`M22,100 L38,100 L38,76 L22,76`} />
    <circle cx={30} cy={57} r={8} fill={color} />
    <path fill={color} d={`M44,100 L60,100 L60,52 L44,52`} />
    <circle cx={52} cy={33} r={8} fill={color} />
    <path fill={color} d={`M66,100 L82,100 L82,36 L66,36`} />
    <circle cx={72} cy={17} r={8} fill={color} />
  </svg>
);
