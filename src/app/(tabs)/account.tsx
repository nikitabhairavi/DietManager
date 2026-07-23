import { ProfileImageUploader } from '@/components/Account/ProfileInageUploader';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountScreen() {
    const router = useRouter();
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const handleImageSelected = (uri: string) => {
        setProfileImage(uri);
        // Store or upload image URI logic here
    };

    return (
        <View style={styles.container}>
            {/* Interactive Profile Image Upload Slot */}
            <View style={styles.profileHeader}>
                <ProfileImageUploader
                    initialImageUri={profileImage}
                    onImageSelected={handleImageSelected}
                    size={110}
                />
            </View>

            <View style={styles.section}>
                {/* Navigates to Set Goals Screen */}
                <TouchableOpacity
                    style={styles.row}
                    activeOpacity={0.7}
                    onPress={() => router.push('/goals/SetGoalsScreen')}
                >
                    <Ionicons name="options-outline" size={20} color="#007AFF" />
                    <Text style={[styles.rowText, { color: '#007AFF' }]}>Set Goals</Text>
                </TouchableOpacity>

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