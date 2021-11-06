import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders title', async () => {
  render(<App />)

  const linkElement = await screen.findByText(/Woodtime/i);
  expect(linkElement).toBeInTheDocument();
});
