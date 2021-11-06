import React from 'react';

import LinearProgressWithLabel from './LinearProgressWithLabel';

export default {
  title: 'Components/LinearProgressWithLabel',
  component: LinearProgressWithLabel,
}

export const Default = () => <LinearProgressWithLabel current={10} max={12} />;
export const Empty = () => (
  <LinearProgressWithLabel current={0} max={12} />
);
export const Full = () => (
  <LinearProgressWithLabel current={12} max={12} />
);
