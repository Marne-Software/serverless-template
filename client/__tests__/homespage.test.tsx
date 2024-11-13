/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "../src/HomePage";
import { useAuth } from "../src/Auth/AuthContext";

// Mock the useAuth function to return a mock fetchHelper function
jest.mock("../src/Auth/AuthContext", () => ({
  useAuth: jest.fn(),
}));

const mockFetchHelper = jest.fn();
const mockUseAuth = useAuth as jest.Mock;

beforeEach(() => {
  // Reset the mock implementation before each test
  mockUseAuth.mockReturnValue({
    fetchHelper: mockFetchHelper,
  });
  mockFetchHelper.mockClear(); // Clear previous calls on fetchHelper
});

describe("HomePage", () => {
  it("renders with initial state and displays 'N/A' for something.name", () => {
    render(<HomePage />);
    expect(screen.getByText(/current something name/i)).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("fetches data on mount and displays the returned name", async () => {
    mockFetchHelper.mockResolvedValueOnce([{ id: "123", name: "Test Name" }]);

    render(<HomePage />);

    await waitFor(() => expect(mockFetchHelper).toHaveBeenCalledTimes(1));
    expect(mockFetchHelper).toHaveBeenCalledWith(
      `${process.env.API_URL}/something/f0c19de7-1aef-4a66-9a83-c15bd7b232e0`,
      "GET"
    );

    await waitFor(() => expect(screen.getByText("Test Name")).toBeInTheDocument());
  });

  it("calls deleteData and resets the name to 'N/A'", async () => {
    mockFetchHelper
      .mockResolvedValueOnce([{ id: "123", name: "To Delete" }]) // initial fetch
      .mockResolvedValueOnce({}); // delete response

    render(<HomePage />);

    // Ensure initial data is fetched and displayed
    await waitFor(() => expect(screen.getByText("To Delete")).toBeInTheDocument());

    // Click the delete button
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));

    // Ensure fetchHelper is called with DELETE
    await waitFor(() =>
      expect(mockFetchHelper).toHaveBeenCalledWith(
        `${process.env.API_URL}/something/f0c19de7-1aef-4a66-9a83-c15bd7b232e0`,
        "DELETE"
      )
    );

    // Ensure the name resets to "N/A"
    await waitFor(() => expect(screen.getByText("N/A")).toBeInTheDocument());
  });

  it("submits the postData form and calls fetchHelper with POST", async () => {
    mockFetchHelper.mockResolvedValueOnce({});

    render(<HomePage />);

    // Retrieve input by label text
    const input = screen.getByLabelText(/name/i);
    fireEvent.change(input, { target: { value: "New Name" } });

    fireEvent.click(screen.getByRole("button", { name: /post/i }));

    await waitFor(() =>
      expect(mockFetchHelper).toHaveBeenCalledWith(
        `${process.env.API_URL}/something`,
        "POST",
        { name: "New Name" }
      )
    );
  });

  it("submits the patchSomething form and calls fetchHelper with PATCH", async () => {
    mockFetchHelper.mockResolvedValueOnce([{ id: "123", name: "Existing Name" }]);

    render(<HomePage />);

    // Ensure data is fetched and form is displayed
    await waitFor(() => expect(screen.getByText("Existing Name")).toBeInTheDocument());

    // Fill out the form and submit
    const input = screen.getByLabelText(/name/i);
    fireEvent.change(input, { target: { value: "Updated Name" } });
    fireEvent.click(screen.getByRole("button", { name: /patch/i }));

    await waitFor(() =>
      expect(mockFetchHelper).toHaveBeenCalledWith(
        `${process.env.API_URL}/something`,
        "PATCH",
        { id: "f0c19de7-1aef-4a66-9a83-c15bd7b232e0", name: "Updated Name" }
      )
    );
  });
});

