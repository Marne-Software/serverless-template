import { IDevice } from '../src/Types/AppInterfaces';

const mockDevices: IDevice[] = [
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
        temperature: 30,
        humidity: 45,
        status: 'GREEN',
        statusHours: 0, 
        room: 'some room',
        building: 'some building',
        roomID: 'some RoomID',
    }
];

export { mockDevices };


