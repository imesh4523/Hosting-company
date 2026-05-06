import axios from 'axios';

export class CurrencyService {
  private static cache: { rates: any; timestamp: number } | null = null;
  private static CACHE_DURATION = 3600 * 1000; // 1 hour

  /**
   * Fetches latest exchange rates from USD
   */
  static async getRates() {
    if (this.cache && (Date.now() - this.cache.timestamp < this.CACHE_DURATION)) {
      return this.cache.rates;
    }

    try {
      // Using a free exchange rate API
      const response = await axios.get('https://open.er-api.com/v6/latest/USD');
      if (response.data && response.data.rates) {
        this.cache = {
          rates: response.data.rates,
          timestamp: Date.now()
        };
        return response.data.rates;
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.error('[Currency] Failed to fetch rates, using fallback:', (error as Error).message);
      // Fallback rates if API fails
      return {
        USD: 1,
        LKR: 300,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83
      };
    }
  }

  /**
   * Converts USD to target currency
   */
  static async convert(amount: number, targetCurrency: string): Promise<number> {
    const rates = await this.getRates();
    const rate = rates[targetCurrency.toUpperCase()] || 1;
    return parseFloat((amount * rate).toFixed(2));
  }
}
