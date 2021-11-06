import React from 'react';

import CheckpointCard from './CheckpointCard';

export default {
  title: 'Components/CheckpointCard',
  component: CheckpointCard,
}

const noop = () => {}
const checkpoint = {
  id: 1,
  skipped: false,
  cp_id: 12,
  cp_code: 'AUG'
}

export const Default = () => <CheckpointCard checkpoint={checkpoint} onDelete={noop} eventId={1} />;
export const Skipped = () => (
  <CheckpointCard checkpoint={{...checkpoint, skipped: true}} eventId={1} onDelete={noop} />
);
