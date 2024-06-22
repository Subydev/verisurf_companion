import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 70 + insets.bottom; 

  const notificationCount = useSelector(state => state.count);
  console.log('Notification Count:', notificationCount); 
  const dispatch = useDispatch();

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
          // if (route.name === 'Settings') {
          //   dispatch({ type: 'CLEAR_NOTIFICATIONS' });
          // }
        };

        let iconName;
        switch (route.name) {
          case 'Measure':
            iconName = isFocused ? 'play-circle' : 'play-circle';
            break;
          case 'Reports':
            iconName = isFocused ? 'newspaper' : 'newspaper';
            break;
          case 'Auto':
            iconName = isFocused ? 'play' : 'play';
            break;
          case 'Build':
            iconName = isFocused ? 'arrow-down' : 'arrow-down';
            break;
          case 'App':
            iconName = isFocused ? 'settings' : 'settings';
            break;
          default:
            iconName = 'information-circle';
        }

        return (
          <TouchableOpacity
            key={index}
            onPress={onPress}
            style={styles.tabItem}
          >
            <View>
              <Ionicons
                name={iconName}
                size={25}
                color={isFocused ? Colors.tabIconSelected : Colors.tabIconDefault}
              />
              {route.name === 'Settings' && notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </View>
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
      badge: {
        position: 'absolute',
        right: -6,
        top: -3,
        backgroundColor: 'red',
        borderRadius: 9,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
      },
      badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
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