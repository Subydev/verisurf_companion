import React, { useState, useEffect, useCallback } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  TouchableHighlight,
  Vibration,
  Alert,
  Platform,
  TouchableOpacity,
} from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useFocusEffect } from "@react-navigation/native";
import EStyleSheet from "react-native-extended-stylesheet";
import { connect } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarHeight } from "../components/useTabBarHeight";
import CustomStatusBar from "../components/CustomStatusBar.js";

let error_detector = true;

const MeasureScreen = (props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ws, setWs] = useState(null);

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const tabBarHeight = useTabBarHeight();
  const [state, setState] = useState({
    notification: {},
    isLoading: true,
    measType: "",
    xEcho: "0",
    yEcho: "0",
    zEcho: "0",
    dEcho: "0",
    dInfoEcho: "0",
    dTempEcho: "0",
    dRadiusEcho: "0",
    dNameEcho: "0",
    longPress: 0,
    backgroundColor: EStyleSheet.value("$bgColor"),
    underlayColor: EStyleSheet.value("$bgColor"),
    scaler: 1,
  });

  useEffect(() => {
    console.log("Decimal places updated: ", props.decimal_places);
  }, [props.decimal_places]);

  useFocusEffect(
    useCallback(() => {
      console.log("MeasureScreen focused");
    console.log({underlayColor});
      
      console.log(props.decimal_places);
      if (props.IPAddress === "") {
        
        return;
      }

      error_detector = true;
      setState((prevState) => ({
        ...prevState,
        backgroundColor: EStyleSheet.value("$bgColor"),
        underlayColor: EStyleSheet.value("$bgColor"),
      }));

      const newWs = new WebSocket(`ws://${props.IPAddress}:${props.port}`);
      setWs(newWs);
      beginStream(newWs);

      return () => {
        error_detector = false;
        newWs.close();
      };
    }, [props.IPAddress, props.port, props.decimal_places])
  );

  const onPickerValueChange = (value, index) => {
    setState((prevState) => ({
      ...prevState,
      meastype: value,
    }));

    if (value !== "none") {
      setState((prevState) => ({
        ...prevState,
        underlayColor: "red",
      }));
      if (props.IPAddress !== "") {
        const measSend = `<measure_${value} />`;
        ws.send(measSend);
      }
    } else {
      setState((prevState) => ({
        ...prevState,
        underlayColor: EStyleSheet.value("$bgColor"),
      }));
    }
  };

  const onPress = () => {
    setIsPressed(true);
    setState(prevState => ({
      ...prevState,
      underlayColor: "red"
    }));
    console.log({underlayColor})
    
    if (props.IPAddress !== "" && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(`<measure_set_${props.single_or_average} />`);
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10]);
    }
  };
  const onPressOut = () => {
    setIsPressed(false);
    setState(prevState => ({
      ...prevState,
      underlayColor: EStyleSheet.value("$bgColor")
    }));
    console.log({underlayColor})

    
    if (
      state.longPressed === 1 &&
      props.IPAddress !== "" &&
      ws &&
      ws.readyState === WebSocket.OPEN
    ) {
      console.log("Sending measure_trigger from long press out");
      ws.send("<measure_trigger />");
      setState((prevState) => ({
        ...prevState,
        longPressed: 0,
      }));
    }
  };

  const onLongPress = () => {
    setIsPressed(true);
    console.log(":LONG PRESSED");
    
    if (props.IPAddress !== "" && ws && ws.readyState === WebSocket.OPEN) {
      console.log(
        "Sending measure_set_cloud & measure_trigger from long press"
      );
      ws.send("<measure_set_cloud />");
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 50]);
      setState((prevState) => ({
        ...prevState,
        longPressed: 1,
      }));
    }
  };

  const beginStream = (newWs) => {
    setIsMounted(true);
    setState((prevState) => ({
      ...prevState,
      meastype: "none",
    }));

    newWs.onopen = () => {
      props.change_value_only("#1fcc4d", "statusColor");
      newWs.send(`<device_info id="${props.device_number}" />`);
    };

    if (isMounted && props.IPAddress !== "") {
      newWs.onmessage = ({ data }) => {
        if (data.includes("device_info")) {
          const XMLParser = require("react-xml-parser");
          const info = new XMLParser()
            .parseFromString(data)
            .getElementsByTagName("device_info");
          const attributes = info[0]["attributes"];
          const xRaw = attributes["X"] || 0;
          const yRaw = attributes["Y"] || 0;
          const zRaw = attributes["Z"] || 0;
          const dInfo = attributes["id"];
          const dTempRaw = attributes["Temp"];
          const dRadiusRaw = attributes["ProbeRadius"];
          const dName = info[0]["value"];

          const xVal = parseFloat(xRaw).toFixed(props.decimal_places);
          const yVal = parseFloat(yRaw).toFixed(props.decimal_places);
          const zVal = parseFloat(zRaw).toFixed(props.decimal_places);

          let dTemp, dRadius;
          if (dTempRaw != null) {
            dTemp = parseFloat(dTempRaw).toFixed(1);
          }

          if (dRadiusRaw != null) {
            dRadius = parseFloat(dRadiusRaw).toFixed(3);
          }
          if (xVal.length > 7 || yVal.length > 7 || zVal.length > 7) {
            const biggest =
              xVal.length > yVal.length
                ? xVal.length > zVal.length
                  ? xVal.length
                  : zVal.length
                : yVal.length > zVal.length
                ? yVal.length
                : zVal.length;
            setState((prevState) => ({
              ...prevState,
              scaler: parseFloat(1 - (biggest - 7) * 0.08),
            }));
          } else {
            setState((prevState) => ({
              ...prevState,
              scaler: 1,
            }));
          }
          setState((prevState) => ({
            ...prevState,
            xEcho: xVal,
            yEcho: yVal,
            zEcho: zVal,
            dNameEcho: dName,
            dTempEcho: dTemp,
            dInfoEcho: dInfo,
            dRadiusEcho: dRadius,
          }));
          setTimeout(() => {
            if (isMounted) {
              newWs.send(<device_info id="${props.device_number}" />);
            }
          }, props.response_time);
        }
      };
    }
  };

  // useEffect(() => {
    
  //   if (props.statusColor === "red") {
  //     setState((prevState) => ({
  //       ...prevState,
  //       underlayColor: EStyleSheet.value("$bgColor"),
  //     }));
  //   } else if (props.statusColor !== "red" && state.meastype !== "none") {
  //     setState((prevState) => ({
  //       ...prevState,
  //       underlayColor: "red",
  //     }));
  //   }
  // }, [props.statusColor, state.meastype]);

  const {
    xEcho,
    yEcho,
    zEcho,
    dNameEcho,
    dInfoEcho,
    dTempEcho,
    dRadiusEcho,
    meastype,
    backgroundColor,
    underlayColor,
    scaler,
  } = state;

return (
  <View style={styles.container}>
    <View
      style={[
        styles.contentContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 80 },
      ]}
    >
      <View style={styles.headerContainer}>
        <Text style={styles.footerTitle}>
          Tap - Single | Hold - Continuous
        </Text>
      </View>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={meastype}
          itemStyle={styles.pickerItem}
          style={styles.pickerStyle}
          onValueChange={onPickerValueChange}
        >
          <Picker.Item label={"Select Feature Type..."} value={"none"} />
          <Picker.Item label={"Point"} value={"point"} />
          <Picker.Item label={"Line"} value={"line"} />
          <Picker.Item label={"Circle"} value={"circle"} />
          <Picker.Item label={"Spline"} value={"spline"} />
          <Picker.Item label={"Ellipse"} value={"ellipse"} />
          <Picker.Item label={"Slot"} value={"slot"} />
          <Picker.Item label={"Plane"} value={"plane"} />
          <Picker.Item label={"Sphere"} value={"sphere"} />
          <Picker.Item label={"Cylinder"} value={"cylinder"} />
          <Picker.Item label={"Cone"} value={"cone"} />
        </Picker>
      </View>
      <View style={styles.container}>
        <TouchableHighlight
          style={[
            styles.coordinatesContainer,
            isPressed && styles.coordinatesContainerPressed,
          ]}
          onPress={onPress}
          onPressOut={onPressOut}
          onLongPress={onLongPress}
          delayLongPress={500}
          activeOpacity={1}
          underlayColor={isPressed ? "red" : EStyleSheet.value("$bgColor")}
        >
          <View style={styles.coordinatesContent}>
            <View style={styles.droLeftBox}>
              <Text style={styles.droText}>X:</Text>
              <Text style={styles.droText}>Y:</Text>
              <Text style={styles.droText}>Z:</Text>
            </View>
            <View style={styles.droRightBox}>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={[
                  styles.coordinateValue,
                  { fontSize: RFValue(59) * scaler },
                ]}
              >
                {props.IPAddress === "" ? "18.7101" : xEcho}
              </Text>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={[
                  styles.coordinateValue,
                  { fontSize: RFValue(59) * scaler },
                ]}
              >
                {props.IPAddress === "" ? "32.1902" : yEcho}
              </Text>
              <Text
                adjustsFontSizeToFit={true}
                numberOfLines={1}
                style={[
                  styles.coordinateValue,
                  { fontSize: RFValue(59) * scaler },
                ]}
              >
                {props.IPAddress === "" ? "-4.0199" : zEcho}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      </View>
    </View>
    <CustomStatusBar
      IPAddress={props.IPAddress}
      statusColor={props.statusColor}
    />
  </View>
);

};

MeasureScreen.navigationOptions = {
  header: null,
};

const mapStateToProps = (state) => ({
  dark_mode: state.dark_mode,
  decimal_places: state.decimal_places,
  response_time: state.response_time,
  device_number: state.device_number,
  IPAddress: state.IPAddress,
  port: state.port,
  statusColor: state.statusColor,
  single_or_average: state.single_or_average,
  is_registered: state.is_registered,
});

const mapDispatchToProps = (dispatch) => ({
  change_value_only: (value, name) =>
    dispatch({ type: "CHANGE_VALUE", value, name }),
});

export default connect(mapStateToProps, mapDispatchToProps)(MeasureScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$bgColor",
  },
  contentContainer: {
    flex: 1,
    // backgroundColor: "purple",
    marginBottom: 20, // Add some space for the CustomStatusBar
  },

  text: {
    color: "$textColor",
  },
  pickerItem: {
    color: "$textColor",
    fontSize: RFValue(16),
    height: RFValue(85),
    // backgroundColor: "orange",
    
  },
  coordinatesContainer: {
    flex: 1,
    marginTop: Platform.OS === "ios" ?  RFValue(-6) : RFValue(-10),
    backgroundColor: "$bgColor",

  },

  coordinatesContent: {
    flexDirection: "row",
    flex: 1,
  },
  pickerStyle: {
    color: "$textColor",
    borderColor: "$textColor",
    height: Platform.OS === "ios" ? RFValue(180) : RFValue(50),
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RFValue(19),
    // backgroundColor:"yellow",

  },
  pickerContainer: {
    marginBottom: Platform.OS === "ios" ? RFValue(-100) : RFValue(10),
    // backgroundColor: "purple",
  },

  coordinateValue: {
    fontVariant: ["tabular-nums"],
    opacity: 1,
    color: "$textColor",
  },
  droText: {
    color: "$textColor",
    fontSize: RFValue(60),
    opacity: 1,
  },
  droLeftBox: {
    justifyContent: "space-around",
    flexDirection: "column",
    width: 109,
    alignItems: "flex-start",
    paddingLeft: 5,
  },
  droRightBox: {
    flex: 1,
    justifyContent: "space-around",
    flexDirection: "column",
    alignItems: "flex-end",
    fontSize: RFValue(60),
    paddingRight: 5,
  },
  footerText: {
    fontSize: RFValue(12),
    color: "$textColor",
  },
  footerTitle: {
    color: "$textColor",
    fontSize: RFValue(18),

  },
  touchableContainer: {
    flex: 1,
    
  },
  statusFooter: {
    left: 0,
    right: 0,
  },
});
