import React, { useState, useRef } from 'react';
import { View, Text } from 'react-native';
import SettingsSubPage from '../../components/SettingsSubPage';
import { connect } from "react-redux";

import { Input, Slider } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Picker } from "@react-native-picker/picker";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";


const ReportSettingsScreen = (props) => {
  const {
    navigation,
    updating_value,
    change_value_only,
    dark_mode,
    decimal_places,
    single_or_average,
    in_tolerance_color,
    oot_pos_color,
    oot_neg_color,
  } = props;
  const [selectedValue, setSelectedValue] = useState("4");

  const inputter = React.createRef();
  const myRef = useRef(null);
  const inputRef = useRef(null);
  return (
    <SettingsSubPage 
    title="ReportSettingsScreen " 
    navigation={navigation }
    change_value_only={change_value_only}
    
    >
     
      <View style={{paddingTop: 20, paddingBottom: 40}} >
      <Text style={styles.text} numberOfLines={1} ellipsizeMode={"tail"}>
        Decimal Places
      </Text>
      <View style={styles.pickerContainer}>
      <Picker
            selectedValue={decimal_places.toString()}

            style={styles.picker}
            itemStyle={styles.pickerItem}
            onValueChange={(itemValue, itemIndex) => {
              change_value_only(itemValue, "decimal_places");
            }}
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

function mapStateToProps(state) {
  console.log("State in ReprtSettingsScreen: ", state)
  return {
    ...state,
    IPAddress: state.IPAddress,
    build_tol: state.build_tol,
    dark_mode: state.dark_mode,
    decimal_places: state.decimal_places,
    response_time: state.response_time,
    auto_response_time: state.auto_response_time,
    plan_number: state.plan_number,
    device_number: state.device_number,
    single_or_average: state.single_or_average,
    in_tolerance_color: state.in_tolerance_color,
    oot_pos_color: state.oot_pos_color,
    oot_neg_color: state.oot_neg_color,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    updating_value: (value, name) =>
      dispatch({ type: "UPDATING_VALUE", value, name }),
    finalizetol: (text) => dispatch({ type: "FINALIZE_TOL", text }),
    themeswitch: (value, name) =>
      dispatch({ type: "THEME_SWITCH", value, name }),

    toggleswitch: (value, name) =>
      dispatch({ type: "TOGGLE_SWITCH", value, name }),
    themeswitch: (value, name) =>
      dispatch({ type: "THEME_SWITCH", value, name }),
    change_value_only: (value, name) =>
      dispatch({ type: "CHANGE_VALUE", value, name }),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReportSettingsScreen);

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