import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ProfileImageUploaderProps {
    initialImageUri?: string | null;
    onImageSelected?: (uri: string) => void;
    size?: number;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
    initialImageUri = null,
    onImageSelected,
    size = 110,
}) => {
    const [imageUri, setImageUri] = useState<string | null>(initialImageUri);

    const pickImageFromGallery = async () => {
        try {
            // DocumentPicker uses core OS file system dialogs — immune to native module linkage crashes
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*', // Filter directly to device photo formats
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const localUri = result.assets[0].uri;
                setImageUri(localUri);

                if (onImageSelected) {
                    onImageSelected(localUri);
                }
            }
        } catch (error) {
            console.error('Error selecting image from gallery:', error);
            Alert.alert('Error', 'Unable to pick image from gallery.');
        }
    };

    const badgeSize = Math.max(28, Math.round(size * 0.28));
    const badgeIconSize = Math.max(14, Math.round(badgeSize * 0.5));

    return (
        <View style={[styles.outerWrapper, { width: size, height: size }]}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickImageFromGallery}
                style={styles.touchableContainer}
            >
                {/* Profile Image View */}
                <View style={[styles.avatarCircle, { borderRadius: size / 2 }]}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.avatarImage} />
                    ) : (
                        <Ionicons name="person-circle" size={size} color="#0000FF" />
                    )}
                </View>

                {/* Camera Overlay Badge */}
                <View
                    style={[
                        styles.cameraBadge,
                        {
                            width: badgeSize,
                            height: badgeSize,
                            borderRadius: badgeSize / 2,
                        },
                    ]}
                >
                    <Ionicons name="camera" size={badgeIconSize} color="#FFFFFF" />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    outerWrapper: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    touchableContainer: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    avatarCircle: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F2F2F7',
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#0000FF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2.5,
        borderColor: '#FFFFFF',
        elevation: 4,
    },
});

export default ProfileImageUploader;