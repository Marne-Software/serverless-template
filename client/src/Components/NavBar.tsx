import React from "react";
import { FlexRow } from "../Styles";
import styled from "styled-components";
import { useAuth } from "../Auth/AuthContext";

// Styled component for the navigation bar
const NavbarContainer = styled(FlexRow)`
  width: 100%;
  padding: 5px;
  background-color: #f5f5f5;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box; // Ensures padding is included within the width
`;

const Navbar: React.FC = () => {
  const { handleSignOut, userAttributes } = useAuth(); // Use handleSignOut directly from the context

  return (
    <NavbarContainer>
      <h3>Go Serverless Template</h3>
      <div>
        {`${userAttributes?.family_name}, ${userAttributes?.given_name}`}
        <button style={{marginLeft: '5px'}} type="button" onClick={handleSignOut}>
          Log Out
        </button>
      </div>
    </NavbarContainer>
  );
};

export default Navbar;
