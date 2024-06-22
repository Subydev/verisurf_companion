import React, { useCallback, useEffect, useState } from "react";
import Bar from "react-native-progress/Bar";
import {
  View,
  Text,
  TouchableHighlight,
  Vibration,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useIsFocused } from "@react-navigation/native";
import { connect } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomStatusBar from "../components/CustomStatusBar.js";
import { useTabBarHeight } from "../components/useTabBarHeight";
import { Dimensions } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";

import EStyleSheet from "react-native-extended-stylesheet";

let longPressed = 0;

const BuildScreen = (props) => {
  const insets = useSafeAreaInsets();

  const [state, setState] = useState({
    xdEcho: "0",
    ydEcho: "0",
    zdEcho: "0",
    d3Echo: "0",
    dInfoEcho: "0",
    dTempEcho: "0",
    dRadiusEcho: "0",
    dNameEcho: "0",
    bBarEcho: "0.001",
    progressColor: "#1fcc4d",
    dotEcho: "white",
    xdColor: "white",
    ydColor: "white",
    zdColor: "white",
    ootEcho: "white",
    negTol: "0.001",
    negProgColor: "#1fcc4d",
    underlayColor: EStyleSheet.value("$bgColor"),
    disconnected: true,
  });

  const isFocused = useIsFocused();
  const [ws, setWs] = useState(null);
  const [simulationInterval, setSimulationInterval] = useState(null);

  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    async function logOrientation() {
      const orientation = await ScreenOrientation.getOrientationAsync();
      console.log("Current orientation:", orientation);
    }
    logOrientation();
  }, []);

  useEffect(() => {
    console.log("Setting up orientation listener");
    ScreenOrientation.unlockAsync()
      .then(() => console.log("Orientation unlocked"))
      .catch((err) => console.error("Failed to unlock orientation", err));

    const subscription = ScreenOrientation.addOrientationChangeListener(
      (event) => {
        console.log("Orientation change event received", event);
        handleOrientationChange(event);
      }
    );
    return () => {
      console.log("Cleaning up orientation listener");
      ScreenOrientation.removeOrientationChangeListener(subscription);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
        .then(() => console.log("Orientation locked to portrait"))
        .catch((err) => console.error("Failed to lock orientation", err));
    };
  }, []);

  const [renderKey, setRenderKey] = useState(0);

  const handleOrientationChange = (event) => {
    console.log("Orientation changed", event);
    const { orientationInfo } = event;
    const newIsLandscape =
      orientationInfo.orientation ===
        ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
      orientationInfo.orientation ===
        ScreenOrientation.Orientation.LANDSCAPE_RIGHT;

    setIsLandscape(newIsLandscape);
    setRenderKey((prev) => prev + 1); // Force re-render
  };

  useEffect(() => {
    if (isFocused) {
      cleanupConnection();
      setupConnection();
    } else {
      cleanupConnection();
    }
    return () => {
      cleanupConnection();
    };
  }, [
    isFocused,
    props.decimal_places,
    props.build_tol,
    props.single_or_average,
    props.in_tolerance_color,
    props.oot_pos_color,
    props.oot_neg_color,
    props.device_number,
    props.response_time,
  ]);
  const setupConnection = useCallback(() => {
    console.log("BuildScreen: setupConnection");
    console.log("Current response time:", props.response_time);
    if (props.buildTutorial === false) {
      Alert.alert(
        "Check Tolerance!",
        "The build tolerance set in the Verisurf Desktop App is different than the tolerance set in the Mobile App.\n\nPlease navigate to settings and ensure you have your desired build tolerance set.",
        [{ text: "Ok" }]
      );
      props.change_value_only(true, "buildTutorial");
    }

    if (props.IPAddress === "") {
      const interval = simulateData();
      setSimulationInterval(interval);
    } else {
      const newWs = new WebSocket("ws://" + props.IPAddress + ":" + props.port);
      setWs(newWs);
      setState((prevState) => ({
        ...prevState,
        disconnected: false,
        underlayColor: "red",
      }));
      beginStream(newWs);
    }
  }, [props.IPAddress, props.port, props.buildTutorial, props.decimal_places]);

  const cleanupConnection = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  };

  const simulateData = () => {
    console.log(
      "BuildScreen: simulateData response_time =",
      props.response_time
    );
    return setInterval(() => {
      const generateRandomValue = () => {
        const randomValue = Math.random() * 0.005 + 0.004;
        return randomValue.toFixed(props.decimal_places);
      };

      const randomX = generateRandomValue();
      const randomY = generateRandomValue();
      const randomZ = generateRandomValue();
      const randomD3 = Math.sqrt(
        randomX ** 2 + randomY ** 2 + randomZ ** 2
      ).toFixed(props.decimal_places);

      const xdColor =
        randomX > props.build_tol
          ? props.oot_pos_color
          : props.in_tolerance_color;
      const ydColor =
        randomY > props.build_tol
          ? props.oot_pos_color
          : props.in_tolerance_color;
      const zdColor =
        randomZ > props.build_tol
          ? props.oot_pos_color
          : props.in_tolerance_color;
      const randomD3Color =
        randomD3 > props.build_tol
          ? props.oot_pos_color
          : props.in_tolerance_color;

      const bBarVal = parseFloat(
        (randomD3 / props.build_tol).toFixed(props.decimal_places)
      );
      const progressColor =
        bBarVal > 1 ? props.oot_pos_color : props.in_tolerance_color;
      const negProgColor =
        bBarVal < -1 ? props.oot_neg_color : props.in_tolerance_color;
      const negTol = -Math.abs(bBarVal);

      setState((prevState) => ({
        ...prevState,
        xdEcho: randomX,
        ydEcho: randomY,
        zdEcho: randomZ,
        d3Echo: randomD3,
        ootEcho: randomD3Color,
        xdColor: xdColor,
        ydColor: ydColor,
        zdColor: zdColor,
        bBarEcho: bBarVal,
        progressColor: progressColor,
        negProgColor: negProgColor,
        negTol: negTol,
      }));
    }, props.response_time);
  };

  const onPress = () => {
    state.underlayColor = "red";

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("<measure_set_" + props.single_or_average + " />");
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10]);
    }
  };

  const onPressOut = () => {
    state.underlayColor = "red";

    if (longPressed === 1 && ws) {
      ws.send("<measure_trigger />");
    }
    longPressed = 0;
    console.log("onPressOut");
  };

  const onLongPress = () => {
    state.underlayColor = "red";
    if (ws) {
      ws.send("<measure_set_cloud />");
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 50]);
    }
    longPressed = 1;
  };
  const getDynamicStyles = () => ({
    droRightBox: {
      flex: 1,
      flexDirection: "column",
      borderWidth: 0,
      borderColor: EStyleSheet.value("$textColor"),
      paddingTop: isLandscape ? 0 : RFValue(20),
      justifyContent: isLandscape ? "center" : "space-around",
      alignItems: isLandscape ? "center" : "flex-end",
    },
    d3Text: {
      fontVariant: ["tabular-nums"],
      fontSize: isLandscape ? RFPercentage(40) : RFValue(60),
      color: state.ootEcho,
      textAlign: "center",
    },
    landscapeContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100%",
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  });
  const dynamicStyles = getDynamicStyles();

  const beginStream = (newWs) => {
    newWs.onopen = () => {
      setState((prevState) => ({
        ...prevState,
        underlayColor: "red",
        disconnected: false,
      }));
      newWs.send("<build />");
      sendDeviceInfoRequest(newWs);
    };

    newWs.onmessage = ({ data }) => {
      if (data.includes("device_info")) {
        var XMLParser = require("react-xml-parser");
        var info = new XMLParser()
          .parseFromString(data)
          .getElementsByTagName("device_info");

        var attributes = info[0]["attributes"],
          dName = info[0]["value"],
          xdRaw = attributes["DX"],
          ydRaw = attributes["DY"],
          zdRaw = attributes["DZ"],
          d3Raw = attributes["D3"],
          dInfo = attributes["id"],
          dTempRaw = attributes["Temp"],
          dRadiusRaw = attributes["ProbeRadius"];

        if (xdRaw != null) {
          var xdVal = parseFloat(xdRaw).toFixed(props.decimal_places);
          var xdColor =
            xdVal > props.build_tol
              ? props.oot_pos_color
              : props.in_tolerance_color;
          if (xdColor !== props.oot_pos_color) {
            xdColor =
              xdVal < -props.build_tol
                ? props.oot_neg_color
                : props.in_tolerance_color;
          }
        }
        if (ydRaw != null) {
          var ydVal = parseFloat(ydRaw).toFixed(props.decimal_places);
          var ydColor =
            ydVal > props.build_tol
              ? props.oot_pos_color
              : props.in_tolerance_color;
          if (ydColor !== props.oot_pos_color) {
            ydColor =
              ydVal < -props.build_tol
                ? props.oot_neg_color
                : props.in_tolerance_color;
          }
        }
        if (zdRaw != null) {
          var zdVal = parseFloat(zdRaw).toFixed(props.decimal_places);
          var zdColor =
            zdVal > props.build_tol
              ? props.oot_pos_color
              : props.in_tolerance_color;
          if (zdColor !== props.oot_pos_color) {
            zdColor =
              zdVal < -props.build_tol
                ? props.oot_neg_color
                : props.in_tolerance_color;
          }
        }
        if (d3Raw != null) {
          var d3Val = parseFloat(d3Raw).toFixed(props.decimal_places);
          var d3Color =
            d3Val > props.build_tol
              ? props.oot_pos_color
              : props.in_tolerance_color;
          if (d3Color !== props.oot_pos_color) {
            d3Color =
              d3Val < -props.build_tol
                ? props.oot_neg_color
                : props.in_tolerance_color;
          }
          var bBarVal = parseFloat(
            (d3Val / props.build_tol).toFixed(props.decimal_places)
          );
          var progColor =
            bBarVal > 1 ? props.oot_pos_color : props.in_tolerance_color;
          var negProgVal = 0;
          if (bBarVal <= 0) {
            var negProg =
              bBarVal < -1 ? props.oot_neg_color : props.in_tolerance_color;
            negProgVal = -bBarVal;
            bBarVal = 0;
          }
        }
        if (dTempRaw != null) {
          var dTemp = parseFloat(dTempRaw).toFixed(1);
        }
        if (dRadiusRaw != null) {
          var dRadius = parseFloat(dRadiusRaw).toFixed(3);
        }
        setState((prevState) => ({
          ...prevState,
          bBarEcho: bBarVal,
          xdEcho: xdVal,
          ydEcho: ydVal,
          zdEcho: zdVal,
          d3Echo: d3Val,
          dNameEcho: dName,
          dTempEcho: dTemp,
          dInfoEcho: dInfo,
          dRadiusEcho: dRadius,
          progressColor: progColor,
          xdColor: xdColor,
          ydColor: ydColor,
          zdColor: zdColor,
          ootEcho: d3Color,
          negProgColor: negProg,
          negTol: negProgVal,
        }));
        sendDeviceInfoRequest(newWs);

      }
    };
  };

  const sendDeviceInfoRequest = (webSocket) => {
    setTimeout(() => {
      if (webSocket.readyState === WebSocket.OPEN) {
        webSocket.send(`<device_info id="${props.device_number}" />`);
      }
    }, props.response_time);
  };

  return (
    <View style={styles.container} key={renderKey}>
      <View
        style={[
          styles.contentContainer,
          isLandscape ? styles.landscapeContentContainer : null,
          {
            paddingTop: isLandscape ? insets.top : insets.top,
            paddingBottom: isLandscape ? insets.bottom : insets.bottom + 80,
            paddingLeft: isLandscape ? insets.left : 0,
            paddingRight: isLandscape ? insets.right : 0,
          },
        ]}
      >
        <TouchableHighlight
          underlayColor={state.underlayColor}
          onPress={onPress}
          onPressOut={onPressOut}
          onLongPress={onLongPress}
          delayLongPress={500}
          activeOpacity={1}
          style={[
            styles.container,
            { backgroundColor: EStyleSheet.value("$bgColor") },
          ]}
        >
          <React.Fragment>
            {!isLandscape && (
              <>
                <View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: RFValue(19),
                  }}
                >
                  <Text style={styles.footerTitle}>
                    Tap - Single | Hold - Continuous
                  </Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ flex: 1, transform: [{ rotateY: "180deg" }] }}>
                    <View style={{ flexDirection: "row" }}>
                      <View
                        style={{ flex: 1, transform: [{ rotateY: "180deg" }] }}
                      >
                        <Bar
                          progress={parseFloat(state.negTol)}
                          width={null}
                          height={32}
                          color={state.negProgColor}
                          borderWidth={0}
                          borderRadius={0}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Bar
                          progress={parseFloat(state.bBarEcho)}
                          width={null}
                          height={32}
                          color={state.progressColor}
                          borderWidth={0}
                          borderRadius={0}
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <ActivityIndicator
                  size="small"
                  color="#00ff00"
                  animating={
                    props.statusColor === "red"
                      ? props.IPAddress === ""
                        ? false
                        : true
                      : false
                  }
                />
              </>
            )}
            <View style={{ flexDirection: "row", flex: 1 }}>
              {!isLandscape && (
                <View style={styles.droLeftBox}>
                  <Text adjustsFontSizeToFit={true} style={styles.droText}>
                    DX:
                  </Text>
                  <Text adjustsFontSizeToFit={true} style={styles.droText}>
                    DY:
                  </Text>
                  <Text adjustsFontSizeToFit={true} style={styles.droText}>
                    DZ:
                  </Text>
                  <Text adjustsFontSizeToFit={true} style={styles.droText}>
                    3D:
                  </Text>
                </View>
              )}
              <View style={[styles.droRightBox, dynamicStyles.droRightBox]}>
                {!isLandscape ? (
                  <>
                    <Text
                      numberOfLines={1}
                      style={[styles.droValue, { color: state.xdColor }]}
                    >
                      {state.xdEcho}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.droValue, { color: state.ydColor }]}
                    >
                      {state.ydEcho}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.droValue, { color: state.zdColor }]}
                    >
                      {state.zdEcho}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.droValue, { color: state.ootEcho }]}
                    >
                      {state.d3Echo}
                    </Text>
                  </>
                ) : (
                  <View style={dynamicStyles.landscapeContainer}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      style={dynamicStyles.d3Text}
                    >
                      {state.d3Echo}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </React.Fragment>
        </TouchableHighlight>
      </View>
      {!isLandscape && (
        <CustomStatusBar
          IPAddress={props.IPAddress}
          statusColor={props.statusColor}
        />
      )}
    </View>
  );
};
BuildScreen.navigationOptions = {
  header: null,
};
function mapStateToProps(state) {
  return {
    build_tol: state.build_tol,
    dark_mode: state.dark_mode,
    decimal_places: state.decimal_places,
    response_time: state.response_time,
    device_number: state.device_number,
    IPAddress: state.IPAddress,
    port: state.port,
    statusColor: state.statusColor,
    buildTutorial: state.buildTutorial,
    single_or_average: state.single_or_average,
    in_tolerance_color: state.in_tolerance_color,
    oot_pos_color: state.oot_pos_color,
    oot_neg_color: state.oot_neg_color,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    change_value_only: (value, name) =>
      dispatch({ type: "CHANGE_VALUE", value, name }),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(BuildScreen);
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$bgColor",
  },
  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RFValue(0),
    backgroundColor: "yellow",
  },
  contentContainer: {
    flex: 1,
    // backgroundColor: "purple",
    marginBottom: 20, // Add some space for the CustomStatusBar
  },
  landscapeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // landscapeContentContainer: {
  //   flex: 1,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  footerTitle: {
    color: "$textColor",
    fontSize: RFValue(18),
  },
  instructions: {
    color: "$textColor",
  },
  paragraph: {
    color: "$textColor",
  },
  droValue: {
    fontVariant: ["tabular-nums"],
    fontSize: RFValue(60),
  },
  droText: {
    color: "$textColor",
    fontSize: RFValue(60),
  },
  droLeftBox: {
    justifyContent: "space-around",
    flexDirection: "column",
    width: RFValue(115),
    alignItems: "flex-start",
    borderWidth: 0,
    borderColor: "$textColor",
    paddingTop: RFValue(20),
    paddingLeft: RFValue(5),
  },
  droRightBox: {
    flex: 1,
    flexDirection: "column",
    borderWidth: 0,
    borderColor: "$textColor",
    paddingTop: 20,
  },
  footerText: {
    fontSize: RFValue(12),
    color: "$textColor",
  },
});
