import React, { useEffect, useState } from "react";
import {
  View,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
//@ts-ignore
import SwipeableFlatList from "react-native-swipeable-list";

import { auth, db } from "../../firebase.config";
import withAuthProtection from "../hocs/withAuthProtection";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { NOTIFY_BEFORE } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Center,
   ChevronDownIcon,
   Divider,
   Icon,
   Select,
   SelectBackdrop,
   SelectContent,
   SelectDragIndicator,
   SelectDragIndicatorWrapper,
   SelectIcon,
   SelectInput,
   SelectItem,
   SelectPortal,
   SelectTrigger } from "@gluestack-ui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@gluestack-ui/themed";
import { categoryFilter } from "../config";

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

interface Props {
  navigation: NavigationProp<ParamListBase>;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
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
          //@ts-ignore
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

  const checkForExpiringProducts = async (productsList: any[]) => {
    console.log("-----------------------------------------------");
    for (const product of productsList) {
      console.log(product);
      if (
        isExpired(product) &&
        !(await isProductAlreadyNotified(product.id))
      ) {
        Alert.alert("Expiration Alert", `${product.name} has expired!`);
        await storeExpiredProductId(product.id);
      }
      else if (
        isExpiringSoon(product) &&
        !(await isProductAlreadyNotified(product.id))
      ) {
        Alert.alert("Expiration Alert", `${product.name} is expiring soon!`);
        await storeExpiredProductId(product.id);
      }
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const toUpdate = doc(db, "products", id);
    await updateDoc(toUpdate, { status });
  };

  const isExpired = (product: any) => {
    const now = new Date();
    return product.expiry_date < now.getTime();
  };

  const isExpiringSoon = (product: any) => {
    const now = new Date();
    console.log(product.name, " - ", product.expiry_date, " - expiring soon: ", product.expiry_date <= now.getTime() + NOTIFY_BEFORE);
    return product.expiry_date - now.getTime() <= NOTIFY_BEFORE;
  };

  const handleDelete = async (id: string) => {
    const toDelete = doc(db, "products", id);
    await deleteDoc(toDelete);
  };
  const [inputText, setInputText] = useState('');
  const handleButtonPress = () => {
    Alert.prompt(
      'Enter Name',
      'Please enter your name:',
      (text) => setInputText(text),
      'plain-text',
      inputText
    );
  };
  const QuickActions = (index: number, qaItem: any) => {
    return (
      <View style={styles.qaContainer}>
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
              updateStatus(qaItem.id, "archived");
            }}
          >
            <Text>Used</Text>
          </Pressable>
        </View>
        {isExpired(qaItem) ?
        <View style={[styles.button]}>
          <Pressable
            onPress={() => {
              updateStatus(qaItem.id, "expired");
            }}
          >
            <Text>Expired</Text>
          </Pressable>
        </View>
        :
        <View style={[styles.button]}>
          <Pressable
            onPress={() => {handleButtonPress();console.log(inputText)}}
          >
            <Text>Share</Text>
          </Pressable>
        </View>
        }
      </View>
    );
  };

  return (
    <View>
      <SafeAreaView>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: Dimensions.get("window").height * 0.06 + 10, borderBottomWidth: 2 }}>
      <Text size="2xl" bold style={{marginLeft: "5%", marginBottom: "5%"}}>
        Active Items
      </Text>
      <Select onValueChange={(arg) => {setSelectedCategory(arg)}} style={{ width: 165, paddingBottom: "5%", paddingRight: "5%" }}>
        <SelectTrigger variant="rounded" size="md" >
          <SelectInput placeholder="Category" />
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
            {categoryFilter.map((category, index) => {
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
    </View>
        <SwipeableFlatList
          height={Dimensions.get("window").height * 0.6 + 5}
          keyExtractor={extractItemKey}
          data={active}
          renderItem={({ item }: any) => {
            const formattedDate = item.expiry_date.toLocaleDateString();
            const expiringSoon = isExpiringSoon(item);
            const expired = isExpired(item);

            return (
              (selectedCategory == "all" ||
              item.category == selectedCategory) &&
              <View style={[styles.productContainer,
                expiringSoon && styles.expiringSoon,
                expired && styles.expired,
              ]}
              >
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text
                    style={[
                      styles.productDate,
                      expiringSoon && styles.expiringSoon,
                      expired && styles.expired,
                    ]}
                  >
                    {formattedDate}
                  </Text>
                </View>
                <Text style={styles.productCategory}>{item.category}</Text>
              </View>
            );
          }}
          maxSwipeDistance={240}
          speed
          renderQuickActions={({ index, item }: any) =>
            QuickActions(index, item)
          }
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
    gap: 10,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 15,
  },
  productText: {
    fontSize: 20,
  },
  filterButton: {
    backgroundColor: "grey",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: "5%",
    marginBottom: "5%",
  },
  filterButtonText: {
    color: "white",
    fontSize: 16,
  },
  addProductButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "5%",
    marginBottom: "5%",
  },
  addProductButtonText: {
    fontSize: 20,
    color: "white",
    paddingTop: "25%",
  },
  productContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#e5e5e5",
    paddingVertical: 10,
    width: "100%",
    height: Dimensions.get("window").height / 10,
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
  expired: {
    color: "red",
    backgroundColor: "#ff7e82"
  },
  expiringSoon: {
    color: "red",
    backgroundColor: "#ffb5b7"
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
});

export default withAuthProtection(HomeScreen);
