// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/pages/Login';
import Home from './src/pages/Home';
import RegisterScreen from './src/pages/Register';
import LoadingScreen from './src/pages/LoadingScreen';
import useAuth from './src/hooks/useAuth';

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
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
      <Stack.Navigator>
        {currentUser ? (
          // User is signed in
          <Stack.Screen name="Home" component={Home} />
        ) : (
          // No user is signed in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
