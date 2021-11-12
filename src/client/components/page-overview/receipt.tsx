import { colors } from '~client/styled/variables';

export const Receipt: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <path
      d={[
        'M35,5',
        'h45',
        'a6,8 0,0,1 0,16',
        'm0,-16',
        'c0,70 0,85 -30,80',
        'm10,0',
        'c0,-10 -10,-10 -11,5',
        'c0,6 -5,10 -20,8',
        'c-45,-2 -17,0 -20,-10',
        'c-3,-15 10,-10 46,-10',
        'm-40,-1',
        'c10,-20 -10,-72 20,-72',
        'm-5,13',
        'h13',
        'm-13,8',
        'h37',
        'm-37,8',
        'h37',
        'm-37,8',
        'h37',
        'm-37,8',
        'h37',
        'm-37,8',
        'h37',
        'm-37,8',
        'h37',
      ].join(' ')}
      stroke={colors.black}
      strokeWidth={3}
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);
