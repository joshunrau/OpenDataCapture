import type React from 'react';
import { useState } from 'react';

export type RootProps = {
  [key: string]: never;
};

export const Root: React.FC<RootProps> = () => {
  const [count, setCount] = useState(0);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};
