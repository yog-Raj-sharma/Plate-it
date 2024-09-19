// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database"; // Import Realtime Database
import { getAuth } from "firebase/auth"; // Import Firebase Auth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDR7BFvNAYghjzEiSe6lzoLHBBwef107qc",
  authDomain: "plate-it-52b6b.firebaseapp.com",
  databaseURL: "https://plate-it-52b6b-default-rtdb.asia-southeast1.firebasedatabase.app", // Realtime Database URL
  projectId: "plate-it-52b6b",
  storageBucket: "plate-it-52b6b.appspot.com",
  messagingSenderId: "307969271528",
  appId: "1:307969271528:web:f53b70fe190e1b5e2acb5d",
  measurementId: "G-4VY09VMZ9Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app); // Initialize Realtime Database
const auth = getAuth(app); // Initialize Firebase Authentication

// Export the app, auth, and db for use in other parts of your application
export { app, db, auth };
