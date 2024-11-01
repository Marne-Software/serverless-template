
const mockAccountContextValue = {
    authenticate: jest.fn(),
    getSession: jest.fn(() => Promise.resolve()),
    logout: jest.fn(),
    fetchHelper: jest.fn(() => Promise.resolve([{}])),
  };

export { mockAccountContextValue };