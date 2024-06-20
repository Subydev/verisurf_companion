import "react-native-gesture-handler";
import React, { useEffect, useState, useCallback, useRef, createContext } from "react";
import { Platform, StatusBar, View, SafeAreaView } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import EStyleSheet from "react-native-extended-stylesheet";
import AppNavigator from "./navigation/AppNavigator";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'
import SettingsSubPage from './components/SettingsSubPage'

import configureStore from "./Store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ThemeProvider from "./theme/ThemeProvider";
import dark from "./theme/dark";
import light from "./theme/light";


export const NotificationContext = createContext();


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    token = (await Notifications.getExpoPushTokenAsync({ 
      projectId: Constants.expoConfig.extra.eas.projectId 
    })).data;
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
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


export default function App(props) {
  const { store, persistor } = configureStore();
  const [appIsReady, setAppIsReady] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

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
  }, []);

  useEffect(() => {
    async function prepare() {
      console.log("App.js: Preparing app...");
      try {
        await SplashScreen.preventAutoHideAsync();
        console.log("App.js: Splash screen prevented from auto hiding");
        await loadResourcesAsync();
        await setupAsyncStorage();
        await setTheme();
      } catch (e) {
        console.error("App.js: Error during preparation", e);
      } finally {
        setAppIsReady(true);
        console.log("App.js: App is ready");
      }
    }

    prepare();
  }, []);

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
      // Use the imported theme definitions
      EStyleSheet.build(darkMode ? dark : light);
    } catch (error) {
      console.error("App.js: Error setting up AsyncStorage", error);
      // Use the imported light theme as fallback
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
      console.error("App.js: Error setting up theme", error);
      EStyleSheet.build(light);
    }
  };
  const onLayoutRootView = useCallback(async () => {
    console.log("App.js: onLayoutRootView called");
    if (appIsReady) {
      console.log("App.js: Hiding splash screen");
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }
  console.log("App.js: Rendering app");
  return (
    <SafeAreaView style={styles.container}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider />
        <NotificationContext.Provider value={{ expoPushToken, notification, sendPushNotification }}>
          <SafeAreaView style={styles.container} onLayout={onLayoutRootView}>
            {Platform.OS === "ios" && <StatusBar barStyle="default" />}
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaView>
        </NotificationContext.Provider>
      </PersistGate>
    </Provider>
    </SafeAreaView>

  );
}

async function loadResourcesAsync() {
  console.log("App.js: Loading resources");
  try {
    await Promise.all([
      Asset.loadAsync([
        require("./assets/images/splash.png"),
        require("./assets/images/verisurf.png"),
        require("./assets/images/verisurfblk.png"),
        require("./assets/images/verisurfround.png"),
        require("./assets/images/icon.png"),
      ]),
      Font.loadAsync({
        ...Ionicons.font,
        "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf"),
      }),
    ]);
    console.log("App.js: Resources loaded successfully");
  } catch (error) {
    console.error("App.js: Error loading resources", error);
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$bgColor",
  },
});
