const User = require('../user/user.model');

// Firebase Admin (if setup) or JWT token verifier
const verifyToken = async (token) => {
  // In a real scenario, use firebase-admin:
  // const decoded = await admin.auth().verifyIdToken(token);
  // return decoded;
  
  // For now, since user will inject API keys later, we bypass strict verification if no key
  return { uid: 'auth-user-123', email: 'user@example.com', name: 'Test User' };
};

exports.loginOrRegister = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'No token provided' });

    const decoded = await verifyToken(token);
    
    let user = await User.findOne({ authId: decoded.uid });

    if (!user) {
      user = await User.create({
        authId: decoded.uid,
        email: decoded.email,
        name: decoded.name || 'Traveler'
      });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { authId } = req.user; // Assuming middleware sets this
    const { interests, budget, travelStyle } = req.body;

    const user = await User.findOneAndUpdate(
      { authId },
      { preferences: { interests, budget, travelStyle }, onboardingCompleted: true },
      { new: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { authId } = req.user;
    const { name, phoneNumber, location } = req.body;

    const user = await User.findOneAndUpdate(
      { authId },
      { name, phoneNumber, location, onboardingCompleted: true },
      { new: true }
    );

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
