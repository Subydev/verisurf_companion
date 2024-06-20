import React, { useState } from 'react';
import { View, Text } from 'react-native';
import SettingsSubPage from '../../components/SettingsSubPage';
import { Input, Slider } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Picker } from "@react-native-picker/picker";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";


const ReportSettingsScreen = ({ navigation }) => {

  const [selectedValue, setSelectedValue] = useState("4");


  return (
    <SettingsSubPage title="ReportSettingsScreen " navigation={navigation}>
     
      <View style={{paddingTop: 20, paddingBottom: 40}} >
      <Text style={styles.text} numberOfLines={1} ellipsizeMode={"tail"}>
        Decimal Places
      </Text>
      <View style={styles.pickerContainer}>
      <Picker
            selectedValue={selectedValue}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
          >
          <Picker.Item label="1" value="1" />
          <Picker.Item label="2" value="2" />
          <Picker.Item label="3" value="3" />
          <Picker.Item label="4" value="4" />
        </Picker>
    
      </View>
      </View>
    </SettingsSubPage>
  );
};

export default ReportSettingsScreen;

const styles = EStyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "white",
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
    marginHorizontal: 10,
  },
  picker: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
  },
  pickerItem: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
  },
  text: {
    // flex: 6,
    flexDirection: "row",
    fontSize: RFValue(15),
    color: "$textColor",
    margin: RFValue(10),
    marginRight: 0,
    padding: 0,
    opacity: 0.8,
  },
});