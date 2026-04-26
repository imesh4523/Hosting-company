import axios from 'axios';
import prisma from '../config/prisma';

const IPQUALITYSCORE_API_KEY = process.env.IPQUALITYSCORE_API_KEY;

export class FraudService {
  static async calculateScore(userId: string, ipAddress: string) {
    let score = 0;
    const flags: string[] = [];

    // 1. IP Intelligence (IPQualityScore)
    try {
      const response = await axios.get(`https://www.ipqualityscore.com/api/json/ip/${IPQUALITYSCORE_API_KEY}/${ipAddress}`);
      const data = response.data;

      if (data.vpn) {
        score += 25;
        flags.push('VPN Detected');
      }
      if (data.proxy) {
        score += 25;
        flags.push('Proxy Detected');
      }
      if (data.tor) {
        score += 25;
        flags.push('Tor Detected');
      }
      
      // Update fraud profile
      await prisma.fraudProfile.upsert({
        where: { userId },
        update: { 
          score, 
          ipAddress, 
          isVpn: data.vpn, 
          isProxy: data.proxy, 
          isTor: data.tor,
          lastChecked: new Date()
        },
        create: { 
          userId, 
          score, 
          ipAddress, 
          isVpn: data.vpn, 
          isProxy: data.proxy, 
          isTor: data.tor 
        }
      });
    } catch (error) {
      console.error('Fraud check failed:', error);
    }

    // 2. Multiple accounts same IP
    const sameIpUsers = await prisma.user.count({
      where: { fraudProfile: { ipAddress } }
    });
    if (sameIpUsers > 1) {
      score += 30;
      flags.push('Multiple accounts from same IP');
    }

    // 3. Update user fraud score
    await prisma.user.update({
      where: { id: userId },
      data: { fraudScore: score }
    });

    return { score, flags };
  }

  static async performActionByScore(userId: string, score: number) {
    if (score >= 81) {
      // Auto ban
      await prisma.user.update({
        where: { id: userId },
        data: { isBanned: true }
      });
      return 'BANNED';
    } else if (score >= 61) {
      return 'REQUIRE_ID_VERIFICATION';
    } else if (score >= 31) {
      return 'FLAG_FOR_REVIEW';
    }
    return 'NORMAL';
  }
}
