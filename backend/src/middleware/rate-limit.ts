import rateLimit from 'express-rate-limit';

/**
 * Standard API Limiter
 * 200 requests per 1 minute
 */
export const standardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again after a minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict Auth Limiter (Login/Register/Reset)
 * 10 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: {
    status: 429,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Fragment/Asset Limiter (UI heavy)
 * 300 requests per 1 minute
 */
export const uiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300,
  message: {
    status: 429,
    message: 'Slow down! Too many UI requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
