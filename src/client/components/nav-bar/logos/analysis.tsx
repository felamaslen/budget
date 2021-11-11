import type { Props } from './types';

const handleAngle = (18 * Math.PI) / 24;

const cx = 56;
const cy = 44;
const r = 32;

const shineAngleStart = (13 * Math.PI) / 12;
const shineAngleEnd = (5 * Math.PI) / 3;

const shineRadius = r * 0.6;

export const LogoAnalysis: React.FC<Props> = ({ color }) => (
  <svg viewBox="0 0 100 100">
    <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={10} fill="none" />
    <path
      d={[
        'M',
        cx + r * 1.1 * Math.cos(handleAngle),
        cy + r * 1.1 * Math.sin(handleAngle),
        'l',
        30 * Math.cos(handleAngle),
        30 * Math.sin(handleAngle),
      ].join(' ')}
      stroke={color}
      strokeLinecap="round"
      strokeWidth={16}
      fill="none"
    />
    <path
      d={[
        'M',
        cx + shineRadius * Math.cos(shineAngleStart),
        cy + shineRadius * Math.sin(shineAngleStart),
        'A',
        shineRadius,
        shineRadius,
        '0,0,1',
        cx + shineRadius * Math.cos(shineAngleEnd),
        cy + shineRadius * Math.sin(shineAngleEnd),
      ].join(' ')}
      stroke={color}
      strokeLinecap="round"
      strokeWidth={8}
      fill="none"
    />
  </svg>
);
