import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import ExportExcel from '../src/components/ExportExcel';
import { AccountContext } from '../src/components/Auth/Account';
import { AppContext } from '../src/Types/Context';
import '@testing-library/jest-dom';
//Mock import
import { mockAccountContextValue } from '../__mocks__/AccountContextValue.mock';
import { mockAppContext as originalMockAppContext } from '../__mocks__/appContext.mock';

global.URL.createObjectURL = jest.fn();

describe('ExportExcel Component', () => {
  it('renders ExportExcel component correctly', () => {
    const { getByText } = render(<ExportExcel cssStyle={{}} />);
    
    // Check if the component renders without crashing
    const exportButton = getByText('DOWNLOAD');
    expect(exportButton).toBeInTheDocument();
  });

  jest.mock('../src/components/ExportExcel', () => ({
    exportToExcel: jest.fn(),
  }));
  
  it('clicking the download button triggers exportToExcel function', async () => {  
    const mockFetchHelper = jest.fn(() => Promise.resolve([{}]));
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

    mockAccountContextValue.fetchHelper = mockFetchHelper;

    const { getByText } = render(
      <AppContext.Provider value={mockAppContext}>
        <AccountContext.Provider value={mockAccountContextValue}>
          <ExportExcel cssStyle={{}} />
        </AccountContext.Provider>
      </AppContext.Provider>
    );

    const downloadButton = getByText('DOWNLOAD');
    fireEvent.click(downloadButton);

    // Wait for promises to resolve
    await waitFor(() => expect(mockFetchHelper).toHaveBeenCalled());
  });
  
  });
