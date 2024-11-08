import React, { useEffect, useState } from "react";
import { FlexCol, FlexRow } from "./Styles";
import styled from "styled-components";
import { signOut } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Auth/AuthContext"; // Import the authentication context

const HomePageContainer = styled(FlexCol)`
  height: 100%;
`;

function HomePage() {
  const { setIsAuthenticated, fetchHelper } = useAuth(); // Get the fetchHelper and setIsAuthenticated function
  const [something, setSomething] = useState<{ id: string; name: string }>({
    id: "",
    name: "N/A",
  });
  const [message, setMessage] = useState<string>("N/A");
  const navigate = useNavigate(); // Get the navigate function

  const fetchData = async () => {
    try {
      const result = await fetchHelper(
        `${process.env.API_URL}/something/f0c19de7-1aef-4a66-9a83-c15bd7b232e0`,
        'GET'
      );
      console.log("res: ", result);
      setSomething(result[0]);
    } catch (error) {
      setMessage(error.message);
      console.error("Error fetching data:", error);
    }
  };

  const deleteData = async () => {
    try {
      const result = await fetchHelper(
        `${process.env.API_URL}/something/f0c19de7-1aef-4a66-9a83-c15bd7b232e0`,
        'DELETE'
      );

      setMessage(result.message);
      setSomething({ id: "", name: "N/A" });
      fetchData();
    } catch (error) {
      setMessage(error.message);
      console.error("Error deleting data:", error);
    }
  };

  const postData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string; // Safely get the 'name' field value

    try {
      const result = await fetchHelper(`${process.env.API_URL}/something`, 'POST', { name });
      setMessage(result.message);
      fetchData();
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const patchSomething = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string; // Safely get the 'name' field value

    try {
      const result = await fetchHelper(`${process.env.API_URL}/something`, 'PATCH', {
        id: "f0c19de7-1aef-4a66-9a83-c15bd7b232e0",
        name,
      });
      console.log("res: ", result);
      setMessage(result.message);
      fetchData();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
      setIsAuthenticated(false); // Update the authentication state
      navigate("/login"); // Redirect to login after sign-out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <HomePageContainer>
      <div>
        <strong>Message:</strong> {message}
      </div>
      <div>
        <strong>Current Something Name:</strong> {something?.name}
      </div>
      <br />
      {something.name === "N/A" ? (
        <form onSubmit={postData}>
          <label>
            <strong>Name:</strong>
            <input type="text" name="name" required />
          </label>
          <button type="submit">Post</button>
        </form>
      ) : (
        <FlexRow>
          <form onSubmit={patchSomething}>
            <label>
              <strong>Name:</strong>
              <input type="text" name="name" required />
            </label>
            <button type="submit">Patch</button>
          </form>
          <button type="button" onClick={deleteData}>
            Delete
          </button>
        </FlexRow>
      )}
      <button type="button" onClick={handleSignOut}>
        Log Out
      </button>{" "}
      {/* Log out button */}
    </HomePageContainer>
  );
}

export default HomePage;
