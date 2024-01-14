// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";

import { signOut } from "firebase/auth";
import { auth, firebase, db } from "../../firebase.config";
import withAuthProtection from "../hocs/withAuthProtection";
import { collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { NOTIFY_BEFORE } from "../config";
import { Alert } from "react-native";

// import PushNotification from "react-native-push-notification";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleAddProduct = () => {
    navigation.navigate("AddProduct");
  };
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };
  
  const deleteProduct = async (product: any) => {
    const productRef = doc(collection(db, "products"), product.uid);
    await deleteDoc(productRef)
      .then(() => {
        Alert.alert(product.name + " deleted successfully!");
      })
      .catch((error) => {
        Alert.alert("Error:", error.message);
      });
      closeModal();
  };
  
  const editProduct = async (product: any) => {
    const productRef = doc(collection(db, "products"), product.uid);
    product.name = "A";
    console.log(product)
    await updateDoc(productRef, {category: product.category, expiry_date: product.expiry_date.toUTCString(), name: product.name})
      .then(() => {
        Alert.alert(product.name + " updated successfully!");
      })
      .catch((error) => {
        Alert.alert("Error:", error.message);
      });
      closeModal();
  };

  useEffect(() => {
    // PushNotification.configure({
    //   // ... configure as needed ...
    //   onNotification: function (notification) {
    //     console.log("NOTIFICATION:", notification);
    //   },
    //   requestPermissions: Platform.OS === "ios",
    // });

    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const productsList = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          return {
            ...data,
            expiry_date: new Date(data.expiry_date),
            uid: doc.id
          };
        })
        // @ts-ignore
        .sort((a, b) => a.expiry_date - b.expiry_date);
      checkForExpiringProducts(productsList);
      setProducts(productsList);
    });

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

  const checkForExpiringProducts = (productsList: any[]) => {
    const now = new Date().getTime();
    productsList.forEach((product) => {
      if (product.expiry_date - now <= NOTIFY_BEFORE) {
        Alert.alert("Expiration Alert", `${product.name} is expiring soon!`);
      }
    });
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
          <TouchableOpacity style={styles.productContainer} key={index} onPress={() => handleProductClick(product)}>
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
          </TouchableOpacity>
        );
      })}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>{selectedProduct?.name}</Text>
            {/* <Button title="Edit" onPress={closeModal} /> */}
            <TouchableOpacity onPress={() => deleteProduct(selectedProduct)}>
              <Text>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("EditProduct", {selectedProduct})}>
              <Text>Edit</Text>
            </TouchableOpacity>
            <Button title="Close" onPress={closeModal} />
          </View>
        </View>
      </Modal>
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
export default withAuthProtection(HomeScreen);
