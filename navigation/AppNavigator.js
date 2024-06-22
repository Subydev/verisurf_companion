import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EStyleSheet from 'react-native-extended-stylesheet';
import SignInScreen from './SignIn';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';

const AuthLoadingScreen = ({ navigation }) => {
  useEffect(() => {
    const bootstrapAsync = async () => {
      console.log('AuthLoadingScreen: Checking user token');
      const userToken = await AsyncStorage.getItem('userToken');
      console.log('AuthLoadingScreen: User token', userToken);
      navigation.replace(userToken ? 'App' : 'Auth');
    };

    bootstrapAsync();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <StatusBar barStyle="default" />
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$bgColor',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'purple',
  },
});

const Stack = createStackNavigator();

function AuthStack() {
  console.log('AuthStack: Rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  console.log('AppStack: Rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}

export default function AppNavigator({ initialRoute }) {
  console.log('AppNavigator: Rendering');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // You can add any additional setup logic here
        await AsyncStorage.getItem('userToken'); // This is just to ensure AsyncStorage is ready
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };

    prepareApp();
  }, []);

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute || "AuthLoading"} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="App" component={AppStack} />
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}