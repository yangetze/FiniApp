import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Inicializamos el cliente si tenemos las variables configuradas
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const SupabaseService = {
    /**
     * Adds an expense row to the Supabase database.
     * @param {object} expense
     */
    addExpense: async (expense) => {
        if (!supabase) {
            console.warn("Supabase client not initialized. Missing environment variables.");
            return expense; // Return as is, pretending it worked for local fallback
        }

        try {
            const { data, error } = await supabase
                .from('expenses')
                .insert([
                    {
                        id: expense.id,
                        date: expense.date,
                        description: expense.description,
                        amount: expense.amount,
                        currency: expense.currency,
                        converted_amount: expense.convertedAmount,
                        acc_currency: expense.accCurrency,
                        rate: expense.rate
                    }
                ])
                .select();

            if (error) {
                throw error;
            }

            return data ? data[0] : expense;
        } catch (error) {
            console.error("Supabase Add Error", error);
            throw error;
        }
    },

    /**
     * Fetches all expenses from the database.
     */
    getExpenses: async () => {
        if (!supabase) return [];

        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                throw error;
            }

            if (data) {
                // Mapear los nombres de columnas de base de datos a los nombres de propiedades de la aplicación
                return data.map(item => ({
                    id: item.id,
                    date: item.date,
                    description: item.description,
                    amount: item.amount,
                    currency: item.currency,
                    convertedAmount: item.converted_amount,
                    accCurrency: item.acc_currency,
                    rate: item.rate
                }));
            }
            return [];
        } catch (error) {
            console.error("Supabase Get Error", error);
            return [];
        }
    }
};
