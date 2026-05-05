// src/data/locations.js

// We maintain a curated database of top global countries and their popular cities/states.
// For a production app, this would be backed by an API or a full JSON blob from the countries-states-cities-database.
// This subset covers major Indian states and global destinations with their hierarchical data.

export const countries = [
  {
    iso2: "IN",
    name: "India",
    currency: "INR",
    flag: "🇮🇳",
    continent: "Asia",
    basePricing: {
      ultraBudget: { hotel: 800, food: 400, transport: 200, activities: 0 },
      budget: { hotel: 2000, food: 800, transport: 500, activities: 500 },
      comfort: { hotel: 5000, food: 2000, transport: 1000, activities: 1500 },
      luxury: { hotel: 12000, food: 5000, transport: 3000, activities: 4000 }
    },
    states: [
      {
        name: "Rajasthan",
        pricingMultiplier: 1.1, // slightly more expensive than average India
        cities: ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer", "Pushkar"]
      },
      {
        name: "Goa",
        pricingMultiplier: 1.3,
        cities: ["Panaji", "Margao", "Vasco da Gama"]
      },
      {
        name: "Maharashtra",
        pricingMultiplier: 1.2,
        cities: ["Mumbai", "Pune", "Nagpur"]
      },
      {
        name: "Kerala",
        pricingMultiplier: 1.15,
        cities: ["Kochi", "Thiruvananthapuram", "Munnar"]
      }
    ]
  },
  {
    iso2: "FR",
    name: "France",
    currency: "EUR",
    flag: "🇫🇷",
    continent: "Europe",
    basePricing: {
      ultraBudget: { hotel: 3000, food: 1500, transport: 800, activities: 500 }, // converted approx to INR
      budget: { hotel: 6000, food: 3000, transport: 1500, activities: 1500 },
      comfort: { hotel: 12000, food: 6000, transport: 3000, activities: 4000 },
      luxury: { hotel: 30000, food: 15000, transport: 8000, activities: 10000 }
    },
    states: [
      {
        name: "Île-de-France",
        pricingMultiplier: 1.4, // Paris is expensive
        cities: ["Paris", "Versailles"]
      },
      {
        name: "Provence-Alpes-Côte d'Azur",
        pricingMultiplier: 1.3,
        cities: ["Nice", "Cannes", "Marseille"]
      }
    ]
  },
  {
    iso2: "US",
    name: "United States",
    currency: "USD",
    flag: "🇺🇸",
    continent: "North America",
    basePricing: {
      ultraBudget: { hotel: 4000, food: 2000, transport: 1000, activities: 500 },
      budget: { hotel: 8000, food: 4000, transport: 2000, activities: 2000 },
      comfort: { hotel: 15000, food: 8000, transport: 4000, activities: 5000 },
      luxury: { hotel: 40000, food: 20000, transport: 10000, activities: 12000 }
    },
    states: [
      {
        name: "New York",
        pricingMultiplier: 1.5,
        cities: ["New York City", "Buffalo", "Albany"]
      },
      {
        name: "California",
        pricingMultiplier: 1.4,
        cities: ["Los Angeles", "San Francisco", "San Diego"]
      }
    ]
  },
  {
    iso2: "ID",
    name: "Indonesia",
    currency: "IDR",
    flag: "🇮🇩",
    continent: "Asia",
    basePricing: {
      ultraBudget: { hotel: 600, food: 300, transport: 150, activities: 0 },
      budget: { hotel: 1500, food: 700, transport: 300, activities: 400 },
      comfort: { hotel: 4000, food: 1500, transport: 800, activities: 1000 },
      luxury: { hotel: 10000, food: 4000, transport: 2000, activities: 3000 }
    },
    states: [
      {
        name: "Bali",
        pricingMultiplier: 1.3,
        cities: ["Ubud", "Kuta", "Seminyak", "Canggu"]
      },
      {
        name: "Jakarta",
        pricingMultiplier: 1.1,
        cities: ["Central Jakarta", "South Jakarta"]
      }
    ]
  }
];

/**
 * Searches for countries, states, and cities efficiently.
 * Returns a unified array of results with their hierarchy string.
 * @param {string} query 
 * @returns {Array} List of location matches
 */
export function searchLocations(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results = [];

  countries.forEach(country => {
    // Check country match
    if (country.name.toLowerCase().includes(q)) {
      results.push({
        type: 'country',
        name: country.name,
        hierarchy: country.name,
        flag: country.flag,
        data: country
      });
    }

    country.states.forEach(state => {
      // Check state match
      if (state.name.toLowerCase().includes(q)) {
        results.push({
          type: 'state',
          name: state.name,
          hierarchy: `${state.name}, ${country.name}`,
          flag: country.flag,
          countryName: country.name,
          data: state,
          parentCountry: country
        });
      }

      state.cities.forEach(city => {
        // Check city match
        if (city.toLowerCase().includes(q)) {
          results.push({
            type: 'city',
            name: city,
            hierarchy: `${city}, ${state.name}, ${country.name}`,
            flag: country.flag,
            countryName: country.name,
            stateName: state.name,
            parentState: state,
            parentCountry: country
          });
        }
      });
    });
  });

  // Sort: Exact matches first, then by type (city > state > country)
  return results.sort((a, b) => {
    if (a.name.toLowerCase() === q) return -1;
    if (b.name.toLowerCase() === q) return 1;
    return 0;
  }).slice(0, 10); // Return top 10 results
}

/**
 * Gets the pricing and metadata details for a given destination name
 * Handles fallback to state or country averages.
 */
export function getDestinationDetails(destinationName) {
  const q = destinationName.toLowerCase();
  let found = null;

  // Search hierarchy
  for (const country of countries) {
    if (country.name.toLowerCase() === q) {
      return { type: 'country', name: country.name, ...country };
    }
    for (const state of country.states) {
      if (state.name.toLowerCase() === q) {
        return { type: 'state', name: state.name, stateMultiplier: state.pricingMultiplier, parentCountry: country };
      }
      for (const city of state.cities) {
        if (city.toLowerCase() === q) {
          return { type: 'city', name: city, stateMultiplier: state.pricingMultiplier, parentCountry: country };
        }
      }
    }
  }

  // If not found, fallback to a global average (similar to India base)
  return {
    type: 'unknown',
    name: destinationName,
    stateMultiplier: 1.0,
    parentCountry: countries[0] // Fallback to India pricing
  };
}
