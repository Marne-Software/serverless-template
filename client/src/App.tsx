import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppContext } from "./Types/Context";
import HomePage from "./HomePage";
import ProtectedRoute from "./Auth/ProtectedRoute";
import LoginPage from "./Auth/Login";
import RegisterPage from "./Auth/Register";
import { useAuth } from "./Auth/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "./components/NavBar";
import styled from "styled-components";
import { FlexCol, Overlay } from "./Styles";
import FadeLoader from "react-spinners/FadeLoader";
import { ErrorBoundary } from "react-error-boundary";
import NotFoundPage from "./components/Errors/NotFoundPage";
import CatastrophicError from "./components/Errors/CatastrophicError";

const AppContainer = styled(FlexCol)<{ navBarHeight: number }>`
  height: ${({ navBarHeight }) => `calc(100% - ${navBarHeight}px)`};
  transition: height 0.3s ease; // For smooth resizing
`;

const loaderCssOverride: CSSProperties = {
  position: "absolute",
  top: "47vh",
  left: "50vw",
  transform: "translate(-50%, -50%)",
  zIndex: "100",
};

function App() {
  const { apiMessage, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [simpleContext, setSimpleContext] = useState<string>("");
  const [navBarHeight, setNavBarHeight] = useState<number>(0);
  const navBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set the initial height of the NavBar
    if (navBarRef.current) {
      setNavBarHeight(navBarRef.current.offsetHeight);
    }
  }, [isAuthenticated, location.pathname]);

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
      <ErrorBoundary FallbackComponent={CatastrophicError}>
        {isLoading && (
          <Overlay>
            <FadeLoader
              loading={isLoading}
              cssOverride={loaderCssOverride}
              aria-label="Loading Spinner"
            />
          </Overlay>
        )}

        {/* Only show NavBar when authenticated and not on login or register pages */}
        {isAuthenticated &&
          location.pathname !== "/login" &&
          location.pathname !== "/register" && (
            <div ref={navBarRef}>
              <NavBar />
            </div>
          )}

        <AppContainer navBarHeight={navBarHeight}>
          <ToastContainer
            hideProgressBar={true}
            closeOnClick={true}
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AppContainer>
      </ErrorBoundary>
    </AppContext.Provider>
  );
}

export default App;
