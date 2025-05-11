const admin = async (req, res, next) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ msg: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = admin; 