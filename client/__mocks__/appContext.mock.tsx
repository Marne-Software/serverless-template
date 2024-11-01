import { IBuilding, IAppContext, IDevice } from '../src/Types/AppInterfaces';

//Mock Imports
import { mockBuilding } from '../__mocks__/building.mock';
import { mockIDevice } from '../__mocks__/device.mock';
import { mockUserInfo } from '../__mocks__/userInfo.mock';

const mockAppContext: IAppContext = {
    isOpen: true,
    setIsOpen: jest.fn(),
    appWidth: 800,
    setAppWidth: jest.fn(),
    selectedDevice: mockIDevice,
    setSelectedDevice: jest.fn(),
    selectedDevices: [] as IDevice[],
    setSelectedDevices: jest.fn(),
    selectedRoom: { name: 'Sample Room', devices: [] as IDevice[] },
    setSelectedRoom: jest.fn(),
    isMobile: false,
    setIsMobile: jest.fn(),
    isDeviceSelect: false,
    setIsDeviceSelect: jest.fn(),
    pagination: { currentPage: 1, pageSize: 10, lastEvaluatedKey: [{
      id: "1234",
      timeHour: 10
    }] },
    setPagination: jest.fn(),
    userBuildings: [] as IBuilding[],
    setUserBuildings: jest.fn(),
    allBuildings: [] as IBuilding[],
    setAllBuildings: jest.fn(),
    isReadingOffline: false,
    setIsReadingOffline: jest.fn(),
    isSyncOpen: false,
    setIsSyncOpen: jest.fn(),
    message: { isError: false, payload: '' },
    setMessage: jest.fn(),
    selectedBuilding:  mockBuilding,
    setSelectedBuilding: jest.fn(),
    loading: false,
    setLoading: jest.fn(),
    compareIsOpen: false,
    setCompareIsOpen: jest.fn(),
    userInfo: mockUserInfo,
    setUserInfo: jest.fn(),
  };

  export { mockAppContext };