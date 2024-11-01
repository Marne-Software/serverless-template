import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../src/components/HomePage'; // adjust this import path to your file structure
import { BrowserRouter } from 'react-router-dom';

jest.mock('../src/components/Auth/Account', () => ({
  ...jest.requireActual('../src/components/Auth/Account'),
  getSession: jest.fn(() => Promise.resolve({ user: {}, session: {} })),
}));

jest.mock('../src/components/Auth/Account', () => ({
  ...jest.requireActual('../src/components/Auth/Account'),
  fetchHelper: jest.fn(() => Promise.resolve({})),
}));


describe('HomePage', () => {
  beforeEach(() => {
      render(
        <BrowserRouter>
           <HomePage />
        </BrowserRouter>
      );
  });

  it('renders without crashing', () => {
      expect(screen.getByText(/HomePage/i)).toBeInTheDocument();
  });

  // Add more tests here
  it('renders the Building component', () => {
      expect(screen.getByTestId('building-component')).toBeInTheDocument();
  });

  it('renders the Sync component', () => {
      expect(screen.getByTestId('sync-component')).toBeInTheDocument();
  });

  it('renders the Overlay component', () => {
      expect(screen.getByTestId('overlay-component')).toBeInTheDocument();
  });

  it('renders the Compare component', () => {
      expect(screen.getByTestId('compare-component')).toBeInTheDocument();
  });
});