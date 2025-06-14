import { format } from 'date-fns';

interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  date: string;
}

class CurrencyService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
    this.baseUrl = 'https://api.exchangerate-api.com/v4';
  }

  async getExchangeRates(baseCurrency: string): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${this.baseUrl}/latest/${baseCurrency}?apiKey=${this.apiKey}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data: ExchangeRateResponse = await response.json();
      return data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  }

  async getHistoricalRates(baseCurrency: string, date: string): Promise<Record<string, number>> {
    try {
      const formattedDate = format(new Date(date), 'yyyy-MM-dd');
      const response = await fetch(`${this.baseUrl}/${formattedDate}?base=${baseCurrency}&apiKey=${this.apiKey}`);
      if (!response.ok) {
        throw new Error('Failed to fetch historical rates');
      }
      const data: ExchangeRateResponse = await response.json();
      return data.rates;
    } catch (error) {
      console.error('Error fetching historical rates:', error);
      throw error;
    }
  }

  async convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date?: string
  ): Promise<number> {
    try {
      const rates = date
        ? await this.getHistoricalRates(fromCurrency, date)
        : await this.getExchangeRates(fromCurrency);

      const rate = rates[toCurrency];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }

      return amount * rate;
    } catch (error) {
      console.error('Error converting amount:', error);
      throw error;
    }
  }

  getAvailableCurrencies(): string[] {
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'SGD',
      'NZD', 'MXN', 'HKD', 'TRY', 'KRW', 'RUB', 'BRL', 'ZAR', 'SEK', 'NOK'
    ];
  }

  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}

export const currencyService = new CurrencyService(); 