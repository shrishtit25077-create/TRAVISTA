import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('travista_user');

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // TEMP: auto-login so app doesn't stay blank
        const tempUser = {
          id: 1,
          name: "Demo User",
          onboardingCompleted: false,
          preferences: {
            budget: "mid",
            interests: ["beach", "culture", "nature"],
            travelStyle: "relaxed"
          }
        };

        setUser(tempUser);
        localStorage.setItem('travista_user', JSON.stringify(tempUser));
      }
    } catch (error) {
      console.error("Auth error:", error);
      localStorage.removeItem('travista_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData) => {
    try {
      setUser(userData);
      localStorage.setItem('travista_user', JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('travista_user');
    } catch (error) {
      console.error("Logout error:", error);
    }
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
      const stored = localStorage.getItem("itineraries");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("itineraries", JSON.stringify(itineraries));
  }, [itineraries]);

  const addItinerary = (trip) => {
    setItineraries(prev => [...prev, trip]);
    import('react-hot-toast').then(toast => toast.default.success("Trip saved to itineraries!"));
  };

  const deleteItinerary = (id) => {
    setItineraries(prev => prev.filter(t => t.id !== id));
    import('react-hot-toast').then(toast => toast.default.success("Trip deleted"));
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
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);