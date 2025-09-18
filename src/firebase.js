// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDeXCD4Wp7DZD-xH9mp3FypmW6xcjLCbEc",
  authDomain: "hsmi-analytics.firebaseapp.com",
  projectId: "hsmi-analytics",
  storageBucket: "hsmi-analytics.firebasestorage.app",
  messagingSenderId: "466938910138",
  appId: "1:466938910138:web:4f1cc080002817bb8eb983",
  measurementId: "G-2EK0DECVE8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export {analytics, logEvent};