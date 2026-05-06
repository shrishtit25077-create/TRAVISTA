import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWeather } from '../services/api';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [userWeather, setUserWeather] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setUserLocation(coords);

        try {
          const weather = await getWeather(coords);
          setUserWeather(weather);
        } catch (err) {
          setLocationError(err.message);
        }
      },
      (err) => {
        setLocationError(err.message);
      }
    );
  }, []);

  return (
    <LocationContext.Provider value={{ userLocation, userWeather, locationError }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
