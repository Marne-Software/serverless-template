import React, { useState } from "react";
import { signUp } from "aws-amplify/auth"; // Import signUp directly from aws-amplify/auth
import { useNavigate } from "react-router-dom";
import { FlexCol } from "../Styles";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const lastName = formData.get("lastName") as string;
    const firstName = formData.get("firstName") as string;

    try {
      const userSub = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            family_name: lastName,
            given_name: firstName,
          },
        },
      });

      console.log("Sign-up successful:", userSub); // Log the userSub
      return { isSignUpComplete: true, userId: userSub }; // Return success information
    } catch (error) {
      console.error("Error signing up:", error); // Log any errors
      return { isSignUpComplete: false, userId: null }; // Return failure information
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior
    const signUpResult = await handleSignUp(e); // Call the sign-up function

    if (signUpResult.isSignUpComplete) {
      navigate("/login"); // Redirect to login after successful registration
    } else {
      console.error("Sign-up failed. Please try again."); // Handle sign-up failure
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FlexCol>
        <input name="lastName" placeholder="Last name..." required />
        <input name="firstName" placeholder="First name..." required />
        <input type="email" name="email" placeholder="Email" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button type="submit">Register</button>
      </FlexCol>
    </form>
  );
};

export default Register;
