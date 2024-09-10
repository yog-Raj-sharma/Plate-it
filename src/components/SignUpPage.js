import React, { useState } from 'react';
import { db } from '../firebase'; // Importing db from firebase
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs'; // Import bcryptjs

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roll, setRoll] = useState('');
  const [hostel, setHostel] = useState('');
  const [room, setRoom] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook to handle navigation

  const handleSignUp = async (e) => {
  e.preventDefault();

  try {
    // Hash the hardcoded password 'Hellouser'
    const saltRounds = 10;
    const hardcodedPassword = 'Hellouser'; // Hardcoded password
    const hashedPassword = await bcrypt.hash(hardcodedPassword, saltRounds);

    // Save user data in Firestore with email as document ID, and capitalized field names
    const userDocRef = doc(db, 'Residents', email);
    await setDoc(userDocRef, {
      Name: name,          // Capitalized field name
      Email: email,        // Capitalized field name
      Roll: roll,          // Capitalized field name
      Hostel: hostel,      // Capitalized field name
      Room: room,          // Capitalized field name
      Password: hashedPassword, // Capitalized field name, hashed 'Hellouser' password
      Coins: 0,            // Default coins value, capitalized
      Fingerprint: true    // Default fingerprint value, capitalized
    });

    // Optionally, navigate to another page or provide a confirmation message
    alert('Sign up successful.'); // Provide feedback to the user
  } catch (error) {
    console.error('Error signing up: ', error);
    alert('Error signing up');
  }
};


  return (
    <div className="form-container">
      <h2>Enter Student Details</h2>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter Your Name"
          required
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter Your Email"
          required
        />
        <input
          type="text"
          name="roll"
          value={roll}
          onChange={(e) => setRoll(e.target.value)}
          placeholder="Enter Your Roll Number"
          required
        />
        <input
          type="text"
          name="hostel"
          value={hostel}
          onChange={(e) => setHostel(e.target.value)}
          placeholder="Enter Your Hostel"
          required
        />
        <input
          type="text"
          name="room"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter Your Room Number"
          required
        />
        <input type="submit" value="Sign Up" />
      </form>
    </div>
  );
};

export default SignUpPage;
