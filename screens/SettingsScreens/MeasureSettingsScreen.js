import React, { useState, useRef, useEffect } from "react";
import SettingsSubPage from "../../components/SettingsSubPage";
import EStyleSheet from "react-native-extended-stylesheet";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import {
  Image,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
  Button,
  Modal,
  Alert,
  TouchableHighlight,
  KeyboardAvoidingView,
  TextInput,

  Platform,
} from "react-native";
import {
  Slider,
  Input,
  SocialIcon,
  Tooltip,
  ListItem,
  Icon,
} from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";

import TolModal from "../../components/tolModal";

const MeasureSettingsScreen = (props) => {
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

  const inputter = React.createRef();
  const myRef = useRef(null);
  const inputRef = useRef(null);


  const [modalVisible, setModalVisible] = useState(false);


  const handleColorSubmit = (reduxVal, color) => {
    if (reduxVal === "in_tolerance_color") {
      change_value_only(color, "in_tolerance_color");
    } else if (reduxVal === "oot_pos_color") {
      change_value_only(color, "oot_pos_color");
    } else if (reduxVal === "oot_neg_color") {
      change_value_only(color, "oot_neg_color");
    }
  };

  const textFocused = () => {
    if (myRef.current) {
      myRef.current.scrollTo({
        y: heightHelper + screenHeight / 5,
        animated: true,
      });
    }
    
  };
  // const submitColor = (reduxVal, hexValue) => {
  //   var matcher = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi;
  //   var x = matcher.exec(hexValue);
  //   if (x == null || x == undefined) {
  //     // Handle invalid color input
  //   } else {
  //     change_value_only(x[0], reduxVal);
  //   }
  // };

  const validateAndSubmit = (text) => {
    const isZero = text === "0" || text === "0.0" || /^0\.0+$/.test(text) || /^0+\.0*$/.test(text);
    if (isZero) {
      Alert.alert(
        "Invalid Value",
        "Build tolerance cannot be set to exactly 0.",
        [{ text: "OK", onPress: () => inputRef.current.focus() }]
      );
    } else {
      props.updating_value(text, "build_tol");
      props.finalizetol(text);
    }
  };
  return (
    <SettingsSubPage
      title="Measure Settings"
      navigation={navigation}
      updating_value={updating_value}
      change_value_only={change_value_only}
      dark_mode={dark_mode}
      decimal_places={decimal_places}
      single_or_average={single_or_average}
    >
      <View style={{ paddingTop: 20 }}>
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
      <View style={{ paddingTop: 20 }}>
        <View>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode={"tail"}>
            Build Tolerance
          </Text>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
          >
          <TextInput
              ref={inputRef}
              clearButtonMode={"while-editing"}
              textAlign={"center"}
              style={[styles.inputContainer, styles.inputText]}
              labelStyle={styles.text}
              containerStyle={styles.inputInnerContainer}
              label={"Build Tolerance"}
              editable={true}
              keyboardType={Platform.OS === "ios" ? "numeric" : "default"}
              defaultValue={props.build_tol.toString()}
              onFocus={textFocused}
              onEndEditing={(e) => validateAndSubmit(e.nativeEvent.text)}
              returnKeyType={Platform.OS === "ios" ? "done" : undefined}
    />
              </KeyboardAvoidingView>

        </View>
      </View>
      <TolModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        in_tolerance_color={in_tolerance_color}
        oot_pos_color={oot_pos_color}
        oot_neg_color={oot_neg_color}
        onColorSubmit={handleColorSubmit}
      />

      <View style={{ paddingBottom: 40 }}>
        <Text style={styles.text} numberOfLines={1} ellipsizeMode={"tail"}>
          Single Point Method
        </Text>
        <View>
          <TouchableOpacity
            style={styles.singlePointButton}
            onPress={() => {
              var changeValue =
                single_or_average === "single" ? "average" : "single";
              change_value_only(changeValue, "single_or_average");
            }}
          >
            <Text style={styles.singlePointButtonText}>
              {single_or_average === "single" ? "Single" : "Average"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ paddingBottom: 40 }}>
        <TouchableOpacity
          style={styles.toleranceColorsButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.toleranceColorsText}>Tolerance Colors</Text>
          <View style={styles.iconContainer}>
            <Ionicons
              name="brush-outline"
              size={RFPercentage(3.8)}
              color={EStyleSheet.value("$textColor")}
            />
          </View>
        </TouchableOpacity>
      </View>
    </SettingsSubPage>
  );
};

function mapStateToProps(state) {
  console.log("State in MeasureSettingsScreen: ", state)
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
)(MeasureSettingsScreen);

const styles = EStyleSheet.create({
  containerInnerSection: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-evenly",
  },
  singlePointButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#C12030",
    borderRadius: 10,
    borderColor: "$textColor",
  },
  singlePointButtonText: {
    fontSize: RFValue(15),
    color: "$textColor",
    textAlign: "center",
  },

  inputText: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "white",
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
  inputView: {
    flex: 1,
    width: 0,
    paddingRight: 0,
    flexShrink: 1,
    textAlign: "center",
    color: "$textColor",
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
  inputContainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "white",
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
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
  toleranceColorsContainer: {
    paddingTop: 20,
    paddingBottom: 40,

    flexDirection: "row",
    justifyContent: "center",
  },
  toleranceColorsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#BE1E2D",
    // borderWidth: 1,
    borderRadius: 10,
    borderColor: "$textColor",
  },
  toleranceColorsText: {
    fontSize: RFValue(15),
    color: "$textColor",
    marginRight: 10,
  },
  iconContainer: {
    marginLeft: 10,
  },
});