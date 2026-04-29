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

  const updateUser = (updates) => {
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('travista_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Update user error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);