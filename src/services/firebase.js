import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD8TJc23UVdq8ktkO9TOS3VEAq_RDHj9iE",
  authDomain: "travista-1d331.firebaseapp.com",
  projectId: "travista-1d331",
  storageBucket: "travista-1d331.firebasestorage.app",
  messagingSenderId: "182561749761",
  appId: "1:182561749761:web:a4765c9805f9a57b403900"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
