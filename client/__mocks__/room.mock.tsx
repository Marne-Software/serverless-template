import { IRoom, IDevice } from '../src/Types/AppInterfaces';


// Mock IDevice list
const mockDevices: IDevice[]= [
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
  { isEdit: true,
    id: 'device_id_2',
    location: 'Sample Location_2',
    timeHour: Date.now(),
    temperature: 35,
    humidity: 60,
    status: 'GREEN',
    statusHours: 0, 
    room: 'some room',
    building: 'some building',
    roomID: 'some RoomID',
},
];

// Mock IRoom object
const mockRoom: IRoom = {
  buildingID: 'building1',
  name: 'Room 101',
  devices: mockDevices,
};

export { mockRoom };
