import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppStore, AgeBand } from './src/store/useAppStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./global.css";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

// Mock Screens
const AgeBandSelectionScreen = () => {
  const setAgeBand = useAppStore((state) => state.setAgeBand);

  const bands: { id: AgeBand; label: string; color: string }[] = [
    { id: '5-8', label: 'Foundations (5-8)', color: 'bg-blue-400' },
    { id: '9-12', label: 'Explorers (9-12)', color: 'bg-green-400' },
    { id: '13-17', label: 'Experts (13-17)', color: 'bg-purple-400' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
      <Text className="text-2xl font-bold mb-8 text-center">Welcome to PennyWise! Select your age group:</Text>
      {bands.map((band) => (
        <TouchableOpacity
          key={band.id}
          className={`${band.color} w-full p-4 rounded-2xl mb-4 shadow-md`}
          onPress={() => setAgeBand(band.id)}
        >
          <Text className="text-white text-lg font-semibold text-center">{band.label}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

const DashboardScreen = ({ route }: any) => {
  const { ageBand } = route.params;
  const setAgeBand = useAppStore((state) => state.setAgeBand);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center p-6">
      <Text className="text-xl font-bold mb-4">Age Band: {ageBand}</Text>
      <View className="bg-white p-8 rounded-3xl shadow-lg items-center">
        <Text className="text-lg text-gray-700 text-center mb-4">
          This is the {ageBand} dashboard.{'\n'}
          Implementation coming soon!
        </Text>
        <TouchableOpacity 
          className="bg-red-500 p-3 rounded-xl mt-4"
          onPress={() => setAgeBand(null)}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  const ageBand = useAppStore((state) => state.ageBand);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {ageBand === null ? (
            <Stack.Screen name="AgeBandSelection" component={AgeBandSelectionScreen} />
          ) : (
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen} 
              initialParams={{ ageBand }} 
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
