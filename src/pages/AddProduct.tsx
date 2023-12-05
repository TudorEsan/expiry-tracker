import { addDoc } from "firebase/firestore";
import React, { useState } from "react";
import { View, Alert, StyleSheet, Text, Platform } from "react-native";
import { Input, Button } from "react-native-elements";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";



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

  const categories = [
    { label: "Electronics", value: "electronics" },
    { label: "Books", value: "books" },
    { label: "Clothing", value: "clothing" },
    { label: "Home", value: "home" },
    { label: "Food", value: "food" },
  ];
  // this could be done on the server

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
      <RNPickerSelect
        onValueChange={(value) => setProdCategory(value)}
        items={categories}
        placeholder={{ label: "Select a category", value: null }}
        style={pickerSelectStyles}
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
})

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginVertical: 10,
    width: "100%",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
    marginVertical: 10,
    width: "100%",
  },
});

export default AddProduct;
