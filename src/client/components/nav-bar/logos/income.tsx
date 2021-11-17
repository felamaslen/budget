import * as Styled from './styles';

export const LogoIncome: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.StrokedPath
      d={[
        'M 6,50',
        'h11',
        'a2,2 0,0,1 2,2',
        'v41',
        'a2,2 0,0,1 -2,2',
        'l -11,0',
        'a2,2 0,0,1 -2,-2',
        'v-41',
        'a2,2 0,0,1 2,-2',
        'z',
      ].join(' ')}
      strokeWidth={4}
    />
    <Styled.StrokedPath
      d={[
        'M 19,64',
        'A 40,40 0,0,1 45,72',
        'C 62,72 64,73 64,78',
        'M 40,80',
        'L 70,80',
        'C 75,80 75,78 84,73',
        'A 5,5 0,0,1 90,80',
        'C 90,80 84,92 55,95',
        'C 45,95 24,88 19,84',
      ].join(' ')}
      strokeLinecap="round"
      strokeWidth={4}
    />
    <Styled.StrokedPath
      d={[
        'M 28,58',
        'a 28,30 0,1,1 52,7',
        'm -32,-44',
        'l -4,-13',
        'a 2,2 0,0,1 2,-2',
        'c 6,2 14,-4 20,0',
        'l -6,15',
      ].join(' ')}
      strokeLinecap="round"
      strokeWidth={4}
    />
    <Styled.StrokedPath
      d={[
        'M 62,38',
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
