import React from "react";
import { render } from "@testing-library/react";
import Room from "../src/Components/Room";
import { AppContext } from "../src/Types/Context";
import { AccountContext } from "../src/Components/Auth/Account";
import { mockRoom } from "../__mocks__/room.mock";
import { mockAppContext } from "../__mocks__/appContext.mock";
import "@testing-library/jest-dom";
// Mock AccountContext if used
import { mockAccountContextValue } from "../__mocks__/AccountContextValue.mock";

describe("Room Component", () => {
  it("renders Room component correctly", () => {
    // Mock any functions or state updates if necessary
    const mockSetIsOpen = jest.fn();

    // Render the Room component within the mocked contexts
    const { getByText } = render(
      <AppContext.Provider value={mockAppContext}>
        <AccountContext.Provider value={mockAccountContextValue}>
          {" "}
          {/* Include this line if AccountContext is used */}
          <Room
            room={mockRoom}
            buildingName="MockBuilding"
            rowIndex={0}
            colIndex={0}
          />
        </AccountContext.Provider>
      </AppContext.Provider>
    );

    // Check if the Room name is rendered
    const roomName = getByText(mockRoom.name);
    expect(roomName).toBeInTheDocument();
  });
});
