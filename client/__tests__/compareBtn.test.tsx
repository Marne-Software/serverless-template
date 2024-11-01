import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CompareBtn from '../src/components/CompareBtn'; 
import { AppContext } from '../src/Types/Context';
import '@testing-library/jest-dom';
//Mock Imports
import { mockAppContext as originalMockAppContext } from '../__mocks__/appContext.mock';


describe('CompareBtn Component', () => {
  it('renders CompareBtn component correctly', () => {
    const mockSetIsOpen = jest.fn();

    // Mock the appContext to have more than one selected device
    const mockAppContext = {
      ...originalMockAppContext,
      selectedDevices: [   
         { 
        isEdit: true,
        id: 'device_id',
        location: 'Sample Location',
        timeHour: Date.now(),
        temperature: 25,
        humidity: 50,
        status: 'GREEN',
        statusHours: 0, 
        room: 'some room',
        building: 'some building',
        roomID: 'some RoomID',
    },    
     { 
      isEdit: true,
      id: 'device_id',
      location: 'Sample Location',
      timeHour: Date.now(),
      temperature: 25,
      humidity: 50,
      status: 'GREEN',
      statusHours: 0, 
      room: 'some room',
      building: 'some building',
      roomID: 'some RoomID',
  }], 
    };

    const { getByText } = render(
      <CompareBtn cssStyle={{}} setIsOpen={mockSetIsOpen} />,
      {
        // Mock AppContext.Provider value using a wrapper
        wrapper: ({ children }) => (
          <AppContext.Provider value={ mockAppContext }>
            {children}
          </AppContext.Provider>
        ),
      }
    );

    // Check if the component renders without crashing
    const viewButton = getByText('VIEW');
    expect(viewButton).toBeInTheDocument();

    // Test button click functionality
    fireEvent.click(viewButton);

    // Ensure that setIsOpen and setIsDeviceSelect are called correctly
    expect(mockSetIsOpen).toHaveBeenCalledWith(true);
    expect(mockAppContext.setIsDeviceSelect).toHaveBeenCalledWith(false);
  });
});
