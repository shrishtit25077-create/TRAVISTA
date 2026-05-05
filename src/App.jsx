import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Login from './pages/Auth/Login';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import SmoothScroll from './components/Effects/SmoothScroll';
import { LocationProvider } from './context/LocationContext';

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

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#F7F9FC]">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"
      >
        <div className="w-4 h-4 rounded-full bg-emerald-500" />
      </motion.div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
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
          <Route path="profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
          <Route path="settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
          <Route path="destination/:id" element={<AnimatedPage><DestinationDetail /></AnimatedPage>} />
          <Route path="trip-plan/:destination" element={<AnimatedPage><TripPlan /></AnimatedPage>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <SmoothScroll />
        <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: '#111827', color: '#fff', fontSize: '12px' } }} />
        <Router>
          <AnimatedRoutes />
        </Router>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
