import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { register, login, getAuthMethods, oauthCallback } from '../controllers/auth.controller.js';
import { TwoFactorController } from '../controllers/twofactor.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import prisma from '../config/prisma.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/methods', getAuthMethods);

// 2FA functionality removed per user request

// Google OAuth
router.get('/google', async (req, res, next) => {
  const settings = await prisma.authSettings.findFirst();
  if (!settings?.googleEnabled) return res.status(403).json({ message: 'Google login disabled' });
  passport.authenticate('google')(req, res, next);
});
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_failed' }), oauthCallback);

// Facebook OAuth
router.get('/facebook', async (req, res, next) => {
  const settings = await prisma.authSettings.findFirst();
  if (!settings?.facebookEnabled) return res.status(403).json({ message: 'Facebook login disabled' });
  passport.authenticate('facebook')(req, res, next);
});
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login?error=facebook_failed' }), oauthCallback);

// GitHub OAuth
router.get('/github', async (req, res, next) => {
  const settings = await prisma.authSettings.findFirst();
  if (!settings?.githubEnabled) return res.status(403).json({ message: 'GitHub login disabled' });
  passport.authenticate('github')(req, res, next);
});
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login?error=github_failed' }), oauthCallback);

export default router;
