// hocs/withAuthProtection.tsx
import React, { useEffect, useState, FC } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase.config';

const withAuthProtection = <P extends object>(WrappedComponent: FC<P>) => {
  return (props: P) => {
    const [user, setUser] = useState<User | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(true);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setCheckingStatus(false);
      });
      return unsubscribe; // Unsubscribe on unmount
    }, []);

    if (checkingStatus) {
      // Return a loading indicator while checking user status
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' />
        </View>
      );
    }

    if (!user) {
      // If there is no user logged in, don't render the component
      // Handle redirection or display a message based on your app's flow
      return null;
    }

    // If the user is logged in, render the wrapped component
    return <WrappedComponent {...props} />;
  };
};

export default withAuthProtection;
