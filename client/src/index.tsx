import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Amplify } from "aws-amplify";
import { AuthProvider } from "./Auth/AuthContext";

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.USER_POOL_ID || "XX-XXXX-X_abcd1234", // Replace with your User Pool ID
      userPoolClientId: process.env.CLIENT_ID || "a1b2c3d4e5f6g7h8i9j0k1l2m3", // Replace with your Client ID
    },
  },
});

// Render your application
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <AuthProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </AuthProvider>
);

// Performance measuring (optional)
reportWebVitals();
