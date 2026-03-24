import axios from 'axios';
import { subDays, isWeekend, format, isSameDay } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RATES_CACHE_KEY = '@rates_cache';

// Public APIs
const FIAT_API = 'https://open.er-api.com/v6/latest/USD';
const CRYPTO_API = 'https://api.coingecko.com/api/v3/simple/price';

export const CurrencyService = {
    /**
     * Get the exchange rate between two currencies for a specific date.
     * If date is weekend, it uses the previous Friday.
     * @param {string} from - Source currency code (e.g., 'USD')
     * @param {string} to - Target currency code (e.g., 'EUR')
     * @param {Date} date - Date of the transaction
     * @returns {Promise<number|null>} - The exchange rate or null if not found
     */
    getRate: async (from, to, date = new Date()) => {
        if (from === to) return 1;

        // Handle weekend logic: If Saturday or Sunday, use Friday's rate
        let targetDate = new Date(date);
        while (isWeekend(targetDate)) {
            targetDate = subDays(targetDate, 1);
        }

        const dateKey = format(targetDate, 'yyyy-MM-dd');
        // Unique key for cache: date + pair
        const cacheKey = `${dateKey}_${from}_${to}`;

        // 1. Check Cache
        const cached = await getCachedRate(cacheKey);
        if (cached) {
            console.log(`Using cached rate for ${from}->${to} on ${dateKey}: ${cached}`);
            return cached;
        }

        // 2. Fetch Rate
        try {
            console.log(`Fetching new rate for ${from}->${to} on ${dateKey}`);
            // Note: Public free APIs usually only give "latest" rates easily.
            // A production app would pay for historical data or use a more complex scraper.
            // Here we fetch "latest" but cache it as if it belongs to the target date
            // (assuming user is entering data near real-time or accepts current rate for past dates).

            const usdRates = await fetchUSDRates();

            if (usdRates[from] && usdRates[to]) {
                // Rate: How many 'to' for 1 'from'?
                // 1 From = (1 / usdRates[from]) USD
                // 1 USD = usdRates[to] To
                // 1 From = (usdRates[to] / usdRates[from]) To
                const rate = usdRates[to] / usdRates[from];

                await cacheRate(cacheKey, rate);
                return rate;
            } else {
                console.warn(`Rates not found for ${from} or ${to}`);
            }
        } catch (error) {
            console.error("Error fetching rate", error);
        }

        return null;
    }
};

// Helper to get rates relative to USD
// Returns object: { USD: 1, EUR: 0.92, VES: 36.5, USDT: 1.0, BTC: ... }
async function fetchUSDRates() {
    let rates = { USD: 1 };

    // 1. Fiat (Open ER API)
    try {
        const fiatRes = await axios.get(FIAT_API);
        if (fiatRes.data && fiatRes.data.rates) {
            Object.assign(rates, fiatRes.data.rates);
        }
    } catch (e) {
        console.log("Fiat fetch error", e.message);
    }

    // 2. Crypto (CoinGecko) - USDT, BTC
    try {
        const cryptoRes = await axios.get(`${CRYPTO_API}?ids=tether,bitcoin&vs_currencies=usd`);
        if (cryptoRes.data) {
            // CoinGecko gives "price in USD".
            // e.g. tether: { usd: 1.001 } -> 1 USDT = 1.001 USD.
            // We need "How many USDT for 1 USD".
            // 1 USD = (1 / 1.001) USDT.
            if (cryptoRes.data.tether?.usd) rates['USDT'] = 1 / cryptoRes.data.tether.usd;
            if (cryptoRes.data.bitcoin?.usd) rates['BTC'] = 1 / cryptoRes.data.bitcoin.usd;
        }
    } catch (e) {
        console.log("Crypto fetch error", e.message);
        // Fallback: assume USDT ~ USD if fetch fails? Better not to assume.
        if (!rates['USDT']) rates['USDT'] = 1.0;
    }

    return rates;
}

async function getCachedRate(key) {
    try {
        const cacheRaw = await AsyncStorage.getItem(RATES_CACHE_KEY);
        if (cacheRaw) {
            const cache = JSON.parse(cacheRaw);
            return cache[key];
        }
    } catch (e) {}
    return null;
}

async function cacheRate(key, rate) {
    try {
        const cacheRaw = await AsyncStorage.getItem(RATES_CACHE_KEY);
        const cache = cacheRaw ? JSON.parse(cacheRaw) : {};
        cache[key] = rate;
        await AsyncStorage.setItem(RATES_CACHE_KEY, JSON.stringify(cache));
    } catch (e) {}
}
