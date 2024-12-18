import React, { useEffect, useState } from "react";
import { FlexCol, FlexRow } from "./Styles";
import styled from "styled-components";
import { useAuth } from "./Auth/AuthContext"; // Import the authentication context

const HomePageContainer = styled(FlexCol)`
  height: 100%;
`;

function HomePage() {
  const { fetchHelper } = useAuth(); // Get the fetchHelper and setIsAuthenticated function
  const [something, setSomething] = useState<{ id: string; name: string }>({
    id: "",
    name: "N/A",
  });

  const fetchData = async () => {
    try {
      const result = await fetchHelper(
        `${process.env.API_URL}/something/f0c19de7-1aef-4a66-9a83-c15bd7b232e0`,
        'GET'
      );

    if (Array.isArray(result) && result[0]) {
      setSomething(result[0]);
    } else {
      setSomething({ id: "", name: "N/A" }); 
    }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const deleteData = async () => {
    try {
      const result = await fetchHelper(
        `${process.env.API_URL}/something/f0c19de7-1aef-4a66-9a83-c15bd7b232e0`,
        'DELETE'
      );
      setSomething({ id: "", name: "N/A" });
      fetchData();
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  };

  const postData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string; 

    try {
      const result = await fetchHelper(`${process.env.API_URL}/something`, 'POST', { name });
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
      fetchData();
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <HomePageContainer>
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
    </HomePageContainer>
  );
}

export default HomePage;
