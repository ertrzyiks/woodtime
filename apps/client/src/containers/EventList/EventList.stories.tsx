import React from 'react';
import {MemoryRouter} from 'react-router-dom'

import EventList from './EventList';
import AppShell from "../../AppShell";
import getMockedApolloClient from "../../support/storybook/getMockedApolloClient";
import {useNavigationLog} from "../../support/storybook/useNavigationLog";

export default {
  title: 'Pages/EventList',
  component: EventList,
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
  useNavigationLog({ onNavigate })

  return (
    <AppShell apolloClient={client}>
      <EventList />
    </AppShell>
  );
}


export const RealServer = ({ onNavigate } : Args) => {
  useNavigationLog({ onNavigate })

  return (
    <AppShell>
      <EventList />
    </AppShell>
  );
}
