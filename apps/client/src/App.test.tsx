import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders title', async () => {
    render(<App />)

    const linkElement = await screen.findByText(/Woodtime/i);
    expect(linkElement).toBeInTheDocument();
  });
});
