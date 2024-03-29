import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet, Text } from "react-native";
import { Input, Button, CheckBox } from 'react-native-elements';
import { auth } from "../../firebase.config";
import { signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from "@react-navigation/native";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('storedEmail');
      const storedPassword = await AsyncStorage.getItem('storedPassword');
      const storedRememberMe = await AsyncStorage.getItem('storedRememberMe');

      if (storedRememberMe === 'true' && storedEmail && storedPassword) {
        setEmail(storedEmail);
        setPassword(storedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error loading stored credentials:', error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      if (rememberMe) {
        await AsyncStorage.setItem('storedEmail', email);
        await AsyncStorage.setItem('storedPassword', password);
        await AsyncStorage.setItem('storedRememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('storedEmail');
        await AsyncStorage.removeItem('storedPassword');
        await AsyncStorage.removeItem('storedRememberMe');
      }

      Alert.alert("Logged in successfully!");
      navigation.navigate("Home");
    } catch (error) {
      Alert.alert("Error");
    }
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
      <View style={styles.rememberMeContainer}>
        <CheckBox
          title="Remember Me"
          containerStyle={styles.rememberMeInputContainer}
          checked={rememberMe}
          onPress={() => setRememberMe(!rememberMe)}
        />
      </View>
      <Button
        title="Login"
        onPress={handleLogin}
        buttonStyle={styles.loginButton}
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
    width: 250,
    borderRadius: 25,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "auto",
  },
  loginButtonText: {
    marginRight: 100,
    textAlign: 'center'
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
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rememberMeInputContainer: {
    flex: 1,
    borderBottomWidth: 0,
  },
});

export default LoginScreen;


