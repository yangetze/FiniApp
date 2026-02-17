import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FinanceProvider } from './src/context/FinanceContext';

import AddExpenseScreen from './src/screens/AddExpenseScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons'; // Assuming Expo environment

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <FinanceProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Add') {
                iconName = focused ? 'add-circle' : 'add-circle-outline';
              } else if (route.name === 'History') {
                iconName = focused ? 'list' : 'list-outline';
              } else if (route.name === 'Settings') {
                iconName = focused ? 'settings' : 'settings-outline';
              }

              // You can return any component that you like here!
              // If Ionicons is not available, we can return null or Text
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'tomato',
            tabBarInactiveTintColor: 'gray',
          })}
        >
          <Tab.Screen name="Add" component={AddExpenseScreen} options={{ title: 'New Expense' }} />
          <Tab.Screen name="History" component={HistoryScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </FinanceProvider>
  );
}
