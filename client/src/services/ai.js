import axios from 'axios';
import { auth } from '../firebase';

export async function generateTrip(prompt) {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    // We send the 'prompt' (which is the destination input from the user) and a budget to our new backend
    const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/trips/generate`, {
      destination: prompt,
      budget: 'Medium (Comfortable)' // Default or pass it through from context
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.data.success) throw new Error("Backend failed to generate trip");

    return res.data.itinerary.structuredPlan;
  } catch (error) {
    console.error("Generate trip error:", error);
    throw error;
  }
}
