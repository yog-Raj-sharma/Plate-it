import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';  
import { ref, onValue, set, remove } from 'firebase/database';  
import bcrypt from 'bcryptjs';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roll, setRoll] = useState('');
  const [hostel, setHostel] = useState('');
  const [room, setRoom] = useState('');
  const [uniqueID, setUniqueID] = useState('');
  const [fingerprintButtonLabel, setFingerprintButtonLabel] = useState('Get Fingerprint ID');
  const [fingerprintButtonColor, setFingerprintButtonColor] = useState('#ff4d4d');  
  const [hostelName, setHostelName] = useState('');  
  const [activeStudentsCount, setActiveStudentsCount] = useState(0);  

  const getEmailPrefix = (email) => {
    return email.split('@')[0];  
  };

  const fetchHostelAndActiveStudents = async () => {
  const admin = auth.currentUser; 
  if (!admin) {
    console.error("Admin is not logged in or auth.currentUser is null.");
    return; 
  }
  
  const emailPrefix = getEmailPrefix(admin.email);  
  console.log("Admin Email Prefix:", emailPrefix);

  const adminRef = ref(db, `Admin/${emailPrefix}`);
  onValue(adminRef, (snapshot) => {
  const adminData = snapshot.val();
  console.log("Snapshot data:", adminData);  
  if (adminData && adminData.Hostel) {
    console.log("Fetched Hostel Name:", adminData.Hostel);
    setHostelName(adminData.Hostel);  
  } else {
    console.error("No hostel data found for admin:", emailPrefix);
  }
});


  if (hostelName) {
    const residentsRef = ref(db, 'Residents');
    onValue(residentsRef, (snapshot) => {
      const residents = snapshot.val();
      let count = 0;
      for (const residentEmailPrefix in residents) {
        const resident = residents[residentEmailPrefix];
        if (resident.Hostel === hostelName && resident.Fingerprint === true) {
          count++;  
        }
      }
      console.log("Active students for meal count:", count);
      setActiveStudentsCount(count);  
    });
  } else {
    console.error("Hostel name not set yet.");
  }
};

  useEffect(() => {
    fetchHostelAndActiveStudents();  
  }, [hostelName]);  

  const handleSignUp = async (e) => {
    e.preventDefault(); 

    const emailPrefix = getEmailPrefix(email);  

    try {
      const saltRounds = 10;
      const hardcodedPassword = 'Hellouser';
      const hashedPassword = await bcrypt.hash(hardcodedPassword, saltRounds);

      const userRef = ref(db, `Residents/${emailPrefix}`);
      await set(userRef, {
        Name: name,
        Email: email,
        Roll: roll,
        Hostel: hostel,
        Room: room,
        Password: hashedPassword,
        Coins: 0,
        Fingerprint: true
      });

      if (uniqueID) {
        const biometricRef = ref(db, `Biometrics/${uniqueID}`);
        await set(biometricRef, {
          Email: emailPrefix  
        });
      } else {
        alert('Please capture fingerprint first!');
        return;
      }

      alert('Sign up successful.');

      setName('');
      setEmail('');
      setRoll('');
      setHostel('');
      setRoom('');
      setUniqueID('');
      setFingerprintButtonLabel('Get Fingerprint ID');
      setFingerprintButtonColor('#007bff');  

    } catch (error) {
      console.error('Error signing up: ', error);
      alert('Error signing up');
    }
  };

  const requestFingerprintID = async () => {
    try {
      const requestRef = ref(db, 'Requests/UniqueID');
      await set(requestRef, { requested: true });
      
      const responseRef = ref(db, 'Responses/UniqueID');
      const unsubscribe = onValue(responseRef, async (snapshot) => {
        const data = snapshot.val();
        if (data && data.uniqueID) {
          setUniqueID(data.uniqueID);
          alert(`Fingerprint captured, Unique ID: ${data.uniqueID}`);

          setFingerprintButtonLabel('Received Fingerprint ID');
          setFingerprintButtonColor('green');
          
         
          await remove(responseRef);
          unsubscribe();  
        } else if (data && data.error) {
          alert(`Error: ${data.error}`);
          unsubscribe();  
        }
      });
    } catch (error) {
      console.error('Error fetching fingerprint unique ID: ', error);
      alert('Failed to get fingerprint ID');
    }
  };

  return (
    <div className="form-container">
      <h2>Enter Student Details</h2>

      
      <div>
        <p><strong>Hostel:</strong> {hostelName || 'Fetching...'}</p>
        <p><strong>Active Students for Meal:</strong> {activeStudentsCount}</p>
      </div>

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
        <button
          type="button"
          onClick={requestFingerprintID}
          style={{ backgroundColor: fingerprintButtonColor }}
        >
          {fingerprintButtonLabel}
        </button>
        <input type="submit" value="Sign Up" />
      </form>
    </div>
  );
};

export default SignUpPage;
