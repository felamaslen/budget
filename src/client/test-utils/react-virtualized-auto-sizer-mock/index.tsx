type ChildProps = { height: number; width: number };

type Props = {
  children: (childProps: ChildProps) => React.ReactNode;
};

const height = 768;
const width = 1024;

const AutoSizerMock: React.FC<Props> = ({ children }) => <div>{children({ height, width })}</div>;

export default AutoSizerMock;
