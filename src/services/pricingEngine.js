// src/services/pricingEngine.js
import { getDestinationDetails } from '../data/locations';

/**
 * Calculates a realistic trip cost based on destinations, duration, travelers, and requested tier.
 * Automatically scales down to cheaper tiers if the user's budget is too low,
 * or forces 'ultraBudget' if the budget is bare-minimum.
 * 
 * @param {Object} plan - The trip plan request
 * @param {Array<string>|string} plan.destinations - One or more destination names
 * @param {number} plan.totalDays - Total days of the trip
 * @param {number} plan.travelers - Number of travelers
 * @param {number} plan.userBudget - User's stated budget
 * @returns {Object} - Detailed breakdown, total estimated, tier used, and warnings
 */
export function calculateRealisticTripCost({ destinations: targetDestinations, totalDays, travelers, userBudget }) {
  // Normalize to array
  const destNames = Array.isArray(targetDestinations) ? targetDestinations : [targetDestinations];
  
  // Find destination objects dynamically using the new locations database
  const destData = destNames.map(name => {
    const details = getDestinationDetails(name);
    
    // Apply state multiplier to the country's base pricing
    const multiplier = details.stateMultiplier || 1.0;
    const basePricing = details.parentCountry?.basePricing || details.basePricing;
    
    // Create a deeply copied and multiplied pricing object
    const appliedPricing = {};
    const categories = ['ultraBudget', 'budget', 'comfort', 'luxury'];
    
    categories.forEach(cat => {
      appliedPricing[cat] = {
        hotelPricePerNight: Math.round(basePricing[cat].hotel * multiplier),
        foodPerDay: Math.round(basePricing[cat].food * multiplier),
        localTransportPerDay: Math.round(basePricing[cat].transport * multiplier),
        activitiesPerDay: Math.round(basePricing[cat].activities * multiplier)
      };
    });

    return {
      name,
      ...appliedPricing
    };
  });

  const tiers = ['ultraBudget', 'budget', 'comfort', 'luxury'];
  let selectedTier = 'budget';
  let warnings = null;

  // Simple calculation: test all tiers and find the best one that fits userBudget
  let bestFit = null;
  let minPossible = null;

  for (const tier of tiers) {
    const cost = calculateForTier(destData, totalDays, travelers, tier);
    if (tier === 'ultraBudget') minPossible = cost;
    
    if (cost.total <= userBudget) {
      bestFit = { tier, cost };
    }
  }

  // If even ultraBudget exceeds the user's budget
  if (!bestFit) {
    selectedTier = 'ultraBudget';
    bestFit = { tier: 'ultraBudget', cost: minPossible };
    warnings = `Your budget of ₹${userBudget.toLocaleString()} is very tight for this trip. The absolute minimum realistic cost is approx ₹${minPossible.total.toLocaleString()}. We will plan a shoestring budget trip.`;
  } else {
    // We want to pick the highest tier they can afford
    selectedTier = bestFit.tier;
  }

  return {
    tier: selectedTier,
    totalEstimated: bestFit.cost.total,
    perPersonPerDay: Math.round(bestFit.cost.total / (totalDays * travelers)),
    breakdown: bestFit.cost.breakdown,
    warnings,
    minFeasibleBudget: minPossible.total
  };
}

function calculateForTier(destData, totalDays, travelers, tier) {
  const daysPerCity = Math.max(1, Math.floor(totalDays / destData.length));
  let extraDays = totalDays % destData.length;

  let totalAccommodation = 0;
  let totalFood = 0;
  let totalActivities = 0;
  let totalLocalTransport = 0;

  destData.forEach((dest) => {
    let days = daysPerCity;
    if (extraDays > 0) {
      days += 1;
      extraDays -= 1;
    }
    const nights = Math.max(1, days - 1);

    // Assume 2 people per room for accommodation cost calculation
    const roomsNeeded = Math.ceil(travelers / 2);
    
    totalAccommodation += dest[tier].hotelPricePerNight * nights * roomsNeeded;
    totalFood += dest[tier].foodPerDay * days * travelers;
    totalActivities += dest[tier].activitiesPerDay * days * travelers;
    totalLocalTransport += dest[tier].localTransportPerDay * days * travelers;
  });

  // Estimate Inter-city Transport
  let interCityTransport = 0;
  let flightToFirstCity = 5000 * travelers; // base estimate
  
  if (tier === 'luxury') flightToFirstCity = 15000 * travelers;
  if (tier === 'comfort') flightToFirstCity = 8000 * travelers;

  if (destData.length > 1) {
    const interCityCostPerLeg = tier === 'ultraBudget' ? 1500 : tier === 'budget' ? 3000 : tier === 'comfort' ? 6000 : 12000;
    interCityTransport = interCityCostPerLeg * (destData.length - 1) * travelers;
  }

  const transportTotal = flightToFirstCity + interCityTransport + totalLocalTransport;
  const misc = Math.round((totalAccommodation + totalFood + totalActivities + transportTotal) * 0.1); // 10% buffer

  const total = totalAccommodation + totalFood + totalActivities + transportTotal + misc;

  return {
    total,
    breakdown: {
      accommodation: totalAccommodation,
      food: totalFood,
      activities: totalActivities,
      transport: transportTotal,
      misc
    }
  };
}
