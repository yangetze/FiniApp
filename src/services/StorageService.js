import { LocalStorage } from './LocalStorage';
import { GoogleSheetsService } from './GoogleSheetsService';

export const StorageService = {
    addExpense: async (expense) => {
        // Always save locally for redundancy/offline speed
        await LocalStorage.addExpense(expense);

        // If Google Sheet is configured, save there too
        const sheetUrl = await GoogleSheetsService.getApiUrl();
        if (sheetUrl) {
            try {
                await GoogleSheetsService.addExpense(expense);
            } catch (e) {
                console.warn("Failed to save to Google Sheet, but saved locally.", e);
                // Optionally mark for sync later
            }
        }
        return expense;
    },

    getExpenses: async () => {
        const sheetUrl = await GoogleSheetsService.getApiUrl();
        if (sheetUrl) {
            try {
                const sheetExpenses = await GoogleSheetsService.getExpenses();
                if (sheetExpenses && sheetExpenses.length > 0) {
                    // Update local cache with sheet data?
                    // For now, just return sheet data as source of truth
                    return sheetExpenses;
                }
            } catch (e) {
                console.warn("Failed to fetch from Google Sheet, falling back to local.", e);
            }
        }
        return await LocalStorage.getExpenses();
    },

    saveSettings: async (settings) => {
        return await LocalStorage.saveSettings(settings);
    },

    getSettings: async () => {
        return await LocalStorage.getSettings();
    },

    clearData: async () => {
        await LocalStorage.clearData();
        // Clear sheet? Probably not safer to delete user data on sheet easily.
    },

    setSheetUrl: async (url) => {
        await GoogleSheetsService.setApiUrl(url);
    }
};
