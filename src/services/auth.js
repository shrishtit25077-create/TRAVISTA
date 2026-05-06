import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// ─── Human-readable Firebase error messages ───────────────────────────────────
export function getAuthErrorMessage(code) {
  const map = {
    "auth/invalid-credential":   "Incorrect email or password. Please try again.",
    "auth/user-not-found":       "No account found with this email. Please sign up.",
    "auth/wrong-password":       "Incorrect password. Please try again.",
    "auth/email-already-in-use": "This email is already registered. Try logging in.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/invalid-email":        "Please enter a valid email address.",
    "auth/too-many-requests":    "Too many failed attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/cancelled-popup-request": "Only one sign-in popup allowed at a time.",
  };
  return map[code] || "Authentication failed. Please try again.";
}

// ─── Email / Password ─────────────────────────────────────────────────────────
export const login = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error(getAuthErrorMessage(err.code));
  }
};

export const signup = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw new Error(getAuthErrorMessage(err.code));
  }
};

// ─── Google Sign-In ───────────────────────────────────────────────────────────
export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err) {
    throw new Error(getAuthErrorMessage(err.code));
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = () => signOut(auth);
