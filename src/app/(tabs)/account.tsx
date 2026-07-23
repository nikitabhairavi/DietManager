// app/(tabs)/account.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountScreen() {
    return (
        <View style={styles.container}>
            <View style={styles.profileHeader}>
                <Ionicons name="person-circle" size={72} color="#007AFF" />
                <Text style={styles.name}>Account Settings</Text>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.row}>
                    <Ionicons name="settings-outline" size={20} color="#1C1C1E" />
                    <Text style={styles.rowText}>Preferences</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.row}>
                    <Ionicons name="cloud-upload-outline" size={20} color="#1C1C1E" />
                    <Text style={styles.rowText}>Data Backup</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.row, styles.logoutRow]}>
                <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                <Text style={[styles.rowText, { color: '#FF3B30' }]}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 20,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1C1C1E',
        marginTop: 8,
    },
    section: {
        marginTop: 20,
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    rowText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    logoutRow: {
        marginTop: 'auto',
        marginBottom: 20,
    },
});