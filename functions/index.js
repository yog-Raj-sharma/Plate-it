const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.database();
const mealTimes = {
  breakfast: { start: 7, end: 9 },
  lunch: { start: 12, end: 14 },
  dinner: { start: 19, end: 21 },
};
const updateFingerprintStatus = async (mealType) => {
  const residentsRef = db.ref('Residents');
  const residentsSnapshot = await residentsRef.once('value');
  const residents = residentsSnapshot.val();

  const currentTime = new Date();
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;
  const mealTime = mealTimes[mealType];

  for (const emailPrefix in residents) {
    const resident = residents[emailPrefix];
    const residentRef = residentsRef.child(emailPrefix);
    if (!resident.meals[mealType] && currentHour < mealTime.start) {
      const updatedCoins = (resident.Coins || 0) + 25;
      await residentRef.update({ 
        Fingerprint: false,
        Coins: updatedCoins
      });
    } else if (resident.meals[mealType]) {
      await residentRef.update({ 
        Fingerprint: true
      });
    }
  }
};
exports.updateBreakfastFingerprint = functions.pubsub.schedule('every day 05:01')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    await updateFingerprintStatus('breakfast');
    return null;
  });

exports.updateLunchFingerprint = functions.pubsub.schedule('every day 10:01')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    await updateFingerprintStatus('lunch');
    return null;
  });

exports.updateDinnerFingerprint = functions.pubsub.schedule('every day 19:01')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    await updateFingerprintStatus('dinner');
    return null;
  });

exports.resetAfterBreakfast = functions.pubsub.schedule('every day 10:00')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const residentsRef = db.ref('Residents');
    const residentsSnapshot = await residentsRef.once('value');
    const residents = residentsSnapshot.val();

    for (const emailPrefix in residents) {
      await residentsRef.child(emailPrefix).update({
        'meals/breakfast': true,
        Fingerprint: true
      });
    }
    return null;
  });

exports.resetAfterLunch = functions.pubsub.schedule('every day 14:01')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const residentsRef = db.ref('Residents');
    const residentsSnapshot = await residentsRef.once('value');
    const residents = residentsSnapshot.val();

    for (const emailPrefix in residents) {
      await residentsRef.child(emailPrefix).update({
        'meals/lunch': true,
        Fingerprint: true
      });
    }
    return null;
  });

exports.resetAfterDinner = functions.pubsub.schedule('every day 21:00')
  .timeZone('Asia/Kolkata')
  .onRun(async (context) => {
    const residentsRef = db.ref('Residents');
    const residentsSnapshot = await residentsRef.once('value');
    const residents = residentsSnapshot.val();

    for (const emailPrefix in residents) {
      await residentsRef.child(emailPrefix).update({
        'meals/dinner': true,
        Fingerprint: true
      });
    }
    return null;
  });

  exports.checkAndResetMeals = functions.pubsub.schedule('every day 00:00+').timeZone('Asia/Kolkata').onRun(async (context) => {
  const today = new Date().toISOString().split('T')[0];  

  try {
    const residentsSnapshot = await db.ref('Residents').once('value');  
    const residentsData = residentsSnapshot.val();

    if (residentsData) {
      const updates = {};
      Object.keys(residentsData).forEach((residentKey) => {
        const resident = residentsData[residentKey];
        if (resident.disabledDates && resident.disabledDates.includes(today)) {
          updates[`Residents/${residentKey}/meals/breakfast`] = false;
          updates[`Residents/${residentKey}/meals/lunch`] = false;
          updates[`Residents/${residentKey}/meals/dinner`] = false;
        }
      });
      await db.ref().update(updates);
      console.log('Meals updated for all relevant users.');
    } else {
      console.log('No residents found.');
    }
  } catch (error) {
    console.error('Error checking dates or resetting meals:', error);
  }
});
