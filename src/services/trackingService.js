const PREFIX = 'travista_signals_';

export const track = {
  viewed: (destination) => addSignal('viewed', destination, 1),
  saved: (destination) => addSignal('saved', destination, 3),
  itinerary: (destination) => addSignal('itinerary', destination, 5),
  searched: (query) => addSignal('searched', query, 1.5),
  categoryClick: (category) => addSignal('category', category, 1.5),
  timeSpent: (destination, seconds) => {
    if (seconds > 30) addSignal('timespent', destination, 2);
  },
};

function addSignal(type, value, weight) {
  const key = PREFIX + type;
  const existing = JSON.parse(localStorage.getItem(key) || '{}');
  existing[value] = (existing[value] || 0) + weight;
  localStorage.setItem(key, JSON.stringify(existing));
}

export function getAllSignals() {
  return {
    viewed: JSON.parse(localStorage.getItem(PREFIX + 'viewed') || '{}'),
    saved: JSON.parse(localStorage.getItem(PREFIX + 'saved') || '{}'),
    itinerary: JSON.parse(localStorage.getItem(PREFIX + 'itinerary') || '{}'),
    searched: JSON.parse(localStorage.getItem(PREFIX + 'searched') || '{}'),
    category: JSON.parse(localStorage.getItem(PREFIX + 'category') || '{}'),
    timespent: JSON.parse(localStorage.getItem(PREFIX + 'timespent') || '{}'),
  };
}

export function clearSignals() {
  ['viewed','saved','itinerary','searched','category','timespent']
    .forEach(t => localStorage.removeItem(PREFIX + t));
}
