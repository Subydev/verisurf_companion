// In CustomTabBar.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const tabBarHeight = 70 + insets.bottom; // Adjust this value as needed
  
    return (
        <BlurView
          intensity={80}
          tint="dark"
          style={[
            styles.tabBarContainer,
            {
              height: tabBarHeight,
              paddingBottom: insets.bottom
            }
          ]}
        >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName;
        switch (route.name) {
          case 'Measure':
            iconName = isFocused ? 'play-circle' : 'play-circle-outline';
            break;
          case 'Reports':
            iconName = isFocused ? 'newspaper' : 'newspaper-outline';
            break;
          case 'Auto':
            iconName = isFocused ? 'play' : 'play-outline';
            break;
          case 'Build':
            iconName = isFocused ? 'arrow-down' : 'arrow-down-outline';
            break;
          case 'Settings':
            iconName = isFocused ? 'settings' : 'settings-outline';
            break;
          default:
            iconName = 'information-circle-outline';
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabItem}
          >
            <Ionicons 
              name={iconName} 
              size={25} 
              color={isFocused ? Colors.tabIconSelected : Colors.tabIconDefault} 
            />
            <Text style={[styles.tabLabel, { color: isFocused ? Colors.tabIconSelected : Colors.tabIconDefault }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </BlurView>
  );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "transparent",
      },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomTabBar;