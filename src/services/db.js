import { db, auth } from './firebase';
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';

export const saveTrip = async (tripData) => {
  if (!auth.currentUser) throw new Error("User must be logged in to save trips");
  
  const uid = auth.currentUser.uid;
  const tripsRef = collection(db, 'users', uid, 'trips');
  
  try {
    const docRef = await addDoc(tripsRef, {
      ...tripData,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...tripData };
  } catch (err) {
    console.error("Error saving trip:", err);
    throw err;
  }
};

export const getTrips = async () => {
  if (!auth.currentUser) return [];
  
  const uid = auth.currentUser.uid;
  const tripsRef = collection(db, 'users', uid, 'trips');
  const q = query(tripsRef, orderBy('createdAt', 'desc'));
  
  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
  } catch (err) {
    console.error("Error fetching trips:", err);
    return [];
  }
};

export const deleteTrip = async (tripId) => {
  if (!auth.currentUser) return;
  const { doc, deleteDoc } = await import('firebase/firestore');
  const uid = auth.currentUser.uid;
  const tripRef = doc(db, 'users', uid, 'trips', tripId);
  await deleteDoc(tripRef);
};
