import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Platform, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import * as SplashScreen from "expo-splash-screen";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from "@react-native-async-storage/async-storage";
import EStyleSheet from "react-native-extended-stylesheet";
import { Asset } from 'expo-asset';

import AppNavigator from "../navigation/AppNavigator"; // Import AppNavigator
import { NotificationContext } from "../App";
import dark from "../theme/dark";
import light from "../theme/light";


import MainTabNavigator from "../navigation/MainTabNavigator";


const checkAuthStatus = async () => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    setInitialRoute(userToken ? 'App' : 'Auth');
  } catch (e) {
    console.error("Error checking auth status:", e);
    setInitialRoute('Auth');
  } finally {
    setIsNavigationReady(true);
  }
};
async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ 
      projectId: Constants.expoConfig.extra.eas.projectId 
    })).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Original Title',
    body: 'And here is the body!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}

const AppContent = () => {
  console.log('AppContent: Rendering start');

  const dispatch = useDispatch();
  const [appIsReady, setAppIsReady] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  const [initialRoute, setInitialRoute] = useState('AuthLoading');
  const [isNavigationReady, setIsNavigationReady] = useState(false);

useEffect(() => {
  async function prepare() {
    console.log('AppContent: Prepare start');

    try {
      await SplashScreen.preventAutoHideAsync();
      await loadResourcesAsync();
      await setupAsyncStorage();
      await setTheme();
      
      // Check for userToken and set initial route
      const userToken = await AsyncStorage.getItem('userToken');
      setInitialRoute(userToken ? 'Auth' : 'Auth'); // switch back to APP : Auth when ready and thi shit resolved
      // setInitialRoute(userToken ? 'App' : 'Auth');

      console.log('AppContent: Initial route set to', userToken ? 'App' : 'Auth');

    } catch (e) {
      console.error("AppContent: Error during preparation", e);
    } finally {
      setAppIsReady(true);
      setIsNavigationReady(true);
      console.log('AppContent: Prepare end, app is ready');    }
  }

  prepare();
}, []);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      console.log("Expo Push Token:", token);
    });
  
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log("Notification received:", notification);
    });
  
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response:", response);
    });
  
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [dispatch]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || !isNavigationReady) {
    return null;
  }
  return (
    <NotificationContext.Provider value={{ expoPushToken, notification, sendPushNotification }}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        {Platform.OS === "ios" && <StatusBar barStyle="default" />}
        <NavigationContainer>
        <AppNavigator initialRoute={initialRoute} />
        </NavigationContainer>
      </View>
    </NotificationContext.Provider>
  );
};

async function loadResourcesAsync() {
  console.log("App.js: Loading resources");
  try {
    await Promise.all([
      Asset.loadAsync([
        require("../assets/images/splash.png"),
        require("../assets/images/verisurf.png"),
        require("../assets/images/verisurfblk.png"),
        require("../assets/images/verisurfround.png"),
        require("../assets/images/icon.png"),
      ]),
      // Font.loadAsync({
      //   ...Ionicons.font,
      //   "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf"),
      // }),
    ]);
    console.log("App.js: Resources loaded successfully");
  } catch (error) {
    console.error("App.js: Error loading resources", error);
  }
}

const setupAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    let darkMode = false;
    stores.forEach((result, i, store) => {
      let key = store[i][0];
      let value = store[i][1];
      if (value && value.includes('"dark_mode":"true"')) {
        darkMode = true;
      }
    });
    EStyleSheet.build(darkMode ? dark : light);
  } catch (error) {
    console.error("AppContent: Error setting up AsyncStorage", error);
    EStyleSheet.build(light);
  }
};

const setTheme = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const stores = await AsyncStorage.multiGet(keys);
    
    let darkMode = false;
    stores.forEach((result, i, store) => {
      let key = store[i][0];
      let value = store[i][1];
      if (value && value.includes('"dark_mode":"true"')) {
        darkMode = true;
      }
    });
    console.log("Dark mode:", darkMode);
    EStyleSheet.build(darkMode ? dark : light);
  } catch (error) {
    console.error("AppContent: Error setting up theme", error);
    EStyleSheet.build(light);
  }
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});

export default AppContent;