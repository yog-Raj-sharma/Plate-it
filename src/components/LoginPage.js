import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, get, child } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getDatabase(); 
    const emailPrefix = email.split('@')[0]; 

    try {
      const residentRef = ref(db, `Residents/${emailPrefix}`);
      const residentSnapshot = await get(residentRef);

      if (residentSnapshot.exists()) {
        const residentData = residentSnapshot.val();
        const storedHashedPassword = residentData.Password;

        const isPasswordMatch = await bcrypt.compare(password, storedHashedPassword);

        if (isPasswordMatch) {
          onLogin({ email, ...residentData }, 'resident');
          navigate('/welcome');
        } else {
          alert('Incorrect password for Resident');
        }
      } else {
        const adminRef = ref(db, `Admin/${emailPrefix}`);
        const adminSnapshot = await get(adminRef);

        if (adminSnapshot.exists()) {
          
          await signInWithEmailAndPassword(auth, email, password);
          onLogin({ email, ...adminSnapshot.val() }, 'admin');
          navigate('/signup');
        } else {
          alert('No such user found in either collection');
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          required
        />
        <input type="submit" value="Login" />
      </form>
    </div>
  );
};

export default LoginPage;
