import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator  } from '@react-navigation/bottom-tabs';
import TabBarIcon from '../components/TabBarIcon';
import BuildScreen from '../screens/BuildScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ReportsScreen from '../screens/ReportsScreen';
import MeasureScreen from '../screens/MeasureScreen';
import AutoScreen from '../screens/AutoScreen';
import Scanner from '../screens/Scanner';
import Colors from '../constants/Colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator ();

const screenOptions = {
  headerShown: false,
};

function BuildStackScreen() {
  console.log('BuildStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Build" component={BuildScreen} />
    </Stack.Navigator>
  );
}

function SettingsStackScreen() {
  console.log('SettingsStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Scanner" component={Scanner} />
    </Stack.Navigator>
  );
}

function AutoStackScreen() {
  console.log('AutoStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Auto" component={AutoScreen} />
    </Stack.Navigator>
  );
}

function MeasureStackScreen() {
  console.log('MeasureStackScreen: Rendering');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Measure" component={MeasureScreen} />
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

export default function MainTabNavigator() {
  console.log('MainTabNavigator: Rendering');
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconName;
          switch (route.name) {
            case 'Measure':
              iconName = Platform.OS === 'ios' ? 'ios-play-circle' : 'play-circle-outline';
              break;
            case 'Reports':
              iconName = Platform.OS === 'ios' ? 'ios-paper' : 'newspaper-outline';
              break;
            case 'Auto':
              iconName = Platform.OS === 'ios' ? 'ios-play' : 'play-outline';
              break;
            case 'Build':
              iconName = Platform.OS === 'ios' ? 'ios-arrow-down' : 'arrow-down-outline';
              break;
            case 'Settings':
              iconName = Platform.OS === 'ios' ? 'ios-settings' : 'settings-outline';
              break;
            default:
              iconName = 'information-circle-outline';
          }
          return <TabBarIcon focused={focused} name={iconName} />;
        },
        tabBarActiveTintColor: Colors.tabIconSelected,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
        },

        //hide bar/navrbar/.header
      })}
    >
      <Tab.Screen
        name="Measure"
        component={MeasureStackScreen}
        options={{ tabBarLabel: 'Measure', headerShown: false }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsStackScreen}
        options={{ tabBarLabel: 'Reports', headerShown: false  }}
      />
      <Tab.Screen
        name="Auto"
        component={AutoStackScreen}
        options={{ tabBarLabel: 'Auto-Inspect', headerShown: false  }}
      />
      <Tab.Screen
        name="Build"
        component={BuildStackScreen}
        options={{ tabBarLabel: 'Build', headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackScreen}
        options={{ tabBarLabel: 'Settings', headerShown: false  }}
      />
    </Tab.Navigator>
  );
}
