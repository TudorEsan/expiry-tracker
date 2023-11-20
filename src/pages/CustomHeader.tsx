// Import necessary components and libraries
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackHeaderProps } from '@react-navigation/stack';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase.config';

// Define your custom header component
const CustomHeader: React.FC<StackHeaderProps> = ({ navigation }) => {
  const handleSignOut = async () => {
    try {
      // Perform sign-out logic here
      // For example, if using Firebase auth:
      await signOut(auth);
      navigation.navigate('Login'); // Navigate to the Login screen after signing out
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>ExpiryTrack Pro</Text>
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Define your styles
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'black',
    height: 90,
    paddingTop: 36,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CustomHeader;
