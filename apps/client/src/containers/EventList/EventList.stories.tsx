import React, {useEffect} from 'react';
import {MemoryRouter, useLocation} from 'react-router-dom'

import EventList from './EventList';
import AppShell from "../../AppShell";
import getMockedApolloClient from "../../support/storybook/decorators/getMockedApolloClient";

export default {
  title: 'Pages/EventList',
  component: EventList,
  parameters: {
    chromatic: { disableSnapshot: true }
  },
  argTypes: {
    onNavigate: { action: 'navigation' }
  },
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter initialEntries={['/events']} initialIndex={0}>
        <Story />
      </MemoryRouter>
    )
  ]
}

const { client } = getMockedApolloClient()

interface Args {
  onNavigate: (params: { pathname: string }) => void
}

export const Mocked = ({ onNavigate } : Args) => {
  const location = useLocation()

  useEffect(() => {
    onNavigate(location)
  }, [onNavigate, location])

  return (
    <AppShell apolloClient={client}>
      <EventList />
    </AppShell>
  );
}


export const RealServer = ({ onNavigate } : Args) => {
  const location = useLocation()

  useEffect(() => {
    onNavigate(location)
  }, [onNavigate, location])

  return (
    <AppShell>
      <EventList />
    </AppShell>
  );
}

