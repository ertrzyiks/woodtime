import * as React from 'react';

import Participants from './Participants';
import {MemoryRouter} from "react-router-dom";

export default {
  title: 'Components/Participants',
  component: Participants,
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter initialEntries={['/']} initialIndex={0}>
        <Story />
      </MemoryRouter>
    )
  ]
}

interface Args {
  list: {id: string, name: string}[]
  eventId: number
}

export const Default = (args: Args) => <Participants {...args} />

Default.args = {
  list: [
    { id: 1, name: 'John' },
    { id: 2, name: 'Alice' },
  ],
  eventId: 12
}
