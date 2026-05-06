const Trip = require('./trip.model');
const Itinerary = require('./itinerary.model');
const DecisionEngine = require('../ai/decisionEngine.service');
const User = require('../user/user.model');

exports.generateTrip = async (req, res) => {
  try {
    const { destination, budget } = req.body;
    // Assuming auth middleware sets req.user
    const authId = req.user?.authId || 'auth-user-123';
    
    let user = await User.findOne({ authId });
    if (!user) {
      // Mock user for demo if not found
      user = await User.create({ authId: 'auth-user-123', email: 'test@example.com' });
    }

    // 1. Create Trip
    const trip = await Trip.create({
      userId: user._id,
      inputs: { destination, budget: budget || user.preferences?.budget },
      status: 'generating'
    });

    // 2. Run Decision Engine
    const plan = await DecisionEngine.generateTripPlan({ destination, budget }, user.preferences);

    // 3. Save Itinerary
    const itinerary = await Itinerary.create({
      tripId: trip._id,
      structuredPlan: plan
    });

    // 4. Update Trip status
    trip.status = 'complete';
    await trip.save();

    res.status(200).json({ success: true, trip, itinerary });
  } catch (error) {
    console.error('Generate Trip Error:', error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
};

exports.getUserTrips = async (req, res) => {
  try {
    const authId = req.user?.authId || 'auth-user-123';
    const user = await User.findOne({ authId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const trips = await Trip.find({ userId: user._id }).sort('-createdAt');
    res.status(200).json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching trips' });
  }
};
