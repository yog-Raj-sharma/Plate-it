import React, { useEffect, useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this line is included at the top
import { updatePassword } from 'firebase/auth';
import { auth } from '../firebase'; // If db was already imported, remove it from here
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; 
import Calendar from 'react-calendar';
import QRCode from 'qrcode.react';
import '../style.css';
const WelcomePage = ({ userData }) => {
  const [user, setUser] = useState(userData);
  const [meals, setMeals] = useState({
    breakfast: true,
    lunch: true,
    dinner: true,
  });
  const [coins, setCoins] = useState(0);
  const [selectedDates, setSelectedDates] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false); // Modal state
  const [newPassword, setNewPassword] = useState(''); // New password state
  const [disabledDates, setDisabledDates] = useState(new Set());
  const navigate = useNavigate();
  const [qrValue, setQrValue] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
const [paymentAmount, setPaymentAmount] = useState('');



  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData) {
        const savedUserData = localStorage.getItem('userData');
        if (savedUserData) {
          setUser(JSON.parse(savedUserData));
        }
      }

      if (user) {
        const userDocRef = doc(db, 'Residents', user.Roll.toString());
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setCoins(data.Coins || 0);
        }
      }
    };

    fetchUserData();
  }, [user, userData]);

  useEffect(() => {
    function updateTimeDate() {
      const now = new Date();
      const dateElement = document.getElementById('date');
      const timeElement = document.getElementById('time');

      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      dateElement.textContent = `${day}-${month}-${year}`;

      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateTimeDate();
    const interval = setInterval(updateTimeDate, 1000);
    return () => clearInterval(interval);
  }, []);

    const myFunction = () => {
    const dropdown = document.getElementById('myDropdown');
    dropdown.classList.toggle('show');
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user
      navigate('/login'); // Redirect to the login page
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out:');
    }
  };


  const handleToggleChange = async (mealType) => {
    const now = new Date();
    const userDocRef = doc(db, 'Residents', user.Roll.toString());
    const newStatus = !meals[mealType];

    setMeals((prevMeals) => ({
      ...prevMeals,
      [mealType]: newStatus,
    }));

    if (!newStatus) {
      const mealTimes = {
        breakfast: { start: 7, end: 10 },
        lunch: { start: 13, end: 14.5 },
        dinner: { start: 17, end: 21.5 },
      };

      const mealTime = mealTimes[mealType];
      const currentHour = now.getHours() + now.getMinutes() / 60;

      if (currentHour < mealTime.start) {
        setCoins((prevCoins) => prevCoins + 25);
        await updateDoc(userDocRef, {
          Coins: coins + 25,
        });

        const nextMealTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          mealTime.start,
          0,
          0
        );
        const timeUntilNextMeal = nextMealTime.getTime() - now.getTime();

        setTimeout(async () => {
          setMeals((prevMeals) => ({
            ...prevMeals,
            [mealType]: false,
          }));

          await updateDoc(userDocRef, {
            Fingerprint: false,
          });
        }, timeUntilNextMeal);
      } else if (currentHour > mealTime.end) {
        setCoins((prevCoins) => prevCoins + 25);
        await updateDoc(userDocRef, {
          Coins: coins + 25,
        });

        const nextMealTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          mealTime.start,
          0,
          0
        );
        const timeUntilNextMeal = nextMealTime.getTime() - now.getTime();

        setTimeout(async () => {
          setMeals((prevMeals) => ({
            ...prevMeals,
            [mealType]: false,
          }));

          await updateDoc(userDocRef, {
            Fingerprint: false,
          });
        }, timeUntilNextMeal);
      }
    } else {
      setCoins((prevCoins) => prevCoins - 25);
      await updateDoc(userDocRef, {
        Coins: coins - 25,
        Fingerprint: true,
      });
    }

    let revertTime;

    if (mealType === 'breakfast') {
      revertTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    } else if (mealType === 'lunch') {
      revertTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30, 0);
    } else if (mealType === 'dinner') {
      revertTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 21, 30, 0);
    }

    const timeUntilRevert = revertTime.getTime() - now.getTime();

    if (timeUntilRevert > 0) {
      setTimeout(async () => {
        setMeals((prevMeals) => ({
          ...prevMeals,
          [mealType]: true,
        }));

        await updateDoc(userDocRef, {
          Fingerprint: true,
        });
      }, timeUntilRevert);
    }
  };

  const isSwitchDisabled = (mealType, date) => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;

    const mealTimes = {
      breakfast: { start: 5, end: 10 },
      lunch: { start: 10, end: 14.5 },
      dinner: { start: 17.8, end: 21.5 },
    };

    const mealTime = mealTimes[mealType];

    return currentHour >= mealTime.start && currentHour < mealTime.end;
  };

   const handleDateChange = (dates) => {
  setSelectedDates(dates);
};

  const handleConfirmClick = async () => {
  const userDocRef = doc(db, 'Residents', user.Roll.toString());
  const newDisabledDates = new Set(disabledDates);

  if (selectedDates.length === 2) {
    const startDate = new Date(selectedDates[0]);
    const endDate = new Date(selectedDates[1]);
    const daysBetween = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    for (let i = 0; i <= daysBetween; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const formattedDate = currentDate.toISOString().split('T')[0];
      newDisabledDates.add(formattedDate);

      // Calculate the time until midnight (or another specified time) on the currentDate
      const midnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0);
      const timeUntilMidnight = midnight.getTime() - Date.now();

      setTimeout(async () => {
        await updateDoc(userDocRef, {
          Fingerprint: false,
        });

        setCoins((prevCoins) => prevCoins + 50);
        await updateDoc(userDocRef, {
          Coins: coins + 50,
        });
      }, timeUntilMidnight);
    }
  }

  setDisabledDates(newDisabledDates);
  setSelectedDates([]);
};

const isDateDisabled = (date) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fifteenDaysFromNow = new Date(today);
  fifteenDaysFromNow.setDate(today.getDate() + 15);

  return (
    disabledDates.has(date.toISOString().split('T')[0]) || 
    date < today || 
    date > fifteenDaysFromNow
  );
};

    const handlePasswordChange = async () => {
    if (newPassword) {
      try {
        const user = auth.currentUser;
        await updatePassword(user, newPassword);
        alert('Password changed successfully.');
        setShowPasswordModal(false);
      } catch (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password. Please try again.');
      }
    } else {
      alert('Please enter a new password.');
    }
  };

  const handlePaymentClick = () => {
    setShowPaymentModal(true);
  };

  const handlePay = () => {
    if (paymentAmount) {
      setQrValue(`Amount: ${paymentAmount} coins`);
    } else {
      alert('Please enter an amount.');
    }
  };


  return (
    <>
      <div className="side">
        <div className="dropdown" onClick={myFunction}>
          <div className="dropbtn">
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>
          <div id="myDropdown" className="dropdown-content">
            <a href="#" onClick={() => setShowPasswordModal(true)}>Change Password</a>
            <a href="mailto:yraj_be21@thapar.edu">Contact us</a>
               <a onClick={handleSignOut}>Sign out</a> {/* Sign out button */}
          </div>
        </div>
        <a className='Payment' onClick={handlePaymentClick}>Make Payment</a>

      </div>
      <div className="welcome">
        <div className="top">
          <div className="time">
            <div id="date"></div>
            <div id="time"></div>
          </div>
          <img src="/images/coin.png" alt="coin" />
          <div className='coin'>
            <h6>{coins}</h6>
          </div>
        </div>
        <div className="Student-details">
          <div className="circle">
            <img className="graduate" src="/images/graduated.png" alt="graduate" />
          </div>
          <div className="details">
            <h2>Name:</h2><br />
            <h2>Roll. :</h2><br />
          </div>
          <div className='Hostel'>
            <h2>Hostel:</h2><br />
            <h2>Room:</h2><br />
          </div>
          <div className="show_name">
            <h2>{user?.Name || 'Name not available'}</h2><br />
            <h2>{user?.Roll || 'Roll number not available'}</h2><br />
          </div>
          <div className="show_hostel">
            <h2>{user?.Hostel || 'Hostel not available'}</h2><br />
            <h2>{user?.Room || 'Room not available'}</h2><br />
          </div>
        </div>
        <div className='action-components'>
          <div className="calender">
            <div className="Add-calender">
              <Calendar
                onChange={handleDateChange}
                value={selectedDates}
                selectRange={true}
                tileDisabled={({ date }) => isDateDisabled(date)}
                tileClassName={({ date }) => selectedDates.some(selectedDate =>
                  date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0])
                  ? 'selected-date' : null
                }
              />
            </div>
            <div className='add-confirm-button'>
               <button
             onClick={handleConfirmClick}
                 style={{
                     backgroundColor: selectedDates.length ? 'green' : '',
                      color: selectedDates.length ? 'white' : '',
                        }}
                      >
                Confirm
              </button>
            </div>
          </div>
          {showPaymentModal && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setShowPaymentModal(false)}>&times;</span>
              <h2>Make Payment</h2>
              <input
                type="number"
                placeholder="Enter amount of coins"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <button onClick={handlePay}>Pay</button>
              {qrValue && (
                <div>
                  <h3>Scan this QR to complete payment:</h3>
                  <QRCode value={qrValue} />
                </div>
              )}
            </div>
          </div>
        )}

          {showPasswordModal && (
  <div className="modal">
    <div className="modal-content">
      <span className="close" onClick={() => setShowPasswordModal(false)}>
        &times;
      </span>
      <h2>Change Password</h2>
      <input
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <button onClick={handlePasswordChange}>Submit</button>
    </div>
  </div>
)}

          <div className="action">
            <div className={`box meal-option ${meals.breakfast ? '' : 'disabled'}`}>
              <h2>Breakfast</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={meals.breakfast}
                  onChange={() => handleToggleChange('breakfast')}
                  disabled={isSwitchDisabled('breakfast')}
                />
                <span className="slider round"></span>
              </label>
            </div>
            <div className={`box meal-option ${meals.lunch ? '' : 'disabled'}`}>
              <h2>Lunch</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={meals.lunch}
                  onChange={() => handleToggleChange('lunch')}
                  disabled={isSwitchDisabled('lunch')}
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className={`box meal-option ${meals.dinner ? '' : 'disabled'}`}>
              <h2>Dinner</h2>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={meals.dinner}
                  onChange={() => handleToggleChange('dinner')}
                  disabled={isSwitchDisabled('dinner')}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          <div className="Sustainable">
          <div>
            <h1>Contribute in Sustainable development.</h1>
          </div>
          <div className="h3-container">
            <h3>(Toggle the switch if you are not going to eat.)</h3>
          </div>
        </div>
        <div className='logo'>
          <img className='no-wastage' src="/images/food.png" alt="Do not waste food" />
          <img className='sharing' src="/images/sharing.png" alt="Let it be for someone else" />
          <img className='happy' src="/images/world.png" alt="Make a happy world" />
          <img className='save' src="/images/save-the-world.png" alt="Save the world" />
        </div>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;
