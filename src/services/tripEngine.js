export const generateTrip = ({ destination, budget, days, type }) => {
  const dailyBudget = Math.floor(budget / days);
  const plan = [];
  
  for (let i = 1; i <= days; i++) {
    plan.push({
      day: i,
      plan: [
        `Morning: Explore the popular sights of ${destination}`,
        `Afternoon: Enjoy local cuisine (Budget ~₹${Math.floor(dailyBudget * 0.3)})`,
        `Evening: Relax at your hotel or take a walk`
      ]
    });
  }

  return {
    summary: `A wonderful ${days}-day ${type} trip to ${destination} within your ₹${budget} budget.`,
    hotels: [
      { name: "Budget Stay", price: Math.floor(dailyBudget * 0.4) },
      { name: "Standard Hotel", price: Math.floor(dailyBudget * 0.6) }
    ],
    itinerary: plan,
    tips: [
      "Book your hotels in advance.",
      "Carry local currency for small expenses.",
      "Use public transport to save money."
    ]
  };
};
