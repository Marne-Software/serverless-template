import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { FlexCol, FlexRow } from "../Styles";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { handleLogin, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to home if already authenticated
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FlexCol>
        <h2>Serverless Template</h2>
        <input
          type="text"
          name="email"
          placeholder="Username (Email)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FlexRow>
          <button type="submit">Login</button>
          <button type="button" onClick={() => navigate("/register")}>
            Register
          </button>
        </FlexRow>
      </FlexCol>
    </form>
  );
};

export default Login;
