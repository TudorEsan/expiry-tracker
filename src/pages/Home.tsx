// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

import { signOut } from "firebase/auth";
import { auth, firebase, db } from "../../firebase.config";
import withAuthProtection from "../hocs/withAuthProtection";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { NOTIFY_BEFORE } from "../config";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// import PushNotification from "react-native-push-notification";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleAddProduct = () => {
    navigation.navigate("AddProduct");
  };
  const [products, setProducts] = useState<any[]>([]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    // PushNotification.configure({
    //   // ... configure as needed ...
    //   onNotification: function (notification) {
    //     console.log("NOTIFICATION:", notification);
    //   },
    //   requestPermissions: Platform.OS === "ios",
    // });

    const unsubscribe = onSnapshot(
      collection(db, "products"),
      async (snapshot) => {
        const productsList = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              ...data,
              expiry_date: new Date(data.expiry_date),
            };
          })
          // @ts-ignore
          .sort((a, b) => a.expiry_date - b.expiry_date);
        await checkForExpiringProducts(productsList);
        setProducts(productsList);
      }
    );

    // const checkProducts = () => {
    //   products.forEach((product) => {
    //     const now = new Date().getTime();
    //     if (product.expiry_date - now <= NOTIFY_BEFORE) {
    //       PushNotification.localNotification({
    //         title: "Product Expiring Soon",
    //         message: `${product.name} is expiring soon!`,
    //         // ... other notification options ...
    //       });
    //     }
    //   });
    // };

    // const checkInterval = setInterval(checkProducts, 1000 * 60); // Check every minute

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const storeExpiredProductId = async (id: string) => {
    try {
      const expiredProducts = await AsyncStorage.getItem("expiredProducts");
      const expiredIds = expiredProducts ? JSON.parse(expiredProducts) : [];
      if (!expiredIds.includes(id)) {
        expiredIds.push(id);
        await AsyncStorage.setItem(
          "expiredProducts",
          JSON.stringify(expiredIds)
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isProductAlreadyNotified = async (id: string) => {
    try {
      const expiredProducts = await AsyncStorage.getItem("expiredProducts");
      const expiredIds = expiredProducts ? JSON.parse(expiredProducts) : [];
      return expiredIds.includes(id);
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const checkForExpiringProducts = async (productsList: any[]) => {
    const now = new Date().getTime();
    for (const product of productsList) {
      console.log(product)
      if (
        product.expiry_date - now <= NOTIFY_BEFORE &&
        !(await isProductAlreadyNotified(product.id))
      ) {
        Alert.alert("Expiration Alert", `${product.name} is expiring soon!`);
        await storeExpiredProductId(product.id);
      }
    }
  };

  const isExpiringSoon = (date: Date) => {
    const now = new Date();
    return date.getTime() - now.getTime() <= NOTIFY_BEFORE;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.productText}>My products:</Text>
      {products.map((product, index) => {
        const formattedDate = product.expiry_date.toLocaleDateString();
        const expiringSoon = isExpiringSoon(product.expiry_date);

        return (
          <View style={styles.productContainer} key={index}>
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text
                style={[
                  styles.productDate,
                  expiringSoon && styles.expiringSoon,
                ]}
              >
                {formattedDate}
              </Text>
            </View>
            <Text style={styles.productCategory}>{product.category}</Text>
          </View>
        );
      })}
      <TouchableOpacity
        style={styles.addProductButton}
        onPress={handleAddProduct}
      >
        <Text style={styles.addProductButtonText}>+</Text>
      </TouchableOpacity>
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
  productText: {
    fontSize: 20,
  },
  addProductButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },

  addProductButtonText: {
    fontSize: 30,
    color: "white",
  },
  productContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    marginBottom: 10,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  productDate: {
    fontSize: 14,
    color: "#888",
  },
  productCategory: {
    fontSize: 16,
    color: "black",
    fontStyle: "italic",
  },
  expiringSoon: {
    color: "red",
  },
});
export default withAuthProtection(HomeScreen);
