import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SHEET_URL_KEY = '@sheet_api_url';

let currentUrl = null;

// Initialize
(async () => {
    try {
        currentUrl = await AsyncStorage.getItem(SHEET_URL_KEY);
    } catch (e) {}
})();

export const GoogleSheetsService = {
    /**
     * Sets the Web App URL deployed by the user.
     * @param {string} url
     */
    setApiUrl: async (url) => {
        currentUrl = url;
        await AsyncStorage.setItem(SHEET_URL_KEY, url);
    },

    getApiUrl: () => currentUrl,

    /**
     * Adds an expense row to the sheet.
     * @param {object} expense
     */
    addExpense: async (expense) => {
        if (!currentUrl) {
            console.warn("Google Sheets API URL not set.");
            return expense; // Return as is, pretending it worked (or throw error)
        }

        try {
            // Expenses format: { id, date, description, amount, currency, convertedAmount, accCurrency, rate }
            const payload = {
                action: 'add',
                data: expense
            };

            // Apps Script Web App requires CORS handling or 'no-cors' mode sometimes,
            // but usually a simple POST works if the script handles OPTIONS.
            const response = await axios.post(currentUrl, payload);

            if (response.data && response.data.status === 'success') {
                return expense;
            } else {
                throw new Error(response.data?.message || 'Unknown error from Sheet');
            }
        } catch (error) {
            console.error("Google Sheets Add Error", error);
            throw error;
        }
    },

    /**
     * Fetches all expenses from the sheet.
     */
    getExpenses: async () => {
        if (!currentUrl) return [];

        try {
            const response = await axios.get(`${currentUrl}?action=get`);
            if (response.data && response.data.data) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error("Google Sheets Get Error", error);
            return [];
        }
    }
};
