import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth'; // Import signUp directly from aws-amplify/auth
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      // Attempt to sign up the user
      const userSub = await signUp({
        username: email, // Use the email as the username
        password
      });

      console.log('Sign-up successful:', userSub); // Log the userSub
      return { isSignUpComplete: true, userId: userSub }; // Return success information
    } catch (error) {
      console.error('Error signing up:', error); // Log any errors
      return { isSignUpComplete: false, userId: null }; // Return failure information
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const signUpResult = await handleSignUp(); // Call the sign-up function

    if (signUpResult.isSignUpComplete) {
      navigate('/login'); // Redirect to login after successful registration
    } else {
      console.error('Sign-up failed. Please try again.'); // Handle sign-up failure
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
