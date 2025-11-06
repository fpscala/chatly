import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import * as Notifications from 'expo-notifications';
import { auth } from './app/firebaseConfig';
import AppNavigation from './app/navigation/AppNavigation';
import { updateOnlineStatus } from './app/services/firestoreService';
import { registerForPushNotificationsAsync } from './app/services/notificationService';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      setIsLoading(false);

      if (user) {
        // Foydalanuvchi kirganida online holatni o'rnatish
        await updateOnlineStatus(user.uid, true);

        // Push notifications ro'yxatdan o'tkazish
        await registerForPushNotificationsAsync();
      }
    });

    // Notification listeners
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('Notification received:', notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response);
      });

    return () => {
      unsubscribe();
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // App yopilganda offline holatni o'rnatish
  useEffect(() => {
    const handleAppStateChange = async () => {
      if (auth.currentUser) {
        await updateOnlineStatus(auth.currentUser.uid, false);
      }
    };

    return () => {
      handleAppStateChange();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigation isAuthenticated={isAuthenticated} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
