import React, { createContext, useContext, useEffect, useState } from "react";
import {
  fetchAuthSession,
  signOut,
  fetchUserAttributes,
  FetchUserAttributesOutput,
  signIn,
} from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

interface IApiMessage {
  isError: boolean;
  payload: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  apiMessage: IApiMessage;
  userAttributes: FetchUserAttributesOutput | null;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  fetchHelper: (
    endpoint: string,
    method?: string,
    body?: any,
    headers?: Record<string, string>
  ) => Promise<any>;
  handleSignOut: () => Promise<void>;
  handleLogin: (username: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    // Initialize authentication state based on localStorage
    return !!localStorage.getItem("isAuthenticated");
  });
  const [apiMessage, setApiMessage] = useState<IApiMessage>({ isError: false, payload: "" });
  const [userAttributes, setUserAttributes] = useState<FetchUserAttributesOutput | null>(null);
  const navigate = useNavigate();

  const fetchHelper = async (
    endpoint: string,
    method: string = "GET",
    body: any = undefined,
    headers?: Record<string, string>
  ): Promise<any> => {
    setIsLoading(true); // Start loading
  
    if (!isAuthenticated) {
      setIsLoading(false); // Reset loading if user is not authenticated
      throw new Error("User is not authenticated");
    }
  
    try {
      const session = await fetchAuthSession({ forceRefresh: true });
      const accessToken = session.tokens?.accessToken;
      if (!accessToken) {
        throw new Error("Authentication token is missing");
      }
  
      const requestOptions: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + accessToken,
          ...headers,
        },
        method,
        body: method !== "GET" ? JSON.stringify(body) : undefined,
      };
  
      const response = await fetch(endpoint, requestOptions);
  
      // Log the response status code and body for debugging
      console.log("Response status:", response.status);
  
      const responseData = await response.json();
  
      // If the response status is not OK (404, 500, etc.), throw an error
      if (!response.ok) {
        setApiMessage({ isError: true, payload: responseData.message });
        throw new Error(`HTTP Error: ${response.status} - ${responseData.message}`);
      }
  
      setApiMessage({ isError: false, payload: responseData.message });
      return responseData;
    } catch (error) {
      console.error("Error in fetchHelper:", error);
      throw error;
    } finally {
      setIsLoading(false); // End loading after operation
    }
  };
  

  const checkAuth = async () => {
    try {
      const session = await fetchAuthSession();
      if (session && session.tokens && session.tokens.accessToken) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true"); // Persist auth state
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
      } else {
        setIsAuthenticated(false);
        setUserAttributes(null);
        localStorage.removeItem("isAuthenticated"); // Clear on no session
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      setUserAttributes(null);
      localStorage.removeItem("isAuthenticated"); // Clear on error
    } finally {
      setIsLoading(false); // Ensure isLoading is set to false after checkAuth completes
    }
  };

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      await signIn({ username, password });
      await checkAuth();
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      setApiMessage({ isError: true, payload: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      console.log("User signed out successfully.");
      setIsAuthenticated(false);
      setUserAttributes(null);
      localStorage.removeItem("isAuthenticated"); // Clear on sign-out
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        setIsAuthenticated,
        fetchHelper,
        apiMessage,
        userAttributes,
        handleSignOut,
        handleLogin,
      }}
    >
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
