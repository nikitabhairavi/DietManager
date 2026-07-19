import { Stack } from 'expo-router';
import React from 'react';

export default function RootStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The main tab group screen */}
      <Stack.Screen name="(tabs)" />
      
      {/* 
        Future detail screens can be registered here like this:
        <Stack.Screen name="ingredient-detail" options={{ presentation: 'card' }} />
        <Stack.Screen name="add-meal-modal" options={{ presentation: 'modal' }} />
      */}
    </Stack>
  );
}