import React, { useEffect, useState, CSSProperties, useContext } from "react";
import { Route, Routes } from "react-router-dom";

import { AppContext } from "./Types/Context";
import HomePage from "./HomePage";

function App() {
  // Context States
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <AppContext.Provider
      value={{
        isOpen: isOpen,
        setIsOpen: setIsOpen
      }}
    >
      <Routes>
        <Route path={"/"} element={<HomePage />} />
      </Routes>
    </AppContext.Provider>
  );
}

export default App;
