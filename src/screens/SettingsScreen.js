import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { FinanceContext } from '../context/FinanceContext';
import { Picker } from '@react-native-picker/picker';

const SettingsScreen = () => {
    const { accountingCurrency, setAccountingCurrency, clearData } = useContext(FinanceContext);

    const handleClearData = () => {
        Alert.alert(
            "Clear Data",
            "Are you sure you want to delete all local expenses? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", onPress: async () => {
                    await clearData();
                    Alert.alert("Deleted", "Local data cleared.");
                }, style: "destructive" }
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Accounting Currency</Text>
                <Text style={styles.description}>Select the main currency for your reports.</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={accountingCurrency}
                        onValueChange={(itemValue) => setAccountingCurrency(itemValue)}
                    >
                        <Picker.Item label="USD - US Dollar" value="USD" />
                        <Picker.Item label="EUR - Euro" value="EUR" />
                        <Picker.Item label="VES - Venezuelan Bolivar" value="VES" />
                        <Picker.Item label="USDT - Tether" value="USDT" />
                    </Picker>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Database Integration</Text>
                <Text style={styles.description}>Data sync is automatically managed by Supabase using the configured environment variables.</Text>
            </View>

            <View style={styles.spacer} />

            <Button title="Clear Local Data" onPress={handleClearData} color="#d9534f" />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        flexGrow: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    section: {
        marginBottom: 30,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        backgroundColor: '#fafafa',
    },
    spacer: {
        flex: 1,
    },
});

export default SettingsScreen;
