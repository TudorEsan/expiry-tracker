import { addDoc } from "firebase/firestore";
import React, { useState } from "react";
import { View, Alert, StyleSheet, Text, Platform } from "react-native";
import { Input, Button } from "react-native-elements";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

import { db } from "../../firebase.config";
import { collection } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const AddProduct: React.FC<Props> = ({ navigation }) => {
  const [prodName, setProdName] = useState<string>("");
  const [prodCategory, setProdCategory] = useState<string>("");
  const [prodExpiryDate, setProdExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, date: any) => {
    setShowDatePicker(Platform.OS === "ios"); // On iOS, DateTimePicker is shown in a modal

    if (date !== undefined) {
      setProdExpiryDate(date);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const addProduct = async () => {
    await addDoc(collection(db, "products"), {
      name: prodName,
      category: prodCategory,
      expiry_date: prodExpiryDate.toUTCString(),
    })
      .then(() => {
        Alert.alert("Product added successfully!");
        navigation.navigate("Home");
      })
      .catch((error) => {
        Alert.alert("Error:", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="Name"
        value={prodName}
        onChangeText={setProdName}
        inputContainerStyle={{ borderBottomWidth: 0 }} // Hide underline
        style={styles.input}
      />
      <Input
        placeholder="Category"
        value={prodCategory}
        onChangeText={setProdCategory}
        inputContainerStyle={{ borderBottomWidth: 0 }} // Hide underline
        style={styles.input}
      />
      <Text>{prodExpiryDate.toLocaleDateString()}</Text>
      <Button title="Select Date" onPress={showDatepicker} />
      {showDatePicker && (
        <DateTimePicker
          value={prodExpiryDate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateChange}
        />
      )}
      <Button
        title="Add Product"
        onPress={addProduct}
        buttonStyle={styles.loginButton}
        titleStyle={styles.loginButtonText} // Center text horizontally
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
    alignItems: "center",
  },
  loginButtonText: {
    marginRight: 80,
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

export default AddProduct;
