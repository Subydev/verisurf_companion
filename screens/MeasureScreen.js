import React, { useState, useEffect, useCallback } from "react";
import Constants from "expo-constants";
import { ActivityIndicator } from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useFocusEffect } from "@react-navigation/native";
import EStyleSheet from "react-native-extended-stylesheet";
import { connect } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import { Text, View, TouchableHighlight, Vibration, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";

let error_detector = true;

const MeasureScreen = (props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [ws, setWs] = useState(null);
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
    // Any additional logic to handle decimal places changes can be placed here
  }, [props.decimal_places]);

  useFocusEffect(
    useCallback(() => {
      console.log("MeasureScreen focused");
      console.log(props.decimal_places)
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
    setState((prevState) => ({
      ...prevState,
      backgroundColor: "red",
    }));
    if (props.IPAddress !== "") {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(`<measure_set_${props.single_or_average} />`);
        ws.send("<measure_trigger />");
        Vibration.vibrate([0, 10]);
      }
    }
  };

  const onPressOut = () => {
    setState((prevState) => ({
      ...prevState,
      backgroundColor: EStyleSheet.value("$bgColor"),
    }));

    if (state.longPressed === 1 && props.IPAddress !== "") {
      console.log("Sending measure_trigger from long press out");
      ws.send("<measure_trigger />");
      setState((prevState) => ({
        ...prevState,
        longPressed: 0,
      }));
    }
  };

  const onLongPress = () => {
    if (props.IPAddress === "") {
      return;
    }
    console.log("Sending measure_set_cloud & measure_trigger from long press");
    ws.send("<measure_set_cloud />");
    ws.send("<measure_trigger />");
    Vibration.vibrate([0, 50]);

    setState((prevState) => ({
      ...prevState,
      longPressed: 1,
    }));
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

  useEffect(() => {
    if (Constants.isDevice && props.is_registered === false) {
      registerForPushNotificationsAsync().then((value) => {
        props.change_value_only(value, "is_registered");
      });
    }
  }, [props.is_registered]);

  useEffect(() => {
    if (props.statusColor === "red") {
      setState((prevState) => ({
        ...prevState,
        underlayColor: EStyleSheet.value("$bgColor"),
      }));
    } else if (props.statusColor !== "red" && state.meastype !== "none") {
      setState((prevState) => ({
        ...prevState,
        underlayColor: "red",
      }));
    }
  }, [props.statusColor, state.meastype]);

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
    <TouchableHighlight
      underlayColor={underlayColor}
      onPress={onPress}
      onPressOut={onPressOut}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={[
        styles.container,
        { backgroundColor: EStyleSheet.value("$bgColor") },
      ]}
    >
      <React.Fragment>
        <View
          style={{
            flexDirection: "column",
            borderColor: EStyleSheet.value("$textColor"),
            borderWidth: 0,
            alignItems: "center",
            justifyContent: "space-around",
            paddingTop: 50,
          }}
        >
          <Text style={styles.footerTitle}>
            Tap - Single | Hold - Continuous
          </Text>
          <ActivityIndicator
            size="small"
            color="#00ff00"
            animating={
              props.statusColor === "red" ? props.IPAddress !== "" : false
            }
          />
        </View>
        <View style={{}} key={props.dark_mode}>
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
        <View style={{ flexDirection: "row", flex: 1 , marginTop: RFValue(-20)}}>
          <View style={styles.droLeftBox}>
            <Text adjustsFontSizeToFit={true} style={styles.droText}>
              X:
            </Text>
            <Text adjustsFontSizeToFit={true} style={styles.droText}>
              Y:
            </Text>
            <Text adjustsFontSizeToFit={true} style={styles.droText}>
              Z:
            </Text>
          </View>
          <View style={styles.droRightBox}>
            <Text
              numberOfLines={1}
              style={{
                fontVariant: ["tabular-nums"],
                opacity: 1,
                fontSize: RFValue(59) * scaler,
                color: EStyleSheet.value("$textColor"),
              }}
            >
              {props.IPAddress === "" ? "188.7101" : xEcho}
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              style={{
                fontVariant: ["tabular-nums"],
                opacity: 1,
                fontSize: RFValue(59) * scaler,
                color: EStyleSheet.value("$textColor"),
              }}
            >
              {props.IPAddress === "" ? "32.1902" : yEcho}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontVariant: ["tabular-nums"],
                opacity: 1,
                fontSize: RFValue(59) * scaler,
                color: EStyleSheet.value("$textColor"),
              }}
            >
              {props.IPAddress === "" ? "-4.0199" : zEcho}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "column",
            height: 75,
            alignItems: "center",
            justifyContent: "space-around",
            paddingBottom: 2,
            paddingTop: 6,
            backgroundColor: EStyleSheet.value("$cardColor"),
            opacity: 0.8,
            borderTopWidth: 0,
            borderRadius: 8,
          }}
        >
          <View
            style={{
              borderRadius: 5,
              width: 10,
              height: 10,
              backgroundColor:
                props.IPAddress === "" ? "#00ff00" : props.statusColor,
            }}
          ></View>
          <Text style={styles.footerText}>
            Connected To:{" "}
            {props.IPAddress === ""
              ? "Master3DGage "
              : `${dNameEcho} (${dInfoEcho})`}
          </Text>
          <Text style={styles.footerText}>
            Probe Radius:{" "}
            {props.IPAddress === ""
              ? "3mm | 67.4°F"
              : `${dRadiusEcho}mm | Temperature: ${dTempEcho}°F`}
          </Text>
        </View>
      </React.Fragment>
    </TouchableHighlight>
  );
};

MeasureScreen.navigationOptions = {
  header: null,
};

function mapStateToProps(state) {
  return {
    dark_mode: state.dark_mode,
    decimal_places: state.decimal_places,
    response_time: state.response_time,
    device_number: state.device_number,
    IPAddress: state.IPAddress,
    port: state.port,
    statusColor: state.statusColor,
    single_or_average: state.single_or_average,
    is_registered: state.is_registered,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_value_only: (value, name) =>
      dispatch({ type: "CHANGE_VALUE", value, name }),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(MeasureScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: "$textColor",
  },
  pickerItem: {
    color: "$textColor",
    // height: 120,
    // fontSize: 32,
    fontSize: RFValue(20),  // Adjust this value as needed
    height: RFValue(100),  // Adjust this value as needed
    alignContent: "center",
    flexDirection: "column",
  },
  pickerStyle: {
    color: "$textColor",
    borderColor: "$textColor",
    borderWidth: 1,
    borderRadius: 50,
    fontSize: RFValue(20),  // Adjust this value as needed
    // height: RFValue(100),  // Adjust this value as needed
    borderBottomWidth: 1,
  },
  droText: {
    color: "$textColor",
    fontSize: RFValue(58),
    justifyContent: "space-around",
    opacity: 1,
  },
  droLeftBox: {
    justifyContent: "space-around",
    flexDirection: "column",
    width: 109,
    alignItems: "flex-start",
    borderWidth: 0,
    borderColor: "$textColor",
    paddingTop: 20,
    paddingLeft: 5,
  },
  droRightBox: {
    flex: 1,
    justifyContent: "space-around",
    flexDirection: "column",
    borderWidth: 0,
    borderColor: "$textColor",
    alignItems: "flex-end",
    paddingRight: 5,
    paddingTop: 20,
  },
  footerText: {
    fontSize: RFValue(12),
    color: "$textColor",
  },
  footerTitle: {
    fontSize: RFValue(16),
    color: "$textColor",
    paddingBottom: RFValue(7),
  },
});
