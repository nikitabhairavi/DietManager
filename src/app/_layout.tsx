import { Stack } from 'expo-router';
import React from 'react';

export default function RootStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Main Tab Group */}
      <Stack.Screen name="(tabs)" />

      {/* Planned Meals Screen */}
      <Stack.Screen
        name="meals/PlannedMealsScreen"
        options={{ headerShown: false, presentation: 'card' }}
      />
    </Stack>
  );
}