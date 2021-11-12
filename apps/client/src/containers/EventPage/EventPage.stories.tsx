import React from 'react';

import EventPage from './EventPage';
import { MemoryRouter, Route } from "react-router-dom";
import getMockedServerDecorator from "../../support/storybook/decorators/getMockedServerDecorator";
import realServerDecorator from "../../support/storybook/decorators/realServerDecorator";

export default {
  title: 'Pages/EventPage',
  component: EventPage,
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter initialEntries={['/events/1']} initialIndex={0}>
        <Story />
      </MemoryRouter>
    )
  ]
}

export const Mocked = () => (
  <Route path='/events/:id'>
    <EventPage />
  </Route>
);

Mocked.decorators = [getMockedServerDecorator()]

export const RealServer = () => (
  <Route path='/events/:id'>
    <EventPage />
  </Route>
);

RealServer.decorators = [realServerDecorator]
