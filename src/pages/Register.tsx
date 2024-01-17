import React, { useState } from "react";
import { View, Alert, StyleSheet,Text } from "react-native";
import { Input, Button } from 'react-native-elements';
import { auth } from "../../firebase.config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { NavigationProp , ParamListBase } from "@react-navigation/native";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("User created successfully!");
        navigation.navigate("Home");
      })
      .catch((error) => {
        Alert.alert("Error:", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.expiryLabel}>ExpiryTrack Pro</Text>
      </View>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        inputContainerStyle={{ borderBottomWidth: 0 }}
        style={styles.input}
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        inputContainerStyle={{ borderBottomWidth: 0 }}
        style={styles.input}
      />
      <Button
        title="Sign Up"
        onPress={handleSignUp}
        buttonStyle={styles.loginButton}
        titleStyle={styles.loginButtonText}
      />
      <Button
        title="Already have an account? Login"
        onPress={() => navigation.navigate("Login")}
        buttonStyle={styles.signupButton}
        titleStyle={styles.signupText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 15,
  },
  labelContainer: {
    marginBottom: 100, //spacing between label and inputs
  },
  expiryLabel: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333",

  },
  input: {
    marginVertical: 1,
    width: "100%",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: "black",
    marginTop: 50,
    width: "100%",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    marginRight: 100,
  },
  signupButton: {
    backgroundColor: "transparent",
    marginTop: 20,
    width: "100%",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "black",
  },
  signupText: {
    color: "black",
    marginRight: 25,
  },
});

export default RegisterScreen;
