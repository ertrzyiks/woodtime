import React from 'react';
import AppShell from '../../AppShell';
import { MemoryRouter } from "react-router-dom";

import MissingCheckpointsArea from './MissingCheckpointsArea';

export default {
  title: 'Components/MissingCheckpointsArea',
  component: MissingCheckpointsArea,
}

interface Args {
  scoredIds: number[],
  max: number
}

export const Default = (args: Args) =>  <MemoryRouter initialEntries={['/events/99/invite']} initialIndex={0}><AppShell><MissingCheckpointsArea {...args} /></AppShell></MemoryRouter>

Default.args = {
  scoredIds: [2, 3, 4],
  max: 12
}
