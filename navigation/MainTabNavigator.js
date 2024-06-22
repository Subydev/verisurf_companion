import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator  } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../components/TabBarIcon';
import BuildScreen from '../screens/BuildScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MeasureScreen from "../screens/MeasureScreen";
import AutoScreen from '../screens/AutoScreen';
import Scanner from '../screens/Scanner';
import { useSelector, useDispatch } from 'react-redux';
import Colors from '../constants/Colors';
import DetailScreen from '../screens/SettingsScreens/DetailScreen'; // Import DetailScreen
import AppearanceSettingsScreen from '../screens/SettingsScreens/AppearanceSettingsScreen';
import DeviceSettingsScreen from '../screens/SettingsScreens/DeviceSettingsScreen';
import MeasureSettingsScreen from "../screens/SettingsScreens/MeasureSettingsScreen";
import ReportSettingsScreen from '../screens/SettingsScreens/ReportSettingsScreen';
import AutoInspectSettingsScreen from '../screens/SettingsScreens/AutoInspectSettingsScreen';
import NotificationSettingsScreen from '../screens/SettingsScreens/NotificationSettingsScreen';
import ContactusSettingsScreen from '../screens/SettingsScreens/ContactusSettingsScreen';
import { NavigationContainer } from '@react-navigation/native'
import { BlurView } from 'expo-blur';
import CustomTabBar from '../components/CustomTabBar';
import { useTabBarHeight } from '../components/useTabBarHeight';
import * as ScreenOrientation from 'expo-screen-orientation';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator ();

const screenOptions = {
  headerShown: false,
};

function BuildStackScreen() {
  console.log('BuildStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen 
        name="BuildMain" 
        component={BuildScreen}
        listeners={{
          focus: async () => {
            console.log("Build screen focused");
            try {
              await ScreenOrientation.unlockAsync();
              console.log("Orientation unlocked for Build screen");
            } catch (error) {
              console.error("Failed to unlock orientation for Build screen:", error);
            }
          },
          blur: async () => {
            console.log("Build screen blurred");
            try {
              await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
              console.log("Orientation locked to portrait for other screens");
            } catch (error) {
              console.error("Failed to lock orientation to portrait:", error);
            }
          },
        }}
      />
    </Stack.Navigator>
  );
}
function SettingsStackScreen() {
  console.log('SettingsStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Scanner" component={Scanner} />
      <Stack.Screen name="Details" component={DetailScreen} />
      <Stack.Screen name="AppearanceSettings" component={AppearanceSettingsScreen} />
      <Stack.Screen name="DeviceSettings" component={DeviceSettingsScreen} />
      <Stack.Screen name="MeasureSettingsScreen" component={MeasureSettingsScreen} />
      <Stack.Screen name="AutoInspectSettingsScreen" component={AutoInspectSettingsScreen} />
      <Stack.Screen name="ReportSettingsScreen" component={ReportSettingsScreen} />
      <Stack.Screen name="NotificationSettingsScreen" component={NotificationSettingsScreen} />
      <Stack.Screen name="ContactusSettingsScreen" component={ContactusSettingsScreen} />
    </Stack.Navigator>
  );
}

function AutoStackScreen() {
  console.log('AutoStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="AutoMain" component={AutoScreen} />
    </Stack.Navigator>
  );
}

function MeasureStackScreen() {
  console.log('MeasureStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeasureMain" component={MeasureScreen} />
    </Stack.Navigator>
  );
}

function ReportsStackScreen() {
  console.log('ReportsStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Reports" component={ReportsScreen} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  const tabBarHeight = useTabBarHeight();
  const dispatch = useDispatch();

  return (
    <Tab.Navigator 
      tabBar={props => <CustomTabBar {...props} height={tabBarHeight} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Measure" component={MeasureStackScreen} />
      <Tab.Screen name="Reports" component={ReportsStackScreen} />
      <Tab.Screen name="Auto" component={AutoStackScreen} />
      <Tab.Screen
        name="Build" 
        component={BuildStackScreen}
        options={{
          unmountOnBlur: true, // This will unmount the screen when it's not focused
        }}
      />
      <Tab.Screen
        name="App"
        component={SettingsStackScreen}
      />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;