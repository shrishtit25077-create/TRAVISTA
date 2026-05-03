import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Navigation, Sparkles, ArrowRight, MapPin, Star, MessageSquare, X, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { destinations as allDestinations } from '../../data/destinations';
import HomeHero from './HomeHero';
import { useDestinationPhotos, usePlace, useWeather } from '../../hooks/useTravista';
