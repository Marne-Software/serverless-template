import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth'; // Import fetchAuthSession from AWS Amplify

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  fetchHelper: (
    endpoint: string,
    method?: string,
    body?: any,
    fullRiz?: boolean,
    headers?: Record<string, string>
  ) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if the user is authenticated when the component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { tokens } = await fetchAuthSession(); // Fetch the session
        // If tokens exist, the user is authenticated
        setIsAuthenticated(!!tokens); // Set to true if tokens are present
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false); // If there's an error, assume not authenticated
      }
    };

    checkAuth(); // Call the checkAuth function
  }, []); // Run once on component mount

  const fetchHelper = async (
    endpoint: string,
    method: string = 'GET',
    body: any = undefined,
    fullRiz: boolean = false,
    headers?: Record<string, string>
  ): Promise<any> => {
    if (!isAuthenticated) {
      throw new Error('User is not authenticated'); // Handle unauthenticated access
    }

    try {
      // Fetch the authentication session
      const { tokens } = await fetchAuthSession({ forceRefresh: true });
      console.log("tokens: ", tokens?.idToken?.toString());
      const requestOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + tokens?.idToken?.toString(), // Use the JWT token from the session
          ...headers,
        },
        method: method,
        body: method !== 'GET' ? JSON.stringify(body) : undefined,
      };

      // Perform the fetch request
      const response = await fetch(endpoint, requestOptions);

      // Handle the response
      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.message);
      }

      // Return response based on fullRiz flag
      return fullRiz ? response : response.json();
    } catch (error) {
      console.error('Error in fetchHelper:', error);
      setIsAuthenticated(false); // Optionally set authenticated state to false on error
      throw error; // Optionally rethrow the error for further handling
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, fetchHelper }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
