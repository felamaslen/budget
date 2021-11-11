import * as Styled from './styles';

export const LogoOverview: React.FC = () => (
  <svg viewBox="0 0 100 100">
    <Styled.StrokedPath strokeWidth={5} d={`M16,45 l22,12 l22,-24 l20,-16`} />
    <Styled.FilledPath as="circle" cx={16} cy={45} r={8} />
    <Styled.FilledPath as="circle" cx={38} cy={57} r={8} />
    <Styled.FilledPath as="circle" cx={60} cy={33} r={8} />
    <Styled.FilledPath as="circle" cx={80} cy={17} r={8} />
    <Styled.FilledPath d={`M8,100 h16 v-36 h-16`} />
    <Styled.FilledPath d={`M30,100 h16 v-32 h-16`} />
    <Styled.FilledPath d={`M52,100 h16 v-48 h-16`} />
    <Styled.FilledPath d={`M74,100 h16 v-64 h-16`} />
  </svg>
);
