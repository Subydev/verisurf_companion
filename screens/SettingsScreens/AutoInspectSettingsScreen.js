import React from "react";
import { View, Text } from "react-native";
import SettingsSubPage from "../../components/SettingsSubPage";
import { Input, Slider } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect } from "react-redux";
import EStyleSheet from "react-native-extended-stylesheet";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

const AutoInspectSettingsScreen = ({
  navigation,
  updating_value,
  change_value_only,
  dark_mode,
  decimal_places,
  auto_response_time,
}) => {
  return (
    <SettingsSubPage
      title="Auto Inspect Settings"
      navigation={navigation}
      updating_value={updating_value}
      change_value_only={change_value_only}
      dark_mode={dark_mode}
      decimal_places={decimal_places}
    >
     <View style={{paddingTop: 20, paddingBottom :40}} >

        <Text style={styles.text} numberOfLines={1} ellipsizeMode={"tail"}>
          Response Time (ms): {auto_response_time}
        </Text>
        <Slider
          step={50}
          disabled={false}
          style={styles.sliderSt}
          thumbTintColor={dark_mode ? "white" : "#000"}
          maximumValue={1000}
          minimumTrackTintColor={dark_mode ? "#B13034" : "black"}
          thumbStyle={{ height: 20, width: 20 }}
          minimumValue={300}
          value={auto_response_time}
          onValueChange={(value) => updating_value(value, "auto_response_time")}
        />
      </View>
    </SettingsSubPage>
  );
};
function mapStateToProps(state) {
  return {
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
const mapDispatchToProps = (dispatch) => ({
  updating_value: (value, name) =>
    dispatch({ type: "UPDATING_VALUE", value, name }),
  change_value_only: (value, name) =>
    dispatch({ type: "CHANGE_VALUE", value, name }),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AutoInspectSettingsScreen);


const styles = EStyleSheet.create({
  text: {
    // flex: 6,
    flexDirection: "row",
    fontSize: RFValue(15),
    color: "$textColor",
    margin: RFValue(10),
    marginRight: 0,
    padding: 0,
    opacity: 1,
  },
});

