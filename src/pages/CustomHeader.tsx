// Import necessary components and libraries
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StackHeaderProps } from "@react-navigation/stack";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.config";
import { Button, Icon, SettingsIcon, ShareIcon ,EyeIcon} from "@gluestack-ui/themed";

const CustomHeader: React.FC<StackHeaderProps> = ({ navigation }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>ExpiryTrack Pro</Text>
      <Button
        size="sm"
        rounded="$full"
        bgColor="$secondary500"
        onPress={() => {
          navigation.navigate("Analytics");
        }}
      >
        <Icon as={ShareIcon} color="$white" />
      </Button>
      <Button
        size="sm"
        rounded="$full"
        bgColor="$secondary500"
        onPress={() => {
          navigation.navigate("Charts");
        }}
      >
        <Icon as={EyeIcon} color="$white" />
      </Button>

      {/* <Button size='sm' rounded='$full' bgColor="$secondary500">
        <Icon as={ShareIcon} color="$white" />
      </Button> */}
      <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Define your styles
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "black",
    height: 100,
    paddingTop: 36,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
  },
  signOutButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  signOutButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default CustomHeader;
