// screens/RegisterScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { auth } from "../../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Input } from 'react-native-elements';

// @ts-ignore
const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("User created successfully!");
        navigation.navigate("Login");
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
      <Button title="Sign Up" onPress={handleSignUp} />
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate("Login")}
      />
    </View>
  );
};

export default RegisterScreen;
