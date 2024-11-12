// App.tsx
import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AppContext } from "./Types/Context";
import HomePage from "./HomePage";
import ProtectedRoute from "./Auth/ProtectedRoute";
import LoginPage from "./Auth/Login";
import RegisterPage from "./Auth/Register";
import { useAuth } from "./Auth/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./Components/NavBar";
import styled from "styled-components";
import { FlexCol } from "./Styles";

const AppContainer = styled(FlexCol)`
  height: 100%;
`;

function App() {
  const { apiMessage, isAuthenticated } = useAuth();
  const [simpleContext, setSimpleContext] = useState<string>("");

  useEffect(() => {
    if (apiMessage.payload) {
      apiMessage.isError
        ? toast.error(apiMessage.payload)
        : toast.success(apiMessage.payload);
    }
  }, [apiMessage]);

  return (
    <AppContext.Provider
      value={{
        simpleContext,
        setSimpleContext,
      }}
    >
      {isAuthenticated && <NavBar />}
      <AppContainer>
        <ToastContainer
          hideProgressBar={true}
          closeButton={false}
          draggable={false}
          position="top-right"
        />
        <Routes>
          <Route path="/" element={<ProtectedRoute redirectPath="/login" />}>
            <Route index element={<HomePage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </AppContainer>
    </AppContext.Provider>
  );
}

export default App;
