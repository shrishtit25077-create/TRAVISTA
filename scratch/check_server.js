
import fetch from 'node-fetch';

async function checkServer() {
  try {
    const res = await fetch('http://localhost:5001/api/ai/generate-trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination: 'Bali', budget: 50000, days: 5, type: 'Solo' })
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Data:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Server check failed:', err.message);
  }
}

checkServer();
