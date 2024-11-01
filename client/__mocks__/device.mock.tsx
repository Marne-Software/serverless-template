import { IDevice } from '../src/Types/AppInterfaces';

const mockIDevice: IDevice = {
  isEdit: true,
  id: '1234',
  location: 'Florida',
  timeHour: Date.now(),
  temperature: 25,
  humidity: 50,
  status: 'GREEN',
  statusHours: 0, 
  room: '313',
  building: 'A',
  roomID: 'roomID',
  };

  export { mockIDevice };