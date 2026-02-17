import React, { useContext, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { FinanceContext } from '../context/FinanceContext';
import { format } from 'date-fns';

const HistoryScreen = () => {
    const { expenses, refreshExpenses, isLoading, accountingCurrency } = useContext(FinanceContext);

    useEffect(() => {
        refreshExpenses();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.row}>
                <Text style={styles.date}>{item.date}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            <View style={styles.row}>
                <Text style={styles.originalAmount}>
                    {item.amount.toFixed(2)} {item.currency}
                </Text>
                <Text style={styles.convertedAmount}>
                    {item.convertedAmount.toFixed(2)} {item.accCurrency}
                </Text>
            </View>
            {item.currency !== item.accCurrency && (
                <Text style={styles.rateInfo}>
                    Rate: {item.rate.toFixed(4)}
                </Text>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={expenses}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refreshExpenses} />
                }
                ListEmptyComponent={<Text style={styles.emptyText}>No expenses recorded yet.</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 10,
    },
    itemContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    date: {
        fontSize: 12,
        color: '#888',
    },
    description: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginLeft: 10,
        textAlign: 'right',
    },
    originalAmount: {
        fontSize: 14,
        color: '#666',
    },
    convertedAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007bff',
    },
    rateInfo: {
        fontSize: 10,
        color: '#aaa',
        fontStyle: 'italic',
        marginTop: 2,
        textAlign: 'right',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
    },
});

export default HistoryScreen;
