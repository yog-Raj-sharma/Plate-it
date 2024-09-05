import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Importing auth and db from firebase
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [rollNumber, setRollNumber] = useState(''); // State for roll number
  const [password, setPassword] = useState(''); // State for password
  const navigate = useNavigate(); // Hook to handle navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = `${rollNumber}@yourdomain.com`; // Forming the email using roll number

    try {
      // Signing in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetching user data from Firestore
      const userDocRef = doc(db, 'Residents', rollNumber);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = {
          rollNumber,
          ...userDoc.data(), // Spreading the document data to include in userData
        };
        onLogin(userData); // Passing the user data to parent component
        navigate('/welcome'); // Redirecting to the welcome page
      } else {
        console.error("No such document in Firestore!");
      }

    } catch (error) {
      console.error("Error signing in: ", error);
      alert("Error signing in/Check password ");
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="rollNumber"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          placeholder="Enter your roll number (Tester:102105093)"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password (Tester:Hellouser)"
          required
        />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};

export default LoginPage;
