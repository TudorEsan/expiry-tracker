import { Spinner, Text, View } from "@gluestack-ui/themed";
import { collection, onSnapshot } from "firebase/firestore";
import React, { useEffect } from "react";
import { db, auth } from "../../firebase.config";
import { analyzeProducts } from "../helpers/analytics";
import { LineChart, PieChart } from "react-native-chart-kit";
import { StyleSheet, Dimensions, ScrollView } from "react-native";

export const Charts = () => {
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

  const labelsLine = generateLabels(new Date());
  const dataLine = analytics.valueLostByMonth.reverse();
  const labelsLineWon = generateLabels(new Date());
  const dataLineWon = analytics.valueWonByMonth.reverse();

return(
  <ScrollView style={styles.container}>
  <View style={styles.labelContainer}>
    <Text style={styles.textLabel}>Money lost in one year</Text>
  </View>
  <LineChart
    data={{
      labels: labelsLine,
      datasets: [
        {
          data: dataLine,
        }
      ]
    }}
    width={Dimensions.get("window").width} 
    height={220}
    //yAxisLabel="$"
    yAxisSuffix="lei"
    yAxisInterval={1} 
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#e8590b",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 2, 
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />
  <View style={styles.labelContainer}>
    <Text style={styles.textLabel}>Money lost on all categories</Text>
  </View>
  <PieChart
  data={[{
    name: "Food",
    population: analytics.valueLostByCategory[4],
    color: "#e8590b",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
      name: "Home",
      population: analytics.valueLostByCategory[3],
      color: "#ff8100",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Medicine",
      population: analytics.valueLostByCategory[2],
      color: "#af6147",
      legendFontColor: "#7F7F77",
      legendFontSize: 15
    },
    {
      name: "Books",
      population: analytics.valueLostByCategory[1],
      color: "#db9424",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Electronics",
      population: analytics.valueLostByCategory[0],
      color: "#f49900",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    }]}
    width={Dimensions.get('window').width - 16}
    height={220}
    chartConfig={{
      backgroundColor: '#1cc910',
      backgroundGradientFrom: '#eff3ff',
      backgroundGradientTo: '#efefef',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
    }}
    style={{
      marginVertical: 8,
      borderRadius: 16,
    }}
    accessor="population"
    backgroundColor="transparent"
    paddingLeft="15"
    absolute //for the absolute number remove if you want percentage
/>
<View style={styles.labelContainer}>
    <Text style={styles.textLabel}>Money saved in a year</Text>
  </View>
  <LineChart
    data={{
      labels: labelsLineWon,
      datasets: [
        {
          data: dataLineWon,
        }
      ]
    }}
    width={Dimensions.get("window").width}
    height={220}
    //yAxisLabel="$"
    yAxisSuffix="lei"
    yAxisInterval={1}
    chartConfig={{
      backgroundColor: "#1fa305",
      backgroundGradientFrom: "#1c9404",
      backgroundGradientTo: "#c7da27",
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#1fa305"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />
  <View style={styles.labelContainer}>
    <Text style={styles.textLabel}>Money saved on all categories</Text>
  </View>
  <PieChart
  data={[{
    name: "Food",
    population: analytics.valueWonByCategory[4],
    color: "#c0e19a",
    legendFontColor: "#7F7F7F",
    legendFontSize: 15
  },
  {
      name: "Home",
      population: analytics.valueWonByCategory[3],
      color: "#147c3c",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Medicine",
      population: analytics.valueWonByCategory[2],
      color: "#c7da27",
      legendFontColor: "#7F7F77",
      legendFontSize: 15
    },
    {
      name: "Books",
      population: analytics.valueWonByCategory[1],
      color: "#4f7523",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    },
    {
      name: "Electronics",
      population: analytics.valueWonByCategory[0],
      color: "#1c9404",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    }]}
    width={Dimensions.get('window').width - 16}
    height={220}
    chartConfig={{
      backgroundColor: '#1cc910',
      backgroundGradientFrom: '#eff3ff',
      backgroundGradientTo: '#efefef',
      decimalPlaces: 2,
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16,
      },
    }}
    style={{
      marginVertical: 8,
      borderRadius: 16,
    }}
    accessor="population"
    backgroundColor="transparent"
    paddingLeft="15"
    absolute 
/>
{analytics?.statusDistribution?.archived > analytics?.statusDistribution?.expired ? (
  <View style={styles.labelContainerTip}>
    <Text style={styles.textLabelTip}>"Great Job!Keep saving those products, and you're one step closer to a brand new Lamborghini!🚗💰"</Text>
  </View>
) : (
  <View style={styles.labelContainerTip}>
    <Text style={styles.textLabelTip}>"Here's a friendly tip to make your wallet and our planet smile: savor your products before they hit their expiration date!🌍💚"</Text>
  </View>
)}

</ScrollView>
);
}

function generateLabels(mostRecentExpiredDate: Date) {
    const labels = [];
    let currentMonth = mostRecentExpiredDate.getMonth();
    let currentYear = mostRecentExpiredDate.getFullYear();
    
    for (let i = 0; i < 12; i++) {
      labels.unshift(`${getMonthName(currentMonth)}`);
      currentMonth -= 1;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear -= 1;
      }
    }
  
    return labels;
  }
  
  function getMonthName(monthIndex: number) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
  
    return months[monthIndex];
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: "#f2f2f2", 
    },
    labelContainer: {
      justifyContent: "center",
      alignItems: "center",
      marginTop:20,
      marginBottom: 20, 
    },
    textLabel: {
      fontSize: 17,
      color: "#333", 
    },
    labelContainerTip: {
      justifyContent: "center",
      alignItems: "center", 
      margin: 30,
    },
    textLabelTip: {
      textAlign:"center",
      fontSize: 15,
      fontStyle: 'italic',
      fontWeight: 'bold',
      color: "#333", 
    },
  });