const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

// Rate limiting
// NOTE: le chat-widget interroge /api/chat/conversations toutes les 10s (~90 req/15min),
// donc la limite globale doit être assez haute pour ne pas bloquer une utilisation normale.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600, // limite par IP (le chat-widget à lui seul consomme ~90/15min)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, réessayez plus tard' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Increased slightly and returning JSON
  message: { message: 'Trop de tentatives, réessayez dans 15 minutes' }
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

module.exports = { helmet, limiter, authLimiter, corsOptions, cors };