import React, { createContext, useState, useEffect } from 'react';
import { StorageService } from '../services/StorageService';

export const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
    const [expenses, setExpenses] = useState([]);
    const [accountingCurrency, setAccountingCurrency] = useState('USD');
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const storedSettings = await StorageService.getSettings();
            if (storedSettings && storedSettings.accountingCurrency) {
                setAccountingCurrency(storedSettings.accountingCurrency);
            }
            const storedExpenses = await StorageService.getExpenses();
            setExpenses(storedExpenses || []);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const addExpense = async (expense) => {
        try {
            const newExpense = await StorageService.addExpense(expense);
            // Optimistic update or reload
            setExpenses(prev => [newExpense, ...prev]);
            return newExpense;
        } catch (error) {
            console.error("Failed to add expense", error);
            throw error;
        }
    };

    const updateAccountingCurrency = async (currency) => {
        try {
            setAccountingCurrency(currency);
            await StorageService.saveSettings({ accountingCurrency: currency });
            // In a real app, we might need to recalculate totals or re-fetch rates if the base currency changes drastically affecting historical data interpretation,
            // but for now we assume individual expenses store their converted amount based on the rate at the time of entry,
            // or we might want to re-convert everything.
            // The requirement says "register the amount in the destination currency".
            // So if I change the destination currency later, the old records might be inconsistent unless we stored the original amount and currency.
            // We should store: Original Amount, Original Currency, Target Currency, Target Amount, Exchange Rate, Date.
        } catch (error) {
            console.error("Failed to update settings", error);
        }
    };

    const clearData = async () => {
        await StorageService.clearData();
        setExpenses([]);
    };

    return (
        <FinanceContext.Provider value={{
            expenses,
            accountingCurrency,
            addExpense,
            setAccountingCurrency: updateAccountingCurrency,
            isLoading,
            refreshExpenses: loadData,
            clearData
        }}>
            {children}
        </FinanceContext.Provider>
    );
};
