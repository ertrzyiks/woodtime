import React from 'react';

import MissingCheckpointsArea from './MissingCheckpointsArea';

export default {
  title: 'Components/MissingCheckpointsArea',
  component: MissingCheckpointsArea,
}

interface Args {
  scoredIds: number[],
  max: number
}

export const Default = (args: Args) => <MissingCheckpointsArea {...args} />

Default.args = {
  scoredIds: [2, 3, 4],
  max: 12
}
