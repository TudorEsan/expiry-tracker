// screens/HomeScreen.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

import { signOut } from "firebase/auth";
import { auth } from "../../firebase.config";
import withAuthProtection from "../hocs/withAuthProtection";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <Text>Welcome Home!</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
};

export default withAuthProtection(HomeScreen);
