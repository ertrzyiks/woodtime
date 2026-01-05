import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import CardScanner from './CardScanner';
import AppShell from '../../AppShell';

export default {
  title: 'Pages/CardScanner',
  component: CardScanner,
  decorators: [
    (Story: React.ComponentType) => (
      <MemoryRouter initialEntries={['/card-scanner']} initialIndex={0}>
        <Story />
      </MemoryRouter>
    ),
  ],
};

export const Default = () => {
  return (
    <AppShell>
      <CardScanner />
    </AppShell>
  );
};

export const WithoutCamera = () => {
  return (
    <AppShell>
      <CardScanner />
    </AppShell>
  );
};

WithoutCamera.parameters = {
  chromatic: { disableSnapshot: true },
};
