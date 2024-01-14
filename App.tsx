// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator ,StackHeaderProps} from '@react-navigation/stack';
import LoginScreen from './src/pages/Login';
import Home from './src/pages/Home';
import RegisterScreen from './src/pages/Register';
import LoadingScreen from './src/pages/LoadingScreen';
import useAuth from './src/hooks/useAuth';
import AddProduct from './src/pages/AddProduct';
import EditProduct from './src/pages/EditProduct';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import CustomHeader from './src/pages/CustomHeader';
import { registerRootComponent } from 'expo';


export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  AddProduct: undefined;
  EditProduct: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    // Render loading screen while checking auth state
    // You can replace this with your loading component
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator >
        {currentUser ? (
          // User is signed in
          <React.Fragment>
            <Stack.Screen name="Home" component={Home}
            options={{
              header: (props) => <CustomHeader {...props} />,
            }} />
            <Stack.Screen name="AddProduct" component={AddProduct}
            options={{
              header: (props) => <CustomHeader {...props} />,
            }} />
            <Stack.Screen name="EditProduct" component={EditProduct}
            options={{
              header: (props) => <CustomHeader {...props} />,
            }} />
          </React.Fragment>
        ) : (
          // No user is signed in
          <>
            <Stack.Screen name="Login" component={LoginScreen} 
             options={{ headerShown: false }} 
             />
            <Stack.Screen name="Register" component={RegisterScreen} 
             options={{ headerShown: false }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
registerRootComponent(App)
export default App;
