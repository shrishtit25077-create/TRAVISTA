import toast from 'react-hot-toast';

/**
 * Persists a place to the user's saved collection.
 * Simulates a backend toggle with instant frontend feedback.
 */
export const toggleSavePlace = async (user, place, updateUser) => {
  if (!user) {
    toast.error("Please log in to save places.");
    return false;
  }

  const savedPlaces = user.preferences?.savedPlaces || [];
  const exists = savedPlaces.find(p => p.id === place.id);

  let newSavedPlaces;
  if (exists) {
    // Unsave
    newSavedPlaces = savedPlaces.filter(p => p.id !== place.id);
    toast("Removed from your trips", { icon: '🗑️' });
  } else {
    // Save
    newSavedPlaces = [...savedPlaces, { ...place, savedAt: new Date().toISOString() }];
    toast.success("Saved to your trips! ✈️");
  }

  // Update AuthContext (which persists to localStorage)
  updateUser({
    preferences: {
      ...user.preferences,
      savedPlaces: newSavedPlaces
    }
  });

  return !exists;
};

/**
 * Returns all saved places for the current user.
 */
export const getSavedPlaces = (user) => {
  return user?.preferences?.savedPlaces || [];
};
