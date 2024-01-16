// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import SwipeableFlatList from "react-native-swipeable-list";

import { signOut } from "firebase/auth";
import { auth, firebase, db } from "../../firebase.config";
import withAuthProtection from "../hocs/withAuthProtection";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { NOTIFY_BEFORE } from "../config";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Center, Divider, HStack } from "@gluestack-ui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@gluestack-ui/themed";
const darkColors = {
  background: "#121212",
  primary: "#BB86FC",
  primary2: "#3700b3",
  secondary: "#03DAC6",
  onBackground: "#FFFFFF",
  error: "#CF6679",
};

const colorEmphasis = {
  high: 0.87,
  medium: 0.6,
  disabled: 0.38,
};
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
  const [expired, setExpired] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [archived, setArchived] = useState<any[]>([]);

  const extractItemKey = (item: any) => {
    return item.id.toString();
  };

  const groupByStatus = (products: any[]) => {
    const expired: any[] = [];
    const active: any[] = [];
    const archived: any[] = [];

    for (const product of products) {
      if (product.uid == auth.currentUser?.uid)
      {
      switch (product.status) {
        case "expired":
          expired.push(product);
          break;
        case "archived":
          archived.push(product);
          break;
        default:
          active.push(product);
      }
    }
    }

    return { expired, active, archived };
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      async (snapshot) => {
        const currentUserUid = auth.currentUser?.uid;
        const productsList = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              ...data,
              id: doc.id,
              uid: data.uid,
              expiry_date: new Date(data.expiry_date),
            };
          }).filter((product) => product.uid === currentUserUid)
          // @ts-ignore
          .sort((a, b) => a.expiry_date - b.expiry_date);
        const { expired, active, archived } = groupByStatus(productsList);
        setExpired(expired);
        setActive(active);
        setArchived(archived);
        await checkForExpiringProducts(productsList);
        setProducts(productsList);
      }
    );

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

  const handleDelete = async (id: string) => {
    const toDelete = doc(db, "products", id);
    console.log("deleting", doc);
    await deleteDoc(toDelete);
  };

  const checkForExpiringProducts = async (productsList: any[]) => {
    const now = new Date().getTime();
    for (const product of productsList) {
      console.log(product);
      if (
        product.expiry_date - now <= NOTIFY_BEFORE &&
        !(await isProductAlreadyNotified(product.id))
      ) {
        Alert.alert("Expiration Alert", `${product.name} is expiring soon!`);
        await storeExpiredProductId(product.id);
      }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const toUpdate = doc(db, "products", id);
    console.log("updating status", doc);
    await updateDoc(toUpdate, { status });
  };

  const isExpiringSoon = (date: Date) => {
    const now = new Date();
    return date.getTime() - now.getTime() <= NOTIFY_BEFORE;
  };
  const QuickActions = (index: number, qaItem: any) => {
    return (
      <View style={styles.qaContainer}>
        <View style={[styles.button]}>
          <Pressable
            onPress={() => {
              updateStatus(qaItem.id, "archived");
            }}
          >
            <Text>Used</Text>
          </Pressable>
        </View>
        <View style={[styles.button]}>
          <Pressable
            onPress={() => {
              navigation.navigate("EditProduct", {qaItem});
            }}
          >
            <Text>Edit</Text>
          </Pressable>
        </View>
        <View style={[styles.button]}>
          <Pressable
            onPress={() => {
              handleDelete(qaItem.id);
            }}
          >
            <Text>Delete</Text>
          </Pressable>
        </View>
        <View style={[styles.button]}>
          <Pressable
            onPress={() => {
              updateStatus(qaItem.id, "expired");
            }}
          >
            <Text>Expired</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View>
      <SafeAreaView>
        <Center>
          <Text size="2xl" bold>
            Active Items
          </Text>
        </Center>
        <SwipeableFlatList
          keyExtractor={extractItemKey}
          data={active}
          renderItem={({ item }: any) => {
            console.log(item);
            const formattedDate = item.expiry_date.toLocaleDateString();
            const expiringSoon = isExpiringSoon(item.expiry_date);

            return (
              // <Text>{item.name}</Text>
              <View style={styles.productContainer}>
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text
                    style={[
                      styles.productDate,
                      expiringSoon && styles.expiringSoon,
                    ]}
                  >
                    {formattedDate}
                  </Text>
                </View>
                <Text style={styles.productCategory}>{item.category}</Text>
              </View>
            );
          }}
          maxSwipeDistance={275}
          renderQuickActions={({ index, item }: any) =>
            QuickActions(index, item)
          }
          // contentContainerStyle={styles.contentContainerStyle}
          shouldBounceOnMount={true}
          ItemSeparatorComponent={<Divider />}
        />
      </SafeAreaView>
      <Center>
        <TouchableOpacity
          style={styles.addProductButton}
          onPress={handleAddProduct}
        >
          <Text style={styles.addProductButtonText}>+</Text>
        </TouchableOpacity>
      </Center>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    // alignItems: "center",
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
    marginBottom: "5%",
  },
  addProductButtonText: {
    fontSize: 20,
    color: "white",
  },
  productContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f2f2f2",
    paddingVertical: 10,
    // marginBottom: 10,
    width: "100%",
    paddingLeft: 10,
    paddingRight: 10,
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
  headerContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "800",
    color: darkColors.onBackground,
    opacity: colorEmphasis.high,
  },
  item: {
    backgroundColor: "#121212",
    height: 80,
    flexDirection: "row",
    padding: 10,
  },
  messageContainer: {
    maxWidth: 300,
  },
  name: {
    fontSize: 16,
    color: darkColors.primary,
    opacity: colorEmphasis.high,
    fontWeight: "800",
  },
  subject: {
    fontSize: 14,
    color: darkColors.onBackground,
    opacity: colorEmphasis.high,
    fontWeight: "bold",
    textShadowColor: darkColors.secondary,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  text: {
    fontSize: 10,
    color: darkColors.onBackground,
    opacity: colorEmphasis.medium,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: darkColors.onBackground,
    opacity: colorEmphasis.high,
    borderColor: darkColors.primary,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 7,
    alignSelf: "center",
    shadowColor: darkColors.secondary,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 2,
    shadowOpacity: colorEmphasis.high,
  },
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: darkColors.onBackground,
    opacity: colorEmphasis.medium,
  },
  qaContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  button: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    opacity: colorEmphasis.high,
  },
  button1Text: {
    color: darkColors.primary,
  },
  button2Text: {
    color: darkColors.secondary,
  },
  button3Text: {
    color: darkColors.error,
  },
  contentContainerStyle: {
    flexGrow: 1,
  },
});
export default withAuthProtection(HomeScreen);
