/**
 * server/ai/gemini.route.js
 * POST /api/ai/generate-trip  → calls Gemini, returns structured trip JSON
 */
const express = require('express');
const router = express.Router();
const { generateTripWithGemini } = require('./gemini.service');

router.post('/generate-trip', async (req, res) => {
  const { destination, budget, days, type } = req.body;

  // Input validation
  if (!destination || typeof destination !== 'string') {
    return res.status(400).json({ error: 'destination is required' });
  }

  const params = {
    destination: destination.trim(),
    budget: Number(budget) || 50000,
    days: Math.min(Number(days) || 5, 14), // cap at 14 days
    type: type || 'Solo',
  };

  try {
    const plan = await generateTripWithGemini(params);
    return res.json({ success: true, plan });
  } catch (err) {
    console.error('[Gemini Route] Error:', err.message);

    // Return a specific error code so the frontend can handle gracefully
    const isQuota = err.message?.includes('429') || err.message?.includes('quota');
    return res.status(503).json({
      error: isQuota ? 'quota' : 'gemini_error',
      message: err.message,
    });
  }
});

module.exports = router;
