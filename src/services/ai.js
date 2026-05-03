export async function generateTrip(prompt) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [
        {
          role: "system",
          content: "You are an expert travel planner. Generate detailed itineraries. Include duration, budget, and activities. Use clear line breaks and readable formatting.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await res.json();

  if (!data.choices) throw new Error("AI failed");

  return data.choices[0].message.content;
}
