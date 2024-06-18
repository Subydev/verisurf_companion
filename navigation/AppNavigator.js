import React from 'react';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EStyleSheet from 'react-native-extended-stylesheet';
import SignInScreen from './SignIn';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';

class AuthLoadingScreen extends React.Component {
  constructor() {
    super();
    console.log('AuthLoadingScreen: Constructor');
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    console.log('AuthLoadingScreen: Checking user token');
    const userToken = await AsyncStorage.getItem('userToken');
    console.log('AuthLoadingScreen: User token', userToken);
    this.props.navigation.navigate(userToken ? 'App' : 'Auth');
  };

  render() {
    console.log('AuthLoadingScreen: Rendering');
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <StatusBar barStyle="default" />
      </View>
    );
  }
}

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

export default function AppNavigator() {
  console.log('AppNavigator: Rendering');
  return (
    <Stack.Navigator initialRouteName="AuthLoading" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
      <Stack.Screen name="App" component={AppStack} />
      <Stack.Screen name="Auth" component={AuthStack} />
    </Stack.Navigator>
  );
}
