import React from 'react';
import { View, Text } from 'react-native';
import SettingsSubPage from '../../components/SettingsSubPage';
import { Input, Slider } from 'react-native-elements';

const AppearanceSettingsScreen = ({ navigation }) => {
  return (
    <SettingsSubPage title="Appearance Settings" navigation={navigation}>
      <Input
        label="Example Input"
        onChangeText={(value) => updateValue(value, 'exampleInput')}
      />
      <Slider
        minimumValue={0}
        maximumValue={100}
        step={1}
        onValueChange={(value) => updateValue(value, 'exampleSlider')}
      />
    </SettingsSubPage>
  );
};

export default AppearanceSettingsScreen;