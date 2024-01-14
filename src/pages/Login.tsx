import React, { useState } from "react";
import { View, Alert, StyleSheet,Text  } from "react-native";
import { Input, Button } from 'react-native-elements';
import { auth } from "../../firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../App";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert("Logged in successfully!");
        navigation.navigate('Home');
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
        inputContainerStyle={{ borderBottomWidth: 0 }} // Hide underline
        style={styles.input}
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        inputContainerStyle={{ borderBottomWidth: 0 }} // Hide underline
        style={styles.input}
      />
      <Button
          title="Login"
          onPress={handleLogin}
          buttonStyle={styles.loginButton}
          titleStyle={styles.loginButtonText} // Center text horizontally
        />
      <Button
        title="Don't have an account? Sign Up"
        onPress={() => navigation.navigate("Register")}
        buttonStyle={styles.signupButton}
        titleStyle={styles.signupText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2", 
    paddingHorizontal: 15,
   
   
  },
  labelContainer: {
    marginBottom: 100, // Adjust spacing between label and inputs
  },
  expiryLabel: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#333", // Adjust color if needed
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
    alignItems:"center",
  },
  loginButtonText: {
    marginRight:100,
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
    marginRight:25,
  },
});

export default LoginScreen;
