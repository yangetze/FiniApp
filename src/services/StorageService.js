import { LocalStorage } from './LocalStorage';
import { SupabaseService } from './SupabaseService';

export const StorageService = {
    addExpense: async (expense) => {
        // Always save locally for redundancy/offline speed
        await LocalStorage.addExpense(expense);

        // Save to Supabase
        try {
            await SupabaseService.addExpense(expense);
        } catch (e) {
            console.warn("Failed to save to Supabase, but saved locally.", e);
            // Optionally mark for sync later
        }
        return expense;
    },

    getExpenses: async () => {
        try {
            const dbExpenses = await SupabaseService.getExpenses();
            if (dbExpenses && dbExpenses.length > 0) {
                // Return database data as source of truth
                return dbExpenses;
            }
        } catch (e) {
            console.warn("Failed to fetch from Supabase, falling back to local.", e);
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
        // Clear database? Probably not safer to delete user data on DB easily.
    }
};
