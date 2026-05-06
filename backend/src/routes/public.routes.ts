import { Router } from 'express';
import { CurrencyService } from '../services/currency.service.js';

const router = Router();

/**
 * Get current exchange rates
 */
router.get('/rates', async (req, res) => {
  try {
    const rates = await CurrencyService.getRates();
    res.json({ success: true, rates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch rates' });
  }
});

/**
 * System Status (Public)
 */
router.get('/status', (req, res) => {
  res.json({ success: true, status: 'operational', timestamp: Date.now() });
});

export default router;
