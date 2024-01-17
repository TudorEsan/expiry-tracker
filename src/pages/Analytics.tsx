import { Center, Spinner, Text, VStack } from "@gluestack-ui/themed";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect } from "react";
import { db, auth } from "../../firebase.config";
import { analyzeProducts } from "../helpers/analytics";
import { StyleSheet } from "react-native";

export const Analytics = () => {
  const [analytics, setAnalytics] = React.useState<any>(null);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      async (snapshot) => {
        const currentUserUid = auth.currentUser?.uid;
        const productsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            uid: data.uid,
            id: doc.id,
            expiry_date: new Date(data.expiry_date),
          };
        }).filter((product) => product.uid === currentUserUid);
        try {
          const analytics = analyzeProducts(productsList);
          console.log(analytics);
          setAnalytics(analytics);
        } catch (error) {
          console.log(error);
          setAnalytics("error");
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  if (analytics === null) {
    return <Spinner />;
  }

  if (analytics === "error") {
    return <Text>Error</Text>;
  }

  return (
    <VStack style={styles.container}>
      <Center style={styles.textContainer}>
        <Text size="3xl" style={styles.element}>Analytics</Text>
        <VStack>
          <Text size="xl" style={styles.element}>
            Expired Product Count:{" "}
            {analytics.statusDistribution?.expired ?? "N/A"}
          </Text>
          <Text size="xl" style={styles.element}>
            Active Products Count:{" "}
            {analytics.statusDistribution?.active ?? "N/A"}
          </Text>
          <Text size="xl" style={styles.element}>
            Saved from expiration:{" "}
            {analytics.statusDistribution?.archived ?? "N/A"}
          </Text>
          <Text size="xl" style={styles.element}>
            Total Value lost: {analytics.totalValueOfExpired}
          </Text>
          <Text size="xl" style={styles.element}>
            Average Value: {analytics.averageValuePerProduct.toFixed(2)}
          </Text>
          <Text size="xl" style={styles.element}>
            Most likely to expire: {analytics.mostLikelyToExpire || "N/A"}
          </Text>
          <Text size="xl" style={styles.element}>
            Most likely to not expire:{" "}
            {analytics.likelyToBeArchived || "N/A"}
          </Text>
          <Text size="xl" style={styles.element}>
            All Products Count: {analytics.totalProducts || "N/A"}
          </Text>
        </VStack>       
      </Center>
    </VStack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    padding: 16,
  },
  textContainer: {
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 10,
    padding: 10,
  },
  element: {
    marginVertical: 5,
  },
});

export {  };