import React, { useEffect, useState } from "react";
import { FlexCol, FlexRow } from "./Styles";
import styled from "styled-components";

function HomePage() {
  const [something, setSomething] = useState<{ id: string; name: string }>({
    id: "",
    name: "N/A",
  });
  const [message, setMessage] = useState<string>("N/A");

  const HomePageContainer = styled(FlexCol)`
    height: 100%;
`;

  const fetchData = async () => {
    try {
      const response = await fetch(
        `${process.env.API_URL}/something/f0c19de7-1aef-4a66-9a83-c15bd7b232e0`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("res: ", result);
      setSomething(result[0]);
    } catch (error) {
      setMessage(error.message);
      console.error("Error fetching data:", error);
    }
  };

  const deleteData = async () => {
    try {
      const response = await fetch(
        `${process.env.API_URL}/something/f0c19de7-1aef-4a66-9a83-c15bd7b232e0`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setMessage(result.message);
      setSomething({ id: "", name: "N/A" });
      fetchData();
    } catch (error) {
      setMessage(error.message);
      console.error("Error fetching data:", error);
    }
  };

  const postData = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior

    const formData = new FormData(e.target as HTMLFormElement);
    const name = formData.get("name") as string; // Safely get the 'name' field value

    try {
      const response = await fetch(`${process.env.API_URL}/something`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }), // Use the extracted name here
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
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
      const response = await fetch(`${process.env.API_URL}/something`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: "f0c19de7-1aef-4a66-9a83-c15bd7b232e0",
          name,
        }), // Use the extracted name here
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log("res: ", result);
      setMessage(result.message);
      fetchData();
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <HomePageContainer>
      <div><strong>Message:</strong> {message}</div>
      <div><strong>Current Something Name:</strong> {something?.name}</div>
      <br/>
      {something.name === "N/A" ? (
        <form onSubmit={(e) => postData(e)}>
          <label>
            <strong>Name:</strong>
            <input type="text" name="name" required />
          </label>
          <button type="submit">Post</button>
        </form>
      ) : (
        <FlexRow>
          <form onSubmit={(e) => patchSomething(e)}>
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
