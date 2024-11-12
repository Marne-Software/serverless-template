import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Device from "../src/Components/Device";
import { AppContext } from "../src/Types/Context";
import "@testing-library/jest-dom";
// Mock Imports
import { mockIDevice } from "../__mocks__/device.mock";
import { mockAppContext } from "../__mocks__/appContext.mock";

describe("<Device /> Component", () => {
  it("renders device information correctly", () => {
    render(
      <AppContext.Provider value={mockAppContext}>
        <Device device={mockIDevice} />
      </AppContext.Provider>
    );

    expect(screen.getByText(mockIDevice.location)).toBeInTheDocument();
    expect(screen.getByText(`${mockIDevice.temperature}°`)).toBeInTheDocument();
    expect(screen.getByText(/HUM \d+%/)).toBeInTheDocument();
  });

  it("handles device click during device selection mode", () => {
    const setSelectedDevicesMock = jest.fn();
    const mockContextValue = {
      ...mockAppContext,
      setSelectedDevices: setSelectedDevicesMock,
      isDeviceSelect: true,
    };

    render(
      <AppContext.Provider value={mockContextValue}>
        <Device device={mockIDevice} />
      </AppContext.Provider>
    );

    const deviceTextElement = screen.getByText(mockIDevice.location);

    fireEvent.click(deviceTextElement);

    expect(setSelectedDevicesMock).toHaveBeenCalledTimes(1);
  });
});
