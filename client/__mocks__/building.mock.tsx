import { IBuilding, IAppContext, IDevice, IUserInfo } from '../src/Types/AppInterfaces';

const mockBuilding: IBuilding = {
    buildingID: 'abc',
    name: 'Test Building',
    post: 'Some Post',
    ssid: 'Some SSID',
    password: 'Some Password',
    rooms: [
      { name: 'Room 1', devices: [] as IDevice[] },
      { name: 'Room 2', devices: [] as IDevice[] }
    ],
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'FL',
      zipCode: 12345
    },
    avgData: [
      { time: 1637652000, humidity: 50 },
    ],
    deviceCount: 5
  };

  export { mockBuilding };