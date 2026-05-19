import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

  const login = useCallback(async (email, password) => {
    await fbLogin(email, password);
  }, []);

  const signup = useCallback(async (email, password) => {
    await fbSignup(email, password);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await fbGoogleLogin();
  }, []);

  const logout = useCallback(async () => {
    await fbLogout();
    localStorage.removeItem('travista_user');
  }, []);

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

  const toggleSave = useCallback((place) => {
    setSavedPlaces((prev) => {
      const exists = prev.find((p) => p.id === place.id);
      if (exists) {
        import('react-hot-toast').then(toast => toast.default.success("Removed from saved"));
        return prev.filter((p) => p.id !== place.id);
      } else {
        import('react-hot-toast').then(toast => toast.default.success("Saved!"));
        return [...prev, place];
      }
    });
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      try {
        const updatedUser = { ...prev, ...updates };
        localStorage.setItem('travista_user', JSON.stringify(updatedUser));
        return updatedUser;
      } catch (error) {
        console.error("Update user error:", error);
        return prev;
      }
    });
  }, []);

  const migrateBudgets = async (trips) => {
    let modified = false;
    const { calculateSmartBudget } = await import('../services/aiService');
    const updated = trips.map(t => {
      if (!t.budget || t.budget.total < 50000) {
        modified = true;
        t.budget = calculateSmartBudget(
          [t.destination || ''], 
          t.days?.length || 3, 
          t.travelers || 2, 
          t.style || 'Comfort'
        );
      }
      return t;
    });
    return { updated, modified };
  };

  const [itineraries, setItineraries] = useState(() => {
    try {
      const stored = localStorage.getItem("travista_itineraries");
      const parsed = stored ? JSON.parse(stored) : [];
      return parsed;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const checkAndMigrate = async () => {
      if (itineraries.length > 0) {
        const { updated, modified } = await migrateBudgets(itineraries);
        if (modified) {
          setItineraries(updated);
          localStorage.setItem("travista_itineraries", JSON.stringify(updated));
        }
      }
    };
    checkAndMigrate();
  }, [itineraries.length]);

  useEffect(() => {
    if (user) {
      import('../services/db').then(({ getTrips }) => {
        getTrips().then(async data => {
          const { updated, modified } = await migrateBudgets(data);
          setItineraries(updated);
          localStorage.setItem("travista_itineraries", JSON.stringify(updated));
        });
      });
    } else {
      setItineraries([]);
      localStorage.removeItem("travista_itineraries");
    }
  }, [user]);

  const addItinerary = useCallback(async (trip) => {
    const tripWithMeta = {
      ...trip,
      savedAt: trip.savedAt || new Date().toISOString(),
    };
    try {
      // Try Firestore first (requires auth)
      const { saveTrip } = await import('../services/db');
      const saved = await saveTrip(tripWithMeta);
      setItineraries(prev => {
        // Prevent duplicates by id
        const filtered = prev.filter(t => String(t.id) !== String(trip.id));
        const updated = [saved, ...filtered];
        localStorage.setItem("travista_itineraries", JSON.stringify(updated));
        return updated;
      });
      const { default: toast } = await import('react-hot-toast');
      toast.success("Trip saved! View it in My Trips →", {
        duration: 4000,
        style: { background: '#fff', backdropFilter: 'blur(10px)', color: '#064e3b', border: '1px solid #10b981', fontWeight: 700 }
      });
    } catch (err) {
      // Fallback: save to localStorage only
      const localTrip = { ...tripWithMeta, id: trip.id || Date.now() };
      setItineraries(prev => {
        const filtered = prev.filter(t => String(t.id) !== String(localTrip.id));
        const updated = [localTrip, ...filtered];
        localStorage.setItem("travista_itineraries", JSON.stringify(updated));
        return updated;
      });
      const { default: toast } = await import('react-hot-toast');
      toast.success("Trip saved locally!", {
        duration: 4000,
        style: { background: '#fff', color: '#064e3b', border: '1px solid #10b981', fontWeight: 700 }
      });
    }
  }, []);

  const deleteItinerary = useCallback(async (id) => {
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
  }, []);

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

  const addToHistory = useCallback((query) => {
    setSearchHistory(prev => {
      if (!query || prev.includes(query)) return prev;
      return [query, ...prev].slice(0, 5);
    });
  }, []);

  const value = useMemo(() => ({
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
  }), [
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
    addItinerary,
    deleteItinerary,
    searchHistory,
    addToHistory
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);