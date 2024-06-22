import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Text,
  View,
  TouchableHighlight,
  Vibration,
  Alert,
  Platform,
} from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useFocusEffect } from "@react-navigation/native";
import EStyleSheet from "react-native-extended-stylesheet";
import { connect } from "react-redux";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarHeight } from "../components/useTabBarHeight";
import CustomStatusBar from "../components/CustomStatusBar.js";

const MeasureScreen = (props) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ws, setWs] = useState(null);

  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const tabBarHeight = useTabBarHeight();
  const [state, setState] = useState({
    measType: "",
    xEcho: "0",
    yEcho: "0",
    zEcho: "0",
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
    let cleanup = () => {};
    if (isFocused) {
      console.log("MeasureScreen focused, initializing WebSocket");
      isMountedRef.current = true;
      cleanup = initializeWebSocket();
    } else {
      console.log("MeasureScreen unfocused, cleaning up");
      closeWebSocket();
    }
    return () => {
      console.log("Cleaning up effect");
      cleanup();
    };
  }, [isFocused, initializeWebSocket, closeWebSocket]);

  useEffect(() => {
    const connectionTimeout = setTimeout(() => {
      if (ws && ws.readyState !== WebSocket.OPEN) {
        console.log("WebSocket connection timed out");
        handleWebSocketError(new Error("Connection timeout"));
      }
    }, 5000);

    return () => clearTimeout(connectionTimeout);
  }, [ws]);


  useEffect(() => {
    console.log("Decimal places updated: ", props.decimal_places);
  }, [props.decimal_places]);

 

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      closeWebSocket();
    };
  }, []);

  const initializeWebSocket = useCallback(() => {
    if (props.IPAddress && props.port) {
      console.log(`Connecting to WebSocket at ws://${props.IPAddress}:${props.port}`);
      const newWs = new WebSocket(`ws://${props.IPAddress}:${props.port}`);
      newWs.onopen = () => {
        console.log("WebSocket connection opened");
        props.change_value_only("#1fcc4d", "statusColor");
        setWs(newWs);
        requestContinuousUpdates(newWs);
      };
      newWs.onmessage = handleWebSocketMessage;
      newWs.onerror = handleWebSocketError;
      newWs.onclose = handleWebSocketClose;
      console.log("WebSocket object created");
  
      return () => {
        console.log("Closing WebSocket from cleanup function");
        closeWebSocket();
      };
    } else {
      console.log("Cannot initialize WebSocket: IP or port missing", { IP: props.IPAddress, port: props.port });
      return () => {};
    }
  }, [props.IPAddress, props.port, requestContinuousUpdates, closeWebSocket]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log("Response time:", props.response_time);
  }, [props.response_time]);

  const closeWebSocket = useCallback(() => {
    console.log("Closing WebSocket");
    if (ws) {

      ws.close();
      setWs(null);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Don't set isMountedRef to false here
  }, [ws]);

  const timeoutRef = useRef(null);

  const requestContinuousUpdates = useCallback((websocket) => { // Simplified
    if (!isMountedRef.current) return;

  console.log("Attempting to send device_info request. Response time:", props.response_time);
    console.log("Attempting to send device_info request.");
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(`<device_info id="${props.device_number}" />`);
    }

    timeoutRef.current = setTimeout(() => requestContinuousUpdates(websocket), props.response_time);
  }, [props.device_number, props.response_time, isMountedRef]);

  const handlePress = (pressType) => { // Combined press handlers
    setIsPressed(pressType !== "out"); // Only set to true for initial press and long press

    if (props.IPAddress && ws && ws.readyState === WebSocket.OPEN) {
      if (pressType === "long") {
        console.log("Sending measure_set_cloud & measure_trigger from long press");
        ws.send("<measure_set_cloud />");
      } else if (pressType === "out" && state.longPress === 1) {
        console.log("Sending measure_trigger from long press out");
        setState((prevState) => ({ ...prevState, longPress: 0 }));
      }
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, pressType === "long" ? 50 : 10]);
    }
  };

  const handleWebSocketError = (error) => {
    console.error("WebSocket error:", error);
    props.change_value_only("red", "statusColor");
    Alert.alert(
      "Verisurf Connection Lost",
      "Click retry to attempt to reconnect the app, or click sign out to return to the main screen.",
      [
        {
          text: "Sign Out",
          onPress: () => {
            AsyncStorage.clear();
            props.navigation.navigate("Auth");
          },
        },
        {
          text: "Retry",
          onPress: initializeWebSocket,
        },
      ]
    );
  };

  const handleWebSocketClose = (event) => {
    console.log("WebSocket connection closed:", event.code, event.reason);
    props.change_value_only("red", "statusColor");
  };

  const handleWebSocketMessage = useCallback((event) => {
    if (!isMountedRef.current) return;
  
    console.log("WebSocket message received:", event.data);
    
    if (typeof event.data === 'string' && event.data.includes("device_info")) {
      try {
        const XMLParser = require("react-xml-parser");
        const xml = new XMLParser().parseFromString(event.data);
        const deviceInfo = xml.getElementsByTagName("device_info")[0];
          
        if (deviceInfo) {
          const attributes = deviceInfo.attributes;
          const xRaw = attributes["X"] || 0;
          const yRaw = attributes["Y"] || 0;
          const zRaw = attributes["Z"] || 0;
          const dInfo = attributes["id"];
          const dTempRaw = attributes["Temp"];
          const dRadiusRaw = attributes["ProbeRadius"];
          const dName = deviceInfo.value;
  
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
  
          if (isMountedRef.current) {
            setState({
              xEcho: xVal,
              yEcho: yVal,
              zEcho: zVal,
              dNameEcho: dName,
              dTempEcho: dTemp,
              dInfoEcho: dInfo,
              dRadiusEcho: dRadius,
              scaler: calculateScaler(xVal, yVal, zVal),
            });
          }
        }
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    }
  }, [props.decimal_places]);

      

  const calculateScaler = (xVal, yVal, zVal) => {
    if (xVal.length > 7 || yVal.length > 7 || zVal.length > 7) {
      const biggest = Math.max(xVal.length, yVal.length, zVal.length);
      return parseFloat(1 - (biggest - 7) * 0.08);
    }
    return 1;
  };

  const onPickerValueChange = (value, index) => {
    setState((prevState) => ({
      ...prevState,
      meastype: value,
      underlayColor: value !== "none" ? "red" : EStyleSheet.value("$bgColor"),
    }));

    if (value !== "none" && props.IPAddress !== "" && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(`<measure_${value} />`);
    }
  };

  const onPress = () => {
    setIsPressed(true);
    setState((prevState) => ({
      ...prevState,
      underlayColor: "red",
    }));

    if (props.IPAddress !== "" && ws && ws.readyState === WebSocket.OPEN) {
      ws.send(`<measure_set_${props.single_or_average} />`);
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10]);
    }
  };

  const onPressOut = () => {
    setIsPressed(false);
    setState((prevState) => ({
      ...prevState,
      underlayColor: EStyleSheet.value("$bgColor"),
    }));

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
    console.log("LONG PRESSED");

    if (props.IPAddress !== "" && ws && ws.readyState === WebSocket.OPEN) {
      console.log("Sending measure_set_cloud & measure_trigger from long press");
      ws.send("<measure_set_cloud />");
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 50]);
      setState((prevState) => ({
        ...prevState,
        longPressed: 1,
      }));
    }
  };

  const {
    xEcho,
    yEcho,
    zEcho,
    meastype,
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
            onPress={() => handlePress("single")}
            onPressOut={() => handlePress("out")}
            onLongPress={() => handlePress("long")}
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
  // ... (styles remain unchanged)
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
    marginTop: Platform.OS === "ios" ? RFValue(-6) : RFValue(-10),
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
