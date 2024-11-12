import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchAuthSession, signOut, fetchUserAttributes, FetchUserAttributesOutput, signIn } from "aws-amplify/auth";
import { useNavigate } from "react-router-dom";

interface IApiMessage {
  isError: boolean;
  payload: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
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
  handleLogin: (username: string, password: string) => Promise<void>; // Add handleLogin to the context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [apiMessage, setApiMessage] = useState<IApiMessage>({ isError: false, payload: "" });
  const [userAttributes, setUserAttributes] = useState<FetchUserAttributesOutput | null>(null);
  const navigate = useNavigate();

  const fetchHelper = async (
    endpoint: string,
    method: string = "GET",
    body: any = undefined,
    headers?: Record<string, string>
  ): Promise<any> => {
    if (!isAuthenticated) {
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
      const responseData = await response.json();

      if (!response.ok) {
        setApiMessage({ isError: true, payload: responseData.message });
        throw new Error(responseData.message);
      }

      setApiMessage({ isError: false, payload: responseData.message });
      return responseData;
    } catch (error) {
      console.error("Error in fetchHelper:", error);
      throw error;
    }
  };
  
  const checkAuth = async () => {
    try {
      const session = await fetchAuthSession();
      if (session && session.tokens && session.tokens.accessToken) {
        setIsAuthenticated(true);
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
      } else {
        setIsAuthenticated(false);
        setUserAttributes(null);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      setIsAuthenticated(false);
      setUserAttributes(null);
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      await signIn({username, password});
      await checkAuth();
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      setApiMessage({ isError: true, payload: error.message });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      console.log("User signed out successfully.");
      setIsAuthenticated(false);
      setUserAttributes(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        fetchHelper,
        apiMessage,
        userAttributes,
        handleSignOut,
        handleLogin, // Provide handleLogin in context
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
