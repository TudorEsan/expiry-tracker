import React, { useEffect, useState, FC } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationProp, ParamListBase } from "@react-navigation/native";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase.config";

interface Props {
  navigation: NavigationProp<ParamListBase>;
}
const withAuthProtection = (WrappedComponent: FC<Props>) => {
  return (props: any) => {
    const [user, setUser] = useState<User | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setCheckingStatus(false);
      });
      return unsubscribe;
    }, []);

    if (checkingStatus) {
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      );
    }

    if (!user) {
      // If there is no user logged in, navigate to the login screen
      console.log("No user logged in");
      props.navigation.navigate("Login");
      return null;
    }

    // If the user is logged in, render the wrapped component
    return <WrappedComponent {...props} />;
  };
};

export default withAuthProtection;
