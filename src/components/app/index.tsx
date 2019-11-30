import * as React from 'react';

export default function App() {
  const [color, setColor] = React.useState<boolean>(false);
  const timer = React.useRef<number>();
  React.useEffect(() => {
    timer.current = window.setInterval(() => setColor(last => !last), 1000);

    return () => clearInterval(timer.current);
  }, []);

  return (
    <div
      style={{
        color: color ? 'orange' : 'hotpink',
      }}
    >
      <h1>Hello world</h1>
    </div>
  );
}
