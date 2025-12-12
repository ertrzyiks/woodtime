import { useRef } from 'react';

import EventPage from './EventPage';
import { MemoryRouter, Route } from 'react-router-dom';
import AppShell from '../../AppShell';
import getMockedApolloClient from '../../support/storybook/getMockedApolloClient';
import { Story } from '@storybook/react';

export default {
  title: 'Pages/EventPage',
  component: EventPage,
  argTypes: {
    type: {
      table: {
        disable: true,
      },
    },
  },
};

interface MockCheckpoint {
  cp_id: string;
  cp_code?: string;
  skipped?: boolean;
  skip_reason?: string;
}

interface MockEventArgs {
  name: string;
  type: number;
  checkpoint_count: number;
  checkpoints: MockCheckpoint[];
  participants: { id: number; name: string }[];
}

const MockTemplate: Story<MockEventArgs> = ({ store, ...args }: any) => {
  console.log('STOR', store);

  console.log('------ Setting up event with args:', args);
  store.set('Event', '1', { id: '1', ...args });
  store.set('EventDocument', '1', {
    id: '1',
    name: args.name,
    type: args.type,
    checkpoint_count: args.checkpoint_count,
  });

  return (
    <MemoryRouter initialEntries={['/events/1']} initialIndex={0}>
      <AppShell>
        <Route path="/events/:id">
          <EventPage key={Math.random()} />
        </Route>
      </AppShell>
    </MemoryRouter>
  );
};

MockTemplate.args = {
  name: 'Event',
  type: 1,
  checkpoint_count: 12,
  participants: [
    { id: 1, name: 'Adam' },
    { id: 2, name: 'Zoe' },
  ],
  checkpoints: [
    { cp_id: '1', cp_code: 'LOR' },
    { cp_id: '2', cp_code: 'EM' },
  ],
};

export const Classic = {
  render: (args: MockEventArgs, { loaded }) => (
    <MockTemplate {...args} store={loaded.store} />
  ),
  args: {
    ...MockTemplate.args,
    name: 'Classic event',
    type: 2,
  },
};

export const ScoreLauf = {
  render: (args: MockEventArgs, { loaded }) => (
    <MockTemplate {...args} store={loaded.store} />
  ),
  args: {
    ...MockTemplate.args,
    name: 'ScoreLauf event',
    type: 1,
  },
};

export const ScoreLaufSkippedCheckpoints = {
  render: (args: MockEventArgs, { loaded }) => (
    <MockTemplate {...args} store={loaded.store} />
  ),
  args: {
    ...MockTemplate.args,
    name: 'ScoreLauf event with skipped checkpoints',
    type: 1,
    checkpoints: [
      { cp_id: '1', cp_code: 'LOR' },
      { cp_id: '2', skipped: true, skip_reason: '' },
    ],
  },
};

export const Virtual = {
  render: (args: MockEventArgs, { loaded }) => (
    <MockTemplate {...args} store={loaded.store} />
  ),
  args: {
    ...MockTemplate.args,
    name: 'Virtual event',
    type: 3,
  },
};

export const RealServer = ({ eventId }: { eventId: number }) => (
  <MemoryRouter initialEntries={[`/events/${eventId}`]} initialIndex={0}>
    <AppShell>
      <Route path="/events/:id">
        <EventPage key={eventId} />
      </Route>
    </AppShell>
  </MemoryRouter>
);

RealServer.args = {
  eventId: 1,
};

RealServer.parameters = {
  chromatic: { disableSnapshot: true },
  msw: { handlers: [] },
};
