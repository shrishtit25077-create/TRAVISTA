import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding/Onboarding';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home/Home';
import Explore from './pages/Explore/Explore';
import AIPlanner from './pages/AIPlanner/AIPlanner';
import MapPage from './pages/Map/MapPage';
import Bookings from './pages/Bookings/Bookings';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import SavedPlaces from './pages/Saved/SavedPlaces';
import Itineraries from './pages/Itineraries/Itineraries';
import ItineraryDetail from './pages/Itineraries/ItineraryDetail';
import DestinationDetail from './pages/Destination/DestinationDetail';
import TripPlan from './pages/TripPlan/TripPlan';
import Translator from './pages/Translator/Translator';
import Alerts from './pages/Alerts/Alerts';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import SmoothScroll from './components/Effects/SmoothScroll';
import { LocationProvider } from './context/LocationContext';
import PWAInstallBanner from './components/PWAInstallBanner';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

const AnimatedPage = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="h-full"
  >
    {children}
  </motion.div>
);

import ProtectedRoute from './components/ProtectedRoute';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/signup" element={<AnimatedPage><Signup /></AnimatedPage>} />
        <Route path="/onboarding" element={<ProtectedRoute><AnimatedPage><Onboarding /></AnimatedPage></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="explore" element={<AnimatedPage><Explore /></AnimatedPage>} />
          <Route path="map" element={<AnimatedPage><MapPage /></AnimatedPage>} />
          <Route path="planner" element={<AnimatedPage><AIPlanner /></AnimatedPage>} />
          <Route path="ai-planner" element={<Navigate to="/planner" replace />} />
          <Route path="saved" element={<AnimatedPage><SavedPlaces /></AnimatedPage>} />
          <Route path="itineraries" element={<AnimatedPage><Itineraries /></AnimatedPage>} />
          <Route path="itinerary/:id" element={<AnimatedPage><ItineraryDetail /></AnimatedPage>} />
          <Route path="bookings" element={<Navigate to="/itineraries" replace />} />
          <Route path="alerts" element={<AnimatedPage><Alerts /></AnimatedPage>} />
          <Route path="translator" element={<AnimatedPage><Translator /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
          <Route path="settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
          <Route path="destination/:id" element={<AnimatedPage><DestinationDetail /></AnimatedPage>} />
          <Route path="trip-plan/:destination" element={<AnimatedPage><TripPlan /></AnimatedPage>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

import { ThemeProvider } from './context/ThemeContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebase';

function App() {
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const path = window.location.pathname;
      if (!user && path !== "/login" && path !== "/signup") {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <SmoothScroll />
          <PWAInstallBanner />
          <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: '#111827', color: '#fff', fontSize: '12px' } }} />
          <Router>
            <AnimatedRoutes />
          </Router>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
