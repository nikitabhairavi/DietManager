import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ProgressScreen() {
  return (
    <View style={styles.center}>
      <Text style={styles.text}>Progress Tracker Screen</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
  text: { fontSize: 18, color: '#8E8E93' }
});