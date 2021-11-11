import * as Styled from './styles';

export const LogoHoliday: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.FilledPath
      d={[
        'M5,58',
        'a2,2 0,0,1 3,-2',
        'l16,3',
        'c 0,0 53,-36, 60,-28',
        'c 4,10 -40,30 -55,39',
        'C 24,72 12,68 5,58',
        'm32,-4',
        'l-21,-18',
        'l5,-2',
        'l36,11',
      ].join(' ')}
    />
    <Styled.StrokedPath d="M10,90 h48" fill="none" strokeLinecap="round" strokeWidth={6} />
    <Styled.FilledPath as="circle" cx={47} cy={69} r={5} />
    <Styled.FilledPath as="circle" cx={61} cy={62} r={5} />
  </svg>
);
