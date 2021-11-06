import React from 'react';

import AppShell from '../../AppShell';
import EventPage from './EventPage';
import { MemoryRouter, Route } from "react-router-dom";

export default {
  title: 'Pages/EventPage',
  component: EventPage,
}

export const Active = () => (
  <MemoryRouter initialEntries={['/events/37']} initialIndex={0}>
    <AppShell>
      <Route path='/events/:id'>
        <EventPage />
      </Route>
    </AppShell>
  </MemoryRouter>
);
