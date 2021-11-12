import React from 'react';
import { MemoryRouter } from 'react-router-dom'

import EventList from './EventList';
import getMockedServerDecorator from "../../support/storybook/decorators/getMockedServerDecorator";
import realServerDecorator from "../../support/storybook/decorators/realServerDecorator";

export default {
  title: 'Pages/EventList',
  component: EventList,
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter initialEntries={['/events']} initialIndex={0}>
        <Story />
      </MemoryRouter>
    )
  ]
}

export const Mocked = () => (
  <EventList />
);

Mocked.decorators = [getMockedServerDecorator()]

export const RealServer = () => (
  <EventList />
);

RealServer.decorators = [realServerDecorator]
