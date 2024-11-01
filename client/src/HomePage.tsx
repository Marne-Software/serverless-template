import React, { useEffect, useState } from "react";
import { FlexRow } from "./Styles";

function HomePage() {
  const [data, setData] = useState<string>("Nope");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://weau1nzril.execute-api.us-east-1.amazonaws.com/Prod/getSomething/asdfa`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
 
        setData(result.name);
      } catch (error) {
        // setError(error.message);
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return <FlexRow>{data}</FlexRow>;
}

export default HomePage;
