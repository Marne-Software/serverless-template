import React from 'react';
import { render,act } from '@testing-library/react';
import HistoryTable from '../src/components/HistoryTable';
import { AccountContext } from '../src/components/Auth/Account';
import { AppContext } from '../src/Types/Context';
import ResizeObserver from 'resize-observer-polyfill';

if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}

// Import your mock context values
import { mockAccountContextValue } from '../__mocks__/AccountContextValue.mock';
import { mockAppContext as originalMockAppContext } from '../__mocks__/appContext.mock';

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

const mockFetchHelper: jest.Mock<Promise<any>> = jest.fn(() => Promise.resolve({ Items: [
  { timeHour: Date.now(), temperature: 70, humidity: 50 },
]}));


describe('HistoryTable', () => {
  test('renders HistoryTable component', async () => {
    mockAccountContextValue.fetchHelper.mockResolvedValueOnce([{}]);

    await act(async () => {
        render(
            <AppContext.Provider value={mockAppContext}>
                <AccountContext.Provider value={{...mockAccountContextValue, fetchHelper: mockFetchHelper}}>
                    <HistoryTable />
                </AccountContext.Provider>
            </AppContext.Provider>
        );
    });

});

});
