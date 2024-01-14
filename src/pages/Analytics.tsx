import { Center, HStack, Spinner, Text, VStack, View } from "@gluestack-ui/themed";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect } from "react";
import { db } from "../../firebase.config";
import { analyzeProducts } from "../helpers/analytics";
import { Chart } from "react-google-charts";

export const Analytics = () => {
  const options = {
    title: "Age vs. Weight comparison",
    hAxis: { title: "Age", viewWindow: { min: 0, max: 15 } },
    vAxis: { title: "Weight", viewWindow: { min: 0, max: 15 } },
    legend: "none"
  };
  
  const dataChart = [
    ["Age", "Weight"],
    [8, 12],
    [4, 5.5],
    [11, 14],
    [4, 5],
    [3, 3.5],
    [6.5, 7]
  ];
  const [analytics, setAnalytics] = React.useState<any>(null);
  const [products, setProducts] = React.useState<any>(null);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      async (snapshot) => {
        const productsList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            expiry_date: new Date(data.expiry_date),
          };
        });
        setProducts(productsList);
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
    <VStack>
      <Center>
        <Text size="2xl">Analytics</Text>
        
        <VStack>
          <Text size="lg">
            Expired Product Count:{" "}
            {analytics.statusDistribution?.expired ?? "N/A"}
          </Text>
          <Text size="lg">
            Active Products Count:{" "}
            {analytics.statusDistribution?.active ?? "N/A"}
          </Text>
          <Text size="lg">
            Saved from expiration:{" "}
            {analytics.statusDistribution?.archived ?? "N/A"}
          </Text>
          <Text size="lg">
            Total Value lost: {analytics.totalValueOfExpired}
          </Text>
          <Text size="lg">
            Average Value: {analytics.averageValuePerProduct}
          </Text>
          <Text size="lg">
            Most likely to expire: {analytics.mostLikelyToExpire || "N/A"}
          </Text>
          <Text size="lg">
            Most likely to not expire:{" "}
            {analytics.likelyToBeArchived || "N/A"}
          </Text>
          <Text size="lg">
            All Products Count: {analytics.totalProducts || "N/A"}
          </Text>
        </VStack>       
      </Center>
      <View>
        <Chart
  chartType="ScatterChart"
  data={dataChart}
  options={options}
  width="80%"
  height="400px"
  legendToggle
/>
    </View>
    </VStack>
    
  );
};
