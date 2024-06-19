import 'react-native-gesture-handler';
import React, { useEffect, useState, useCallback } from 'react';
import { Platform, StatusBar, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';
import AppNavigator from './navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import configureStore from './Store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeProvider from './theme/ThemeProvider';
import dark from './theme/dark';
import light from './theme/light';


export default function App(props) {
  const { store, persistor } = configureStore();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      console.log('App.js: Preparing app...');
      try {
        await SplashScreen.preventAutoHideAsync();
        console.log('App.js: Splash screen prevented from auto hiding');
        await loadResourcesAsync();
        await setTheme();
      } catch (e) {
        console.error('App.js: Error during preparation', e);
      } finally {
        setAppIsReady(true);
        console.log('App.js: App is ready');
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
        if (value && value.includes("\"dark_mode\":\"true\"")) {
          darkMode = true;
        }
      });
      // Use the imported theme definitions
      EStyleSheet.build(darkMode ? dark : light);
    } catch (error) {
      console.error('App.js: Error setting up AsyncStorage', error);
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
        if (value && value.includes("\"dark_mode\":\"true\"")) {
          darkMode = true;
        }
      });
      console.log('Dark mode:', darkMode);
      EStyleSheet.build(darkMode ? dark : light);
    } catch (error) {
      console.error('App.js: Error setting up theme', error);
      EStyleSheet.build(light);
    }
  };
  const onLayoutRootView = useCallback(async () => {
    console.log('App.js: onLayoutRootView called');
    if (appIsReady) {
      console.log('App.js: Hiding splash screen');
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }
  console.log('App.js: Rendering app');
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider />
        <View style={styles.container} onLayout={onLayoutRootView}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </View>
      </PersistGate>
    </Provider>
  );
}

async function loadResourcesAsync() {
  console.log('App.js: Loading resources');
  try {
    await Promise.all([
      Asset.loadAsync([
        require('./assets/images/splash.png'),
        require('./assets/images/verisurf.png'),
        require('./assets/images/verisurfblk.png'),
        require('./assets/images/verisurfround.png'),
        require('./assets/images/icon.png'),
      ]),
      Font.loadAsync({
        ...Ionicons.font,
        'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
      }),
    ]);
    console.log('App.js: Resources loaded successfully');
  } catch (error) {
    console.error('App.js: Error loading resources', error);
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$bgColor',
  },
});
