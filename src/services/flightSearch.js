/**
 * Travista Flight Search Service
 * Uses Kiwi Tequila API (public search endpoint, no auth required for basic search)
 * Falls back to smart curated mock data when API is unavailable.
 */

const TEQUILA_BASE = 'https://api.tequila.kiwi.com/v2';

// Comprehensive airport dataset for autocomplete suggestions
export const AIRPORT_DATA = [
  { city: 'New Delhi', name: 'Indira Gandhi Intl', code: 'DEL', country: 'India' },
  { city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj', code: 'BOM', country: 'India' },
  { city: 'Bengaluru', name: 'Kempegowda Intl', code: 'BLR', country: 'India' },
  { city: 'Hyderabad', name: 'Rajiv Gandhi Intl', code: 'HYD', country: 'India' },
  { city: 'Chennai', name: 'Chennai Intl', code: 'MAA', country: 'India' },
  { city: 'Kolkata', name: 'Netaji Subhash Chandra Bose', code: 'CCU', country: 'India' },
  { city: 'Ahmedabad', name: 'Sardar Vallabhbhai Patel', code: 'AMD', country: 'India' },
  { city: 'Kochi', name: 'Cochin Intl', code: 'COK', country: 'India' },
  { city: 'Goa', name: 'Dabolim Airport', code: 'GOI', country: 'India' },
  { city: 'Goa', name: 'Manohar Intl Airport', code: 'GOX', country: 'India' },
  { city: 'Jaipur', name: 'Jaipur Intl', code: 'JAI', country: 'India' },
  { city: 'Tokyo', name: 'Haneda Airport', code: 'HND', country: 'Japan' },
  { city: 'Tokyo', name: 'Narita Intl', code: 'NRT', country: 'Japan' },
  { city: 'Osaka', name: 'Kansai Intl', code: 'KIX', country: 'Japan' },
  { city: 'Bangkok', name: 'Suvarnabhumi', code: 'BKK', country: 'Thailand' },
  { city: 'Bangkok', name: 'Don Mueang', code: 'DMK', country: 'Thailand' },
  { city: 'Singapore', name: 'Changi Airport', code: 'SIN', country: 'Singapore' },
  { city: 'Bali', name: 'Ngurah Rai Intl', code: 'DPS', country: 'Indonesia' },
  { city: 'London', name: 'Heathrow', code: 'LHR', country: 'United Kingdom' },
  { city: 'London', name: 'Gatwick', code: 'LGW', country: 'United Kingdom' },
  { city: 'Paris', name: 'Charles de Gaulle', code: 'CDG', country: 'France' },
  { city: 'Paris', name: 'Orly', code: 'ORY', country: 'France' },
  { city: 'Amsterdam', name: 'Schiphol', code: 'AMS', country: 'Netherlands' },
  { city: 'Berlin', name: 'Brandenburg', code: 'BER', country: 'Germany' },
  { city: 'Dubai', name: 'Dubai Intl', code: 'DXB', country: 'UAE' },
  { city: 'New York', name: 'John F. Kennedy', code: 'JFK', country: 'USA' },
  { city: 'New York', name: 'Newark Liberty', code: 'EWR', country: 'USA' },
  { city: 'Los Angeles', name: 'Los Angeles Intl', code: 'LAX', country: 'USA' },
  { city: 'San Francisco', name: 'San Francisco Intl', code: 'SFO', country: 'USA' },
  { city: 'Sydney', name: 'Kingsford Smith', code: 'SYD', country: 'Australia' },
  { city: 'Melbourne', name: 'Melbourne Airport', code: 'MEL', country: 'Australia' },
  { city: 'Rome', name: 'Fiumicino', code: 'FCO', country: 'Italy' },
  { city: 'Madrid', name: 'Adolfo Suárez Barajas', code: 'MAD', country: 'Spain' },
  { city: 'Barcelona', name: 'El Prat', code: 'BCN', country: 'Spain' },
  { city: 'Istanbul', name: 'Istanbul Airport', code: 'IST', country: 'Turkey' },
  { city: 'Doha', name: 'Hamad Intl', code: 'DOH', country: 'Qatar' },
];

/**
 * Robust airport search matching by city, code, name or country.
 */
export function searchAirports(query = '') {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().trim();
  return AIRPORT_DATA.filter(a => 
    a.city.toLowerCase().includes(q) ||
    a.code.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q) ||
    a.country.toLowerCase().includes(q)
  ).slice(0, 6);
}

/**
 * Extract IATA code from a destination string.
 */
export function extractIATA(destination = '') {
  const lower = destination.toLowerCase().trim();
  const match = AIRPORT_DATA.find(a => 
    lower.includes(a.city.toLowerCase()) || 
    lower.includes(a.name.toLowerCase()) ||
    lower.includes(a.code.toLowerCase())
  );
  return match ? match.code : destination.slice(0, 3).toUpperCase();
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Add days to a date
 */
export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

/**
 * Search flights using Kiwi Tequila API.
 * Falls back to rich mock data on failure.
 *
 * @param {object} params
 * @param {string} params.from   - IATA code
 * @param {string} params.to     - IATA code
 * @param {string} params.depart - YYYY-MM-DD
 * @param {string} params.returnDate - YYYY-MM-DD (optional)
 * @param {number} params.adults
 * @param {string} params.cabinClass - Economy | Business | First
 * @returns {Promise<Flight[]>}
 */
export async function searchFlights({ from, to, depart, returnDate, adults = 1, cabinClass = 'Economy' }) {
  console.log(`[Flights] Searching ${from} → ${to} on ${depart}`);

  // Try Kiwi Tequila public endpoint
  try {
    const params = new URLSearchParams({
      fly_from: from,
      fly_to: to,
      date_from: depart.split('-').reverse().join('/'),  // Kiwi uses DD/MM/YYYY
      date_to: depart.split('-').reverse().join('/'),
      adults,
      curr: 'INR',
      limit: 8,
      sort: 'price',
      one_per_date: 0,
      partner: 'picky',
    });

    if (returnDate) {
      params.set('return_from', returnDate.split('-').reverse().join('/'));
      params.set('return_to', returnDate.split('-').reverse().join('/'));
    }

    const res = await Promise.race([
      fetch(`${TEQUILA_BASE}/search?${params}`, {
        headers: { 'accept': 'application/json' }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
    ]);

    if (res.ok) {
      const json = await res.json();
      if (json.data?.length) {
        return json.data.map(normalizeTequilaFlight);
      }
    }
  } catch (err) {
    console.warn('[Flights] API unavailable, using curated results:', err.message);
  }

  // Curated smart fallback
  return generateMockFlights(from, to, depart, adults, cabinClass);
}

function normalizeTequilaFlight(f) {
  return {
    id: f.id,
    airline: f.airlines?.[0] || 'Unknown Airline',
    airlineCode: f.airlines?.[0] || 'XX',
    departure: new Date(f.dTimeUTC * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    arrival: new Date(f.aTimeUTC * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    duration: formatDuration(f.duration?.total || 0),
    stops: f.route?.length - 1 || 0,
    price: Math.round(f.price),
    currency: 'INR',
    bookingUrl: f.deep_link || `https://www.kiwi.com`,
    tags: [],
  };
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

// ─── Smart Mock Generator ────────────────────────────────────────────────────

const AIRLINES = [
  { name: 'IndiGo', code: '6E' },
  { name: 'Air India', code: 'AI' },
  { name: 'Vistara', code: 'UK' },
  { name: 'SpiceJet', code: 'SG' },
  { name: 'Emirates', code: 'EK' },
  { name: 'Singapore Airlines', code: 'SQ' },
  { name: 'Qatar Airways', code: 'QR' },
];

function generateMockFlights(from, to, depart, adults, cabinClass) {
  const base = cabinClass === 'Business' ? 45000 : cabinClass === 'First' ? 120000 : 12000;
  const longHaul = isLongHaul(from, to);
  const multiplier = longHaul ? 3.5 : 1;

  return AIRLINES.slice(0, 5).map((airline, i) => {
    const depHour = [6, 8, 11, 14, 19][i];
    const durationMins = longHaul ? 480 + i * 30 : 90 + i * 20;
    const arrHour = (depHour + Math.floor(durationMins / 60)) % 24;
    const arrMin = durationMins % 60;
    const stops = i === 0 ? 0 : i <= 2 ? 1 : 1;
    const priceVariance = 1 + (i * 0.12) - (i === 1 ? 0.05 : 0);
    const price = Math.round(base * multiplier * priceVariance * adults);

    const tags = [];
    if (i === 0) tags.push('cheapest');
    if (durationMins === Math.min(...[90, 110, 130, 150, 170])) tags.push('fastest');
    if (stops === 0) tags.push('nonstop');
    if (depHour < 9) tags.push('morning');
    if (depHour >= 17) tags.push('evening');

    return {
      id: `mock-${i}`,
      airline: airline.name,
      airlineCode: airline.code,
      departure: `${String(depHour).padStart(2, '0')}:00`,
      arrival: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
      duration: formatDuration(durationMins * 60),
      stops,
      price,
      currency: 'INR',
      bookingUrl: `https://www.google.com/flights?q=flights+from+${from}+to+${to}`,
      tags,
      isMock: true,
    };
  });
}

function isLongHaul(from, to) {
  const indian = ['DEL','BOM','BLR','HYD','MAA','CCU','GOI','PNQ'];
  const fromIndian = indian.includes(from);
  const toIndian = indian.includes(to);
  return (fromIndian && !toIndian) || (!fromIndian && toIndian) || (!fromIndian && !toIndian);
}
