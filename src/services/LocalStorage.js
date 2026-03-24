import AsyncStorage from '@react-native-async-storage/async-storage';

const EXPENSES_KEY = '@expenses';
const SETTINGS_KEY = '@settings';

export const LocalStorage = {
    addExpense: async (expense) => {
        try {
            const existing = await AsyncStorage.getItem(EXPENSES_KEY);
            const expenses = existing ? JSON.parse(existing) : [];
            expenses.unshift(expense); // Add to beginning
            await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
            return expense;
        } catch (e) {
            console.error("Error adding expense locally", e);
            throw e;
        }
    },
    getExpenses: async () => {
        try {
            const existing = await AsyncStorage.getItem(EXPENSES_KEY);
            return existing ? JSON.parse(existing) : [];
        } catch (e) {
            console.error("Error getting expenses locally", e);
            return [];
        }
    },
    saveSettings: async (settings) => {
        try {
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Error saving settings locally", e);
        }
    },
    getSettings: async () => {
        try {
            const existing = await AsyncStorage.getItem(SETTINGS_KEY);
            return existing ? JSON.parse(existing) : { accountingCurrency: 'USD' };
        } catch (e) {
            console.error("Error getting settings locally", e);
            return { accountingCurrency: 'USD' };
        }
    },
    clearData: async () => {
        await AsyncStorage.removeItem(EXPENSES_KEY);
    }
};
