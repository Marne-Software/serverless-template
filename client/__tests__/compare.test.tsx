import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Compare from '../src/components/Compare'; 
import '@testing-library/jest-dom';


global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));


describe('Compare Component', () => {
  
  it('renders without crashing', () => {
    render(<Compare isOpen={true} setIsOpen={jest.fn()} />);
  });
  
  it('matches snapshot', () => {
    const { asFragment } = render(<Compare isOpen={true} setIsOpen={jest.fn()} />);
    expect(asFragment()).toMatchSnapshot();
  });
  

});

