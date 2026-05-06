import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { encrypt, decrypt } from '../utils/encryption.js';

export class TwoFactorService {
  /**
   * Generates a new 2FA secret for a user
   */
  static generateSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `UltaCore (${email})`,
      issuer: 'UltaCore'
    });

    return {
      otpauthUrl: secret.otpauth_url,
      base32: secret.base32
    };
  }

  /**
   * Generates a QR code data URL for the setup
   */
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    return await QRCode.toDataURL(otpauthUrl);
  }

  /**
   * Verifies a 2FA token against a secret
   */
  static verifyToken(secret: string, token: string): boolean {
    // Decrypt secret before use
    const decryptedSecret = decrypt(secret);
    
    return speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: 'base32',
      token: token,
      window: 1 // Allowance for time drift (30s)
    });
  }

  /**
   * Generates backup recovery codes
   */
  static generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }
}
