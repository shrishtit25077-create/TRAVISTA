import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { login as fbLogin, signup as fbSignup, logout as fbLogout, loginWithGoogle as fbGoogleLogin } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    // throws with human-readable message from auth.js
    await fbLogin(email, password);
  };

  const signup = async (email, password) => {
    await fbSignup(email, password);
  };

  const loginWithGoogle = async () => {
    await fbGoogleLogin();
  };

  const logout = async () => {
    await fbLogout();
    localStorage.removeItem('travista_user');
  };

  const [savedPlaces, setSavedPlaces] = useState(() => {
    try {
      const stored = localStorage.getItem("savedPlaces");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("savedPlaces", JSON.stringify(savedPlaces));
  }, [savedPlaces]);

  const toggleSave = (place) => {
    const exists = savedPlaces.find((p) => p.id === place.id);

    if (exists) {
      setSavedPlaces(savedPlaces.filter((p) => p.id !== place.id));
      import('react-hot-toast').then(toast => toast.default.success("Removed from saved"));
    } else {
      setSavedPlaces([...savedPlaces, place]);
      import('react-hot-toast').then(toast => toast.default.success("Saved!"));
    }
  };

  const updateUser = (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('travista_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  const [itineraries, setItineraries] = useState(() => {
    try {
      const stored = localStorage.getItem("travista_itineraries");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (user) {
      import('../services/db').then(({ getTrips }) => {
        getTrips().then(data => {
          setItineraries(data);
          localStorage.setItem("travista_itineraries", JSON.stringify(data));
        });
      });
    } else {
      setItineraries([]);
      localStorage.removeItem("travista_itineraries");
    }
  }, [user]);

  const addItinerary = async (trip) => {
    const { saveTrip } = await import('../services/db');
    try {
      const saved = await saveTrip(trip);
      setItineraries(prev => {
        const updated = [saved, ...prev];
        localStorage.setItem("travista_itineraries", JSON.stringify(updated));
        return updated;
      });
      import('react-hot-toast').then(toast => toast.default.success("Trip saved to itineraries!", { style: { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', color: '#064e3b', border: '1px solid #10b981' }}));
    } catch (err) {
      import('react-hot-toast').then(toast => toast.default.error("Failed to save trip", { style: { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', color: '#7f1d1d', border: '1px solid #ef4444' }}));
    }
  };

  const deleteItinerary = async (id) => {
    const { deleteTrip } = await import('../services/db');
    try {
      await deleteTrip(String(id));
      setItineraries(prev => {
        const updated = prev.filter(t => String(t.id) !== String(id));
        localStorage.setItem("travista_itineraries", JSON.stringify(updated));
        return updated;
      });
      import('react-hot-toast').then(toast => toast.default.success("Trip deleted successfully", { style: { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', color: '#064e3b', border: '1px solid #10b981' }}));
    } catch (err) {
      import('react-hot-toast').then(toast => toast.default.error("Failed to delete trip", { style: { background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', color: '#7f1d1d', border: '1px solid #ef4444' }}));
    }
  };

  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const stored = localStorage.getItem("searchHistory");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

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
        signup,
        loginWithGoogle,
        logout,
        updateUser,
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
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);