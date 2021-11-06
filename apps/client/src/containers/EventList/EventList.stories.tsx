import React from 'react';
import { MemoryRouter } from 'react-router-dom'

import AppShell from '../../AppShell';
import EventList from './EventList';

export default {
  title: 'Pages/EventList',
  component: EventList,
}

export const Active = () => (
  <MemoryRouter initialEntries={['/events']} initialIndex={0}>
    <AppShell>
      <EventList />
    </AppShell>
  </MemoryRouter>
);
