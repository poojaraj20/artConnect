const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, "superkey2025"); // same secret used to sign token
    req.user = decoded; // contains userId, iat, exp
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
