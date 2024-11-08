// App.tsx
import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AppContext } from "./Types/Context";
import HomePage from "./HomePage";
import ProtectedRoute from "./Auth/ProtectedRoute"; 
import LoginPage from "./Auth/Login";
import RegisterPage from "./Auth/Register"; 
function App() {
  // Context States
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        isOpen: isOpen,
        setIsOpen: setIsOpen,
      }}
    >
      <Routes>
        {/* Protect the HomePage route */}
        <Route path="/" element={<ProtectedRoute redirectPath="/login" />}>
          <Route index element={<HomePage />} />
        </Route>
        
        {/* Unprotected route for login */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
