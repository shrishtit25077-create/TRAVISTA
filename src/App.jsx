import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Toaster } from 'react-hot-toast';
import SmoothScroll from './components/Effects/SmoothScroll';
import PWAInstallBanner from './components/PWAInstallBanner';
import ProtectedRoute from './components/ProtectedRoute';
import PageErrorBoundary from './components/ErrorBoundary';
import AIChatbot from './components/AIChatbot';

// ─── Page imports ─────────────────────────────────────────────────────────────
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding/Onboarding';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home/Home';
import Explore from './pages/Explore/Explore';
import AIPlanner from './pages/AIPlanner/AIPlanner';
import MapPage from './pages/Map/MapPage';
import Settings from './pages/Settings/Settings';
import Profile from './pages/Profile/Profile';
import SavedPlaces from './pages/Saved/SavedPlaces';
import Itineraries from './pages/Itineraries/Itineraries';
import ItineraryDetail from './pages/Itineraries/ItineraryDetail';
import DestinationDetail from './pages/Destination/DestinationDetail';
import TripPlan from './pages/TripPlan/TripPlan';
import Translator from './pages/Translator/Translator';
import Alerts from './pages/Alerts/Alerts';
import PriceAlerts from './pages/PriceDrops/PriceAlerts';

// ─── Page transition config ────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

const AnimatedPage = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="h-full">
    {children}
  </motion.div>
);

// ─── Loading screen shown during Firebase auth init ────────────────────────
const LoadingScreen = () => (
  <div className="h-screen w-full flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">Loading Travista...</p>
    </div>
  </div>
);

// ─── Error boundary ────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[Travista] Runtime error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-slate-900 text-white p-8">
          <div className="text-center max-w-md space-y-4">
            <div className="text-5xl">✈️</div>
            <h1 className="text-2xl font-black">Something went wrong</h1>
            <p className="text-slate-400 text-sm">{this.state.error?.message}</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-500 transition-all"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Routes (must be inside Router) ───────────────────────────────────────
function AnimatedRoutes() {
  const location = useLocation();
  const { loading } = useAuth();

  // Show loading spinner while Firebase resolves auth state
  // This prevents the flash-redirect to /login on page refresh
  if (loading) return <LoadingScreen />;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Public */}
        <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
        <Route path="/signup" element={<AnimatedPage><Signup /></AnimatedPage>} />

        {/* Protected */}
        <Route path="/onboarding" element={<ProtectedRoute><AnimatedPage><Onboarding /></AnimatedPage></ProtectedRoute>} />

        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AnimatedPage><Home /></AnimatedPage>} />
          <Route path="explore" element={<AnimatedPage><Explore /></AnimatedPage>} />
          <Route path="map" element={<AnimatedPage><MapPage /></AnimatedPage>} />
          <Route path="planner" element={<AnimatedPage><AIPlanner /></AnimatedPage>} />
          <Route path="ai-planner" element={<Navigate to="/planner" replace />} />
          <Route path="price-drops" element={<AnimatedPage><PriceAlerts /></AnimatedPage>} />
          <Route path="saved" element={<AnimatedPage><SavedPlaces /></AnimatedPage>} />
          <Route path="itineraries" element={<AnimatedPage><Itineraries /></AnimatedPage>} />
          <Route path="itinerary/:id" element={<AnimatedPage><ItineraryDetail /></AnimatedPage>} />
          <Route path="bookings" element={<Navigate to="/itineraries" replace />} />
          <Route path="alerts" element={<AnimatedPage><Alerts /></AnimatedPage>} />
          <Route path="translator" element={<AnimatedPage><Translator /></AnimatedPage>} />
          <Route path="profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
          <Route path="settings" element={<AnimatedPage><Settings /></AnimatedPage>} />
          <Route path="destination/:id" element={<AnimatedPage><DestinationDetail /></AnimatedPage>} />
          <Route path="trip-plan/:destination" element={<AnimatedPage><PageErrorBoundary><TripPlan /></PageErrorBoundary></AnimatedPage>} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <Router>
              <SmoothScroll />
              <PWAInstallBanner />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: { background: '#111827', color: '#fff', fontSize: '12px', borderRadius: '12px' },
                }}
              />
              <AnimatedRoutes />
              <AIChatbot />
            </Router>
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
