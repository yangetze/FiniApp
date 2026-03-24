import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { FinanceContext } from '../context/FinanceContext';
import { CurrencyService } from '../services/CurrencyService';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';

const AddExpenseScreen = ({ navigation }) => {
    const { addExpense, accountingCurrency } = useContext(FinanceContext);

    const [date, setDate] = useState(new Date());
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [rate, setRate] = useState('1.0');
    const [convertedAmount, setConvertedAmount] = useState('0.0');

    const [loadingRate, setLoadingRate] = useState(false);
    const [manualRate, setManualRate] = useState(false);

    // Effect: When Amount, Currency, Date, or AccountingCurrency changes, fetch rate and calculate
    useEffect(() => {
        if (!manualRate) {
            fetchRate();
        } else {
            calculateConverted();
        }
    }, [currency, accountingCurrency, date]);

    useEffect(() => {
        calculateConverted();
    }, [amount, rate]);

    const fetchRate = async () => {
        setLoadingRate(true);
        try {
            const fetchedRate = await CurrencyService.getRate(currency, accountingCurrency, date);
            if (fetchedRate) {
                setRate(fetchedRate.toString());
            } else {
                // If fail, maybe keep old or set to 1?
                // Alert.alert("Notice", "Could not fetch exchange rate. Please enter manually.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingRate(false);
        }
    };

    const calculateConverted = () => {
        const amt = parseFloat(amount);
        const rt = parseFloat(rate);
        if (!isNaN(amt) && !isNaN(rt)) {
            setConvertedAmount((amt * rt).toFixed(2));
        } else {
            setConvertedAmount('');
        }
    };

    const handleSave = async () => {
        if (!description || !amount) {
            Alert.alert("Error", "Please fill in Description and Amount");
            return;
        }

        const expense = {
            id: Date.now().toString(),
            date: format(date, 'yyyy-MM-dd'),
            description,
            amount: parseFloat(amount),
            currency,
            convertedAmount: parseFloat(convertedAmount),
            accCurrency: accountingCurrency,
            rate: parseFloat(rate)
        };

        try {
            await addExpense(expense);
            Alert.alert("Success", "Expense added!");
            // Reset form
            setDescription('');
            setAmount('');
            setConvertedAmount('');
            // navigation.goBack(); // Optional
        } catch (e) {
            Alert.alert("Error", "Failed to save expense");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            {/* Simple Date Handling for MVP */}
            <View style={styles.dateRow}>
                 <Button title="Previous Day" onPress={() => setDate(d => new Date(d.setDate(d.getDate() - 1)))} />
                 <Text style={styles.dateText}>{format(date, 'yyyy-MM-dd')}</Text>
                 <Button title="Next Day" onPress={() => setDate(d => new Date(d.setDate(d.getDate() + 1)))} />
            </View>

            <Text style={styles.label}>Description</Text>
            <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Lunch, Taxi, etc."
            />

            <View style={styles.row}>
                <View style={{flex: 1, marginRight: 10}}>
                    <Text style={styles.label}>Amount</Text>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={setAmount}
                        placeholder="0.00"
                        keyboardType="numeric"
                    />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.label}>Currency</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={currency}
                            onValueChange={setCurrency}
                        >
                            <Picker.Item label="USD" value="USD" />
                            <Picker.Item label="EUR" value="EUR" />
                            <Picker.Item label="VES" value="VES" />
                            <Picker.Item label="USDT" value="USDT" />
                        </Picker>
                    </View>
                </View>
            </View>

            <View style={styles.rateContainer}>
                <Text style={styles.label}>Exchange Rate (to {accountingCurrency})</Text>
                {loadingRate ? <ActivityIndicator /> : (
                    <TextInput
                        style={[styles.input, manualRate && styles.manualInput]}
                        value={rate}
                        onChangeText={(t) => {
                            setRate(t);
                            setManualRate(true);
                        }}
                        keyboardType="numeric"
                    />
                )}
                {!manualRate && <Text style={styles.hint}>Auto-fetched. Edit to override.</Text>}
            </View>

            <View style={styles.resultContainer}>
                <Text style={styles.resultLabel}>Total in {accountingCurrency}:</Text>
                <Text style={styles.resultValue}>{convertedAmount}</Text>
            </View>

            <Button title="Save Expense" onPress={handleSave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: 'white',
        flex: 1,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    rateContainer: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    manualInput: {
        borderColor: '#007bff',
        backgroundColor: '#eef6ff',
    },
    hint: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    resultContainer: {
        marginVertical: 20,
        alignItems: 'center',
    },
    resultLabel: {
        fontSize: 18,
        color: '#555',
    },
    resultValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
    }
});

export default AddExpenseScreen;
