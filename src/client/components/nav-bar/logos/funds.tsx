import * as Styled from './styles';

export const LogoFunds: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.StrokedPath
      d={[
        'M5,95',
        'h90',
        'm-45,0',
        'v-34',
        'm0,34',
        'c0,-24 12,-24 36,-24',
        'c0,24 -12,24 -36,24',
        'c0,-24 -12,-24 -36,-24',
        'c0,24 12,24 36,24',
      ].join(' ')}
      strokeLinecap="round"
      strokeWidth={4}
    />
    <Styled.StrokedPath as="circle" cx={50} cy={32} r={28} strokeWidth={5} />
    <Styled.StrokedPath
      d={[
        'M 56,21',
        'a 4,4 0,1,0 -12,4',
        'c 5,9 2,16 -4,20',
        'c 6,-5 10,5 17,-1',
        'm -15,-12',
        'h10',
      ].join(' ')}
      strokeLinecap="round"
      strokeWidth={5}
    />
  </svg>
);
