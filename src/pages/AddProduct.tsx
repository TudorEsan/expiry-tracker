import { addDoc } from "firebase/firestore";
import React, { useState } from "react";
import { View, Alert, StyleSheet, Platform } from "react-native";
import { Button } from "react-native-elements";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

import { db, auth } from "../../firebase.config";
import { collection } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Center,
  ChevronDownIcon,
  Icon,
  Input,
  InputField,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
} from "@gluestack-ui/themed";
import { categories } from "../config";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const AddProduct: React.FC<Props> = ({ navigation }) => {
  const [prodName, setProdName] = useState<string>("");
  const [prodCategory, setProdCategory] = useState<string>("");
  const [prodStatus, setProdStatus] = useState<string>("active");
  const [prodExpiryDate, setProdExpiryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [prodValue, setProdValue] = React.useState<string>("0");

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
    console.log(prodCategory);
    await addDoc(collection(db, "products"), {
      name: prodName,
      category: prodCategory,
      expiry_date: prodExpiryDate.toUTCString(),
      status: prodStatus,
      value: prodValue,
      id: Math.random().toString(36).substr(2, 9),
      uid : auth.currentUser?.uid,
    })
      .then((ref) => {
        console.log(ref.id);
        Alert.alert(prodName, " successfully added!", [
          { text: "OK", onPress: () => navigation.navigate("Home") }
        ]);
        navigation.navigate("Home");
      })
      .catch((error) => {
        Alert.alert("Error:", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Center>
        <Text size="2xl" bold>
          Add Item
        </Text>
      </Center>
      <Input variant="rounded" size="md">
        <InputField
          value={prodName}
          onChange={(e) => setProdName(e.nativeEvent.text)}
          placeholder="Product Name"
        />
      </Input>

      <Input variant="rounded">
  <InputField
    placeholder="Value"
    value={prodValue}
    onChange={(e) => {
      const inputValue = e.nativeEvent.text;
      const numericValue = parseFloat(inputValue);
      
      if (!isNaN(numericValue) && numericValue >= 0) {
        setProdValue(numericValue.toString());
      } else {
        setProdValue("");
      }
    }}
  />
</Input>
      <Select onValueChange={(arg) => setProdCategory(arg)}>
        <SelectTrigger variant="rounded" size="md">
          <SelectInput placeholder="Select category" />
          {/* @ts-ignore */}
          <SelectIcon mr="$3">
            <Icon as={ChevronDownIcon} />
          </SelectIcon>
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {categories.map((category, index) => {
              return (
                <SelectItem
                  key={index}
                  label={category.label}
                  value={category.value}
                />
              );
            })}
          </SelectContent>
        </SelectPortal>
      </Select>

      <Text>{prodExpiryDate.toLocaleDateString()}</Text>
      <Button title="Select Date" onPress={showDatepicker} />
      {showDatePicker && (
        <DateTimePicker
          textColor="grey"
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
        titleStyle={styles.loginButtonText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 15,
  },
  labelContainer: {
    marginBottom: 100,
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
    margin: "auto",
  },
  loginButtonText: {
    margin: "auto",
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
