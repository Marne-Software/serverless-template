import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Building from '../src/components/Building';

//Mocks Imports
import { mockBuilding } from '../__mocks__/building.mock';

describe('Building component', () => {
  it('renders building name and rooms', async () => {
    const { findByText } = render(<Building building={mockBuilding} getUserState={() => {}} />);
    
    // Find the building name by its displayed text
    const buildingName = await findByText(mockBuilding.name);
    expect(buildingName).toBeInTheDocument();

    // Find the room names as before
    const room1 = await findByText('Room 1');
    const room2 = await findByText('Room 2');
    expect(room1).toBeInTheDocument();
    expect(room2).toBeInTheDocument();
  });
  it('adds a new room when the add room button is clicked', async () => { 
    const { getByLabelText, getByText, findByText } = render(<Building building={mockBuilding} getUserState={() => {}} />);
  
    const inputField = getByLabelText('ROOM LOOKUP');
    const addButton = getByText('Add');
  
    fireEvent.change(inputField, { target: { value: 'New Room' } });
    fireEvent.click(addButton);
  
    const newRoom = await findByText('New Room');
    expect(newRoom).toBeInTheDocument();
  });
});
