// screens/LoginScreen.tsx
import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Input, Button } from 'react-native-elements';
import { auth } from "../../firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";


type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("Logged in successfully!");
        // Navigate to the Home screen or another screen as needed
        navigation.navigate('Home');
      })
      .catch((error) => {
        Alert.alert("Error:", error.message);
      });
  };

  return (
    <View>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Don't have an account? Sign Up"
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
};

export default LoginScreen;
