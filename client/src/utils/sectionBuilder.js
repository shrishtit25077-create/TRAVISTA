export function buildSections(destinations, page = 1) {
  const types = ["row", "grid", "hero"];
  
  // Create a sequence that varies based on the page to ensure unpredictability
  const sections = [];
  
  // Always start first page with a Trending Row
  if (page === 1) {
    sections.push({
      id: `trending-${page}`,
      type: "row",
      title: "🔥 Trending Now",
      data: destinations.slice(0, 8),
    });
    
    sections.push({
      id: `beaches-${page}`,
      type: "grid",
      title: "🏝 Exotic Escapes",
      data: destinations.slice(8, 14),
    });

    sections.push({
      id: `hero-${page}`,
      type: "hero",
      title: "Luxury Retreats",
      data: destinations.slice(14, 15),
    });
  } else {
    // For subsequent pages, randomize the order but avoid consecutive same types
    const lastType = "hero"; // Assumption for simple logic
    
    // Mix 1
    sections.push({
      id: `row-${page}-1`,
      type: "row",
      title: page % 2 === 0 ? "🏔 Adventure Awaits" : "🍜 Culinary Journeys",
      data: destinations.slice(0, 8),
    });

    // Mix 2
    sections.push({
      id: `grid-${page}-2`,
      type: "grid",
      title: page % 2 === 0 ? "💎 Hidden Gems" : "🏛 Cultural Jewels",
      data: destinations.slice(8, 16),
    });
    
    // Occasionally add a Hero
    if (page % 3 === 0) {
      sections.push({
        id: `hero-${page}-3`,
        type: "hero",
        title: "World Wonders",
        data: destinations.slice(16, 17),
      });
    }
  }

  return sections;
}
