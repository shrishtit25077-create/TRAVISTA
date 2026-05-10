/**
 * Travista Flight Search Service
 * Uses Kiwi Tequila API (public search endpoint, no auth required for basic search)
 * Falls back to smart curated mock data when API is unavailable.
 */

const TEQUILA_BASE = 'https://api.tequila.kiwi.com/v2';

// Common city → IATA code mapping for fast auto-fill
const CITY_IATA = {
  // India
  'delhi': 'DEL', 'new delhi': 'DEL', 'mumbai': 'BOM', 'bengaluru': 'BLR',
  'bangalore': 'BLR', 'hyderabad': 'HYD', 'chennai': 'MAA', 'kolkata': 'CCU',
  'goa': 'GOI', 'pune': 'PNQ', 'ahmedabad': 'AMD', 'kochi': 'COK',
  'jaipur': 'JAI', 'lucknow': 'LKO', 'varanasi': 'VNS', 'amritsar': 'ATQ',
  // Asia
  'tokyo': 'TYO', 'osaka': 'KIX', 'kyoto': 'ITM', 'bangkok': 'BKK',
  'singapore': 'SIN', 'bali': 'DPS', 'jakarta': 'CGK', 'hanoi': 'HAN',
  'ho chi minh': 'SGN', 'beijing': 'PEK', 'shanghai': 'PVG', 'hong kong': 'HKG',
  'seoul': 'ICN', 'taipei': 'TPE', 'kuala lumpur': 'KUL', 'colombo': 'CMB',
  'kathmandu': 'KTM', 'dhaka': 'DAC', 'doha': 'DOH', 'dubai': 'DXB',
  // Europe
  'london': 'LHR', 'paris': 'CDG', 'amsterdam': 'AMS', 'berlin': 'BER',
  'rome': 'FCO', 'barcelona': 'BCN', 'madrid': 'MAD', 'prague': 'PRG',
  'vienna': 'VIE', 'zurich': 'ZRH', 'istanbul': 'IST', 'athens': 'ATH',
  'lisbon': 'LIS', 'stockholm': 'ARN', 'copenhagen': 'CPH', 'oslo': 'OSL',
  // Americas
  'new york': 'JFK', 'los angeles': 'LAX', 'chicago': 'ORD', 'san francisco': 'SFO',
  'miami': 'MIA', 'toronto': 'YYZ', 'vancouver': 'YVR', 'mexico city': 'MEX',
  'cancun': 'CUN', 'bogota': 'BOG', 'lima': 'LIM', 'buenos aires': 'EZE',
  'rio de janeiro': 'GIG', 'sao paulo': 'GRU',
  // Others
  'sydney': 'SYD', 'melbourne': 'MEL', 'auckland': 'AKL', 'cairo': 'CAI',
  'nairobi': 'NBO', 'cape town': 'CPT', 'johannesburg': 'JNB',
};

/**
 * Extract IATA code from a destination string.
 * Tries exact match, then partial, then returns a guessed 3-letter code.
 */
export function extractIATA(destination = '') {
  const lower = destination.toLowerCase().trim();
  // direct match
  if (CITY_IATA[lower]) return CITY_IATA[lower];
  // partial match
  for (const [city, code] of Object.entries(CITY_IATA)) {
    if (lower.includes(city) || city.includes(lower)) return code;
  }
  // best-effort: first 3 uppercase letters of first word
  return destination.replace(/[^a-zA-Z ]/g, '').trim().slice(0, 3).toUpperCase() || 'XXX';
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
