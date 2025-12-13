import EventInvitePage from './EventInvitePage';
import { MemoryRouter, Route } from 'react-router-dom';
import AppShell from '../../AppShell';
import { Story } from '@storybook/react';

export default {
  title: 'Pages/EventInvitePage',
  component: EventInvitePage,
  argTypes: {
    type: {
      table: {
        disable: true,
      },
    },
  },
};

interface MockEventArgs {
  name: string;
  type: number;
  checkpoint_count: number;
  checkpoints: { cp_id: string; cp_code: string }[];
  participants: { id: number; name: string }[];
}

const MockTemplate: Story<MockEventArgs> = ({ store, ...args }: any) => {
  store.set('Event', '1', { id: '1', ...args });
  store.set('Query', 'ROOT', 'me', {
    id: '1',
    friends: [
      { id: '2', name: 'Tom' },
      { id: '3', name: 'Alice' },
    ],
  });

  return (
    <MemoryRouter initialEntries={['/events/1/invite']} initialIndex={0}>
      <AppShell>
        <Route path="/events/:id/invite">
          <EventInvitePage key={Math.random()} />
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

export const Mocked = {
  render: (args: MockEventArgs, { loaded }) => (
    <MockTemplate {...args} store={loaded.store} />
  ),
  args: {
    ...MockTemplate.args,
    name: 'Classic event',
    type: 1,
  },
};

export const RealServer = ({ eventId }: { eventId: number }) => (
  <MemoryRouter initialEntries={[`/events/${eventId}`]} initialIndex={0}>
    <AppShell>
      <Route path="/events/:id">
        <EventInvitePage key={eventId} />
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
