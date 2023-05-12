// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBbzHUtHWPgMXK8WVML0gB3vzqk4TA-gAY",
  authDomain: "chillchat-bcb38.firebaseapp.com",
  projectId: "chillchat-bcb38",
  storageBucket: "chillchat-bcb38.appspot.com",
  messagingSenderId: "578551274822",
  appId: "1:578551274822:web:8ab7188db4fc68d6685947",
  measurementId: "G-PVETBZWC3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth();

export { auth };