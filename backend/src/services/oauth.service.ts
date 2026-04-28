import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from '../config/prisma';
import { decrypt } from '../utils/encryption.js';

export class OAuthService {
  static async init() {
    const settings = await prisma.authSettings.findFirst();
    if (!settings) return;

    if (settings.googleEnabled && settings.googleClientId && settings.googleSecret) {
      this.setupGoogle(settings.googleClientId, decrypt(settings.googleSecret));
    }

    if (settings.facebookEnabled && settings.facebookAppId && settings.facebookSecret) {
      this.setupFacebook(settings.facebookAppId, decrypt(settings.facebookSecret));
    }

    if (settings.githubEnabled && settings.githubClientId && settings.githubSecret) {
      this.setupGithub(settings.githubClientId, decrypt(settings.githubSecret));
    }
  }

  private static setupGoogle(clientId: string, clientSecret: string) {
    passport.use(new GoogleStrategy({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
      scope: ['profile', 'email']
    }, this.handleOAuthCallback('google')));
  }

  private static setupFacebook(appId: string, appSecret: string) {
    passport.use(new FacebookStrategy({
      clientID: appId,
      clientSecret: appSecret,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    }, this.handleOAuthCallback('facebook')));
  }

  private static setupGithub(clientId: string, clientSecret: string) {
    passport.use(new GitHubStrategy({
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`,
      scope: ['user:email']
    }, this.handleOAuthCallback('github')));
  }

  private static handleOAuthCallback(provider: string) {
    return async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('Email not provided by OAuth provider'), null);

        // 1. Check if OAuth record exists
        let oauthRecord = await prisma.userOAuth.findUnique({
          where: {
            provider_providerId: {
              provider,
              providerId: profile.id
            }
          }
        });

        if (oauthRecord) {
          const user = await prisma.user.findUnique({ where: { id: oauthRecord.userId } });
          return done(null, user);
        }

        // 2. Check if user with same email exists
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
          // Link account
          await prisma.userOAuth.create({
            data: {
              userId: existingUser.id,
              provider,
              providerId: profile.id,
              email,
              name: profile.displayName || profile.username || 'OAuth User',
              avatar: profile.photos?.[0]?.value || profile._json?.picture || profile._json?.avatar_url,
              accessToken: accessToken // In real app, might want to encrypt this too
            }
          });
          return done(null, existingUser);
        }

        // 3. Create new user
        const newUser = await prisma.user.create({
          data: {
            email,
            name: profile.displayName || profile.username || 'OAuth User',
            avatar: profile.photos?.[0]?.value || profile._json?.picture || profile._json?.avatar_url,
            emailVerified: true,
            role: 'customer',
            status: 'active',
            password: 'OAUTH_USER_' + Math.random().toString(36).slice(-10) // Placeholder password
          }
        });

        await prisma.userOAuth.create({
          data: {
            userId: newUser.id,
            provider,
            providerId: profile.id,
            email,
            name: profile.displayName || profile.username || 'OAuth User',
            avatar: profile.photos?.[0]?.value || profile._json?.picture || profile._json?.avatar_url,
            accessToken: accessToken
          }
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    };
  }
}
