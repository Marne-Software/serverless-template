import React from 'react';
import { getByText, render, waitFor } from '@testing-library/react';
import Graph from '../src/components/Graph'; 
import { AppContext } from '../src/Types/Context';
import { AccountContext } from '../src/components/Auth/Account';
import '@testing-library/jest-dom';

// Mock import
import { mockAccountContextValue } from '../__mocks__/AccountContextValue.mock';
import { mockAppContext as originalMockAppContext } from '../__mocks__/appContext.mock';
import { mockDevices } from '../__mocks__/devices.mock';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  useContext: jest.fn(),
}));

const mockFetchHelper: jest.Mock<Promise<any>> = jest.fn(() => Promise.resolve({ Items: [
  { timeHour: Date.now(), temperature: 70, humidity: 50 },
]}));

const mockAppContext = {
  ...originalMockAppContext,
  selectedDevices: [   
     { 
    isEdit: true,
    id: 'device_id',
    location: 'Florida',
    timeHour: Date.now(),
    temperature: 25,
    humidity: 50,
    status: 'GREEN',
    statusHours: 0, 
    room: '313',
    building: 'A',
    roomID: 'some RoomID',
}], 
};



global.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing here
  }
  unobserve() {
    // do nothing here
  }
  disconnect() {
    // do nothing here
  }
};


describe('Graph Component', () => {
  it('renders Graph component correctly', () => {
// Define your logs data
const logsData = [{ Time: "2022-01-01T00:00:00.000Z", Humidity: 70 }];

// Mock useState
let state = logsData; // Initial state
(React.useState as jest.Mock).mockImplementation(() => [state, jest.fn()]);

// Mock useContext
(React.useContext as jest.Mock).mockImplementation((context) => {
  if (context === AppContext) {
    return mockAppContext;
  } else if (context === AccountContext) {
    return { ...mockAccountContextValue, fetchHelper: mockFetchHelper };
  }
});

    const { getByText } = render(

      <Graph avgData={[]} devices={mockDevices} type="ROOM"/>,
      {
        wrapper: ({ children }) => (
          <AppContext.Provider value={mockAppContext}>
            <AccountContext.Provider value={{...mockAccountContextValue, fetchHelper: mockFetchHelper}}>
              {children}
            </AccountContext.Provider>
          </AppContext.Provider>
        ),
      }
    );

    // Check if the component renders without crashing
    const humidityElement = getByText('70%');
    expect(humidityElement).toBeInTheDocument();
  });

  it('fetches and displays graph data', async () => {
    // Define your logs data
const logsData = [{ Time: "2022-01-01T00:00:00.000Z", Humidity: 70 }];

// Mock useState
let state = logsData; // Initial state
(React.useState as jest.Mock).mockImplementation(() => [state, jest.fn()]);

// Mock useContext
(React.useContext as jest.Mock).mockImplementation((context) => {
  if (context === AppContext) {
    return mockAppContext;
  } else if (context === AccountContext) {
    return { ...mockAccountContextValue, fetchHelper: mockFetchHelper };
  }
});

Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
  get() { return this.parentNode; }
});
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  get() { return parseFloat(window.getComputedStyle(this).width); },
});
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  get() { return parseFloat(window.getComputedStyle(this).height); },
});

    const { findByText } = render(
      <Graph avgData={[]} devices={mockDevices} type="DEVICE" />,
      {
        wrapper: ({ children }) => (
          <AppContext.Provider value={mockAppContext}>
            <AccountContext.Provider value={{...mockAccountContextValue, fetchHelper: mockFetchHelper}}>
              {children}
            </AccountContext.Provider>
          </AppContext.Provider>
        ),
      }
    );

    // Wait for the component to fetch data and render
    await waitFor(() => {
      expect(mockFetchHelper).toHaveBeenCalled();
    });
    const humidityElement = await findByText('70%');
    expect(humidityElement).toBeInTheDocument(); 
});

afterEach(() => {
  jest.clearAllMocks();
});

});
