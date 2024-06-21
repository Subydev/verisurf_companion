import React from 'react';
import { View, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomStatusBar = ({ IPAddress, statusColor }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container, 
      { 
        bottom: Platform.OS === 'ios' ? insets.bottom + 70 : 70, // Adjust 70 based on your tab bar height
      }
    ]}>
      <View
        style={[
          styles.statusCircle,
          { backgroundColor: IPAddress === '' ? '#00ff00' : statusColor },
        ]}
      />
    </View>
  );
};

const styles = EStyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: RFValue(20), // Small padding to lift the dot slightly above the tab bar
  },
  statusCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default CustomStatusBar;