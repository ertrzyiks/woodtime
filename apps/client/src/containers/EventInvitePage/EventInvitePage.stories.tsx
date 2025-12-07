import React, { useRef } from 'react';

import EventInvitePage from './EventInvitePage';
import { MemoryRouter, Route } from "react-router-dom";
import AppShell from '../../AppShell'
import getMockedApolloClient from "../../support/storybook/getMockedApolloClient";

export default {
  title: 'Pages/EventInvitePage',
  component: EventInvitePage,
  argTypes: {
    type: {
      table: {
        disable: true
      }
    }
  }
}

interface MockEventArgs {
  name: string
  type: number
  checkpoint_count: number
  checkpoints: { cp_id: string, cp_code: string }[]
}

const MockTemplate = ({ ...args }: MockEventArgs) => {
  const apolloRef = useRef<ReturnType<typeof getMockedApolloClient>>()
  if (!apolloRef.current) {
    apolloRef.current = getMockedApolloClient()
  }

  const { client, store } = apolloRef.current

  store.set('Event', '99', { id: '99', ...args })
  store.set('Query', 'ROOT', 'me', {
    id: '1',
    friends: [
      { id: '2', name: 'Tom' },
      { id: '3', name: 'Alice' }
    ]
  })

  return (
    <MemoryRouter initialEntries={['/events/99/invite']} initialIndex={0}>
      <AppShell apolloClient={client}>
        <Route path='/events/:id/invite'>
          <EventInvitePage key={Math.random()} />
        </Route>
      </AppShell>
    </MemoryRouter>
  )
}

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
    { cp_id: '2', cp_code: 'EM' }
  ]
}

export const Mocked = MockTemplate.bind({})

Mocked.args = {
  ...MockTemplate.args,
  name: 'Classic event',
  type: 1
}

export const RealServer = ({ eventId }: { eventId: number }) => (
  <MemoryRouter initialEntries={[`/events/${eventId}`]} initialIndex={0}>
    <AppShell>
      <Route path='/events/:id'>
        <EventInvitePage key={eventId} />
      </Route>
    </AppShell>
  </MemoryRouter>
)

RealServer.args = {
  eventId: 1
}
