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
      return unsubscribe;
    }, []);

    if (checkingStatus) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' />
        </View>
      );
    }

    if (!user) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuthProtection;
