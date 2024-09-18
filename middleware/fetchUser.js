const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');

    if (!token) {
        return res.status(401).json({ error: 'Login first to use this functionality.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userMail = decoded;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);

        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired. Please login again.' });
        } else {
            return res.status(500).json({ error: 'An error occurred while verifying token.' });
        }
    }
};

module.exports = fetchUser;
