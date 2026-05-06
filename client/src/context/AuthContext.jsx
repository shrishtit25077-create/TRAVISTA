import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithGoogle, logOut } from '../firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    // Check for redirect result errors
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect Error:", error);
      toast.error("Authentication failed. Please try again.");
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          // API Call to our backend
          const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/login`, { token });
          setUser(res.data.user || currentUser);
        } catch (error) {
          console.error("Backend auth error:", error);
          // Fallback to purely client-side session if backend is down
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
      toast.success("Successfully logged in!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed");
    }
  };

  const manualLogin = async (username, email, password) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/manual-login`, { username, email, password });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success("Successfully logged in!");
      }
    } catch (error) {
      console.error("Manual login error:", error);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await logOut();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      const token = await firebaseUser?.getIdToken();
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/preferences`, 
          updates,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updatedUser = { ...user, ...profileData, onboardingCompleted: true };
      setUser(updatedUser);
      const token = await firebaseUser?.getIdToken();
      if (token) {
        await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/auth/profile`, 
          profileData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  // Remaining mock state (Since UI isn't supposed to change, keeping these states)
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [itineraries, setItineraries] = useState(() => {
    const saved = localStorage.getItem('itineraries');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchHistory, setSearchHistory] = useState([]);

  const toggleSave = (place) => {
    const exists = savedPlaces.find((p) => p.id === place.id);
    if (exists) {
      setSavedPlaces(savedPlaces.filter((p) => p.id !== place.id));
      toast.success("Removed from saved");
    } else {
      setSavedPlaces([...savedPlaces, place]);
      toast.success("Saved!");
    }
  };

  const addItinerary = (trip) => {
    setItineraries(prev => {
      const updated = [...prev, trip];
      localStorage.setItem('itineraries', JSON.stringify(updated));
      return updated;
    });
    toast.success("Trip saved to itineraries!");
  };

  const deleteItinerary = (id) => {
    setItineraries(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('itineraries', JSON.stringify(updated));
      return updated;
    });
    toast.success("Trip deleted");
  };

  const addToHistory = (query) => {
    if (!query || searchHistory.includes(query)) return;
    setSearchHistory(prev => [query, ...prev].slice(0, 5));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        manualLogin,
        logout,
        updateUser,
        updateProfile,
        savedPlaces,
        toggleSave,
        itineraries,
        setItineraries,
        addItinerary,
        deleteItinerary,
        searchHistory,
        addToHistory
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);