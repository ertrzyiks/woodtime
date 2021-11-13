import React, { useRef } from 'react';
import { MemoryRouter } from "react-router-dom";

import SignIn from './SignIn';
import AppShell from '../../AppShell'
import getMockedApolloClient from "../../support/storybook/getMockedApolloClient";
import {useNavigationLog} from "../../support/storybook/useNavigationLog";

export default {
  title: 'Pages/SignIn',
  component: SignIn,
  argTypes: {
    onNavigate: { action: 'navigation' }
  },
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter initialEntries={['/']} initialIndex={0}>
        <Story />
      </MemoryRouter>
    )
  ]
}

interface Args {
  onNavigate: (params: { pathname: string }) => void
}

export const Mocked = ({ onNavigate }: Args) => {
  useNavigationLog({ onNavigate })

  const apolloRef = useRef<ReturnType<typeof getMockedApolloClient>>()
  if (!apolloRef.current) {
    apolloRef.current = getMockedApolloClient()
  }

  const { client } = apolloRef.current

  return (
    <AppShell apolloClient={client}>
      <SignIn />
    </AppShell>
  )
}

export const RealServer = ({ onNavigate }: Args) => {
  useNavigationLog({ onNavigate })

  return (
    <AppShell>
      <SignIn  />
    </AppShell>
  )
}

RealServer.parameters = {
  chromatic: { disableSnapshot: true }
}
