import React, { useState } from 'react';
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs'; 

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const residentDocRef = doc(db, 'Residents', email);
      const residentDoc = await getDoc(residentDocRef);

      if (residentDoc.exists()) {
        const residentData = residentDoc.data();
        const storedHashedPassword = residentData.Password; 


        const isPasswordMatch = await bcrypt.compare(password, storedHashedPassword);

        if (isPasswordMatch) {
          onLogin({ email, ...residentData }, 'resident');
          navigate('/welcome'); 
        } else {
          alert('Incorrect password for Resident');
        }
      } else {
        const adminDocRef = doc(db, 'Admin', email);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
          await signInWithEmailAndPassword(auth, email, password);
          onLogin({ email, ...adminDoc.data() }, 'admin');
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
