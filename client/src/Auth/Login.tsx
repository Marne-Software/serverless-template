import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { FlexCol, FlexRow } from "../Styles";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(username, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FlexCol>
        <input
          type="text"
          placeholder="Username (Email)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
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
