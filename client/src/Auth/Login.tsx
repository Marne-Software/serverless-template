import React, { useState } from 'react';
import { signIn, type SignInInput } from 'aws-amplify/auth'; // Import directly from aws-amplify/auth
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignIn = async ({ username, password }: SignInInput) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password }); // Call signIn
      console.log('Sign-in successful:', { isSignedIn, nextStep }); // Optional logging
      navigate('/'); // Redirect on successful login
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    await handleSignIn({ username, password }); // Call handleSignIn with username and password
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit">Login</button>
      <button type="button" onClick={() => navigate('/register')}>Register</button> {/* Register button */}
    </form>
  );
};

export default Login;
