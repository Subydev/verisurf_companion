import React, { useCallback, useEffect, useState } from "react";
import Bar from "react-native-progress/Bar";
import {
  View,
  Text,
  TouchableHighlight,
  Vibration,
  ActivityIndicator,
  Alert,
} from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useIsFocused } from "@react-navigation/native";
import { connect } from "react-redux";
import EStyleSheet from "react-native-extended-stylesheet";

let longPressed = 0;

const BuildScreen = (props) => {
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
    isLandscape: false,
    underlayColor: EStyleSheet.value("$bgColor"),
    disconnected: true,
  });

  const isFocused = useIsFocused();
  const [ws, setWs] = useState(null);
  const [simulationInterval, setSimulationInterval] = useState(null);

  useEffect(() => {
    console.log(isFocused);
    if (isFocused) {
      console.log("found isFocused attempting SetupConnection()");
      // Clean up the previous interval before setting up a new one
      cleanupConnection();
      // Set up the connection and start the simulation
      setupConnection();
    } else {
      // Clean up the connection and stop the simulation
      console.log("found cleanupConnection attempting cleanupConnection()");
      cleanupConnection();
    }

    return () => {
      // Clean up the connection and stop the simulation on component unmount
      cleanupConnection();
    };
  }, [isFocused]);

  const setupConnection = useCallback(() => {
    console.log("BuildScreen: setupConnection");

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
  }, [props.IPAddress, props.port, props.buildTutorial]);

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
    if (isFocused) {
      
      console.log("BuildScreen: simulateData");
    return setInterval(() => {
      console.log(`Starting SIMULATE: ${state.xdEcho}, ${state.ydEcho}, ${state.zdEcho}, ${state.d3Echo}`);
  
      // Generate new random values within the range 0.04 to 0.045
      const generateRandomValue = () => {
        const randomValue = Math.random() * 0.005 + 0.004;
        return randomValue.toFixed(props.decimal_places);
      };
  
      const randomX = generateRandomValue();
      const randomY = generateRandomValue();
      const randomZ = generateRandomValue();
      const randomD3 = Math.sqrt(randomX ** 2 + randomY ** 2 + randomZ ** 2).toFixed(props.decimal_places);

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

          const bBarVal = parseFloat((randomD3 / props.build_tol).toFixed(props.decimal_places));
          const progressColor = bBarVal > 1 ? props.oot_pos_color : props.in_tolerance_color;
          const negProgColor = bBarVal < -1 ? props.oot_neg_color : props.in_tolerance_color;
          const negTol = -Math.abs(bBarVal);

      setState((prevState) => {
        const newState = {
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
        };
        console.log("Initial Values:", {randomX});

        return newState;
      });
    }, 500);
  }
  };

  const onPress = () => {
    // backgroundColor: EStyleSheet.value("$bgColor")
    if (ws.readyState === WebSocket.OPEN) {
      ws.send("<measure_set_" + props.single_or_average + " />");
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10]);
    }
  };

  const onPressOut = (val) => {
    if (longPressed === 1) {
      ws.send("<measure_trigger />");
      longPressed = 0;
    }
  };

  const onLongPress = () => {
    ws.send("<measure_set_cloud />");
    ws.send("<measure_trigger />");
    Vibration.vibrate([0, 50]);
    longPressed = 1;
  };

  const beginStream = (newWs) => {
    newWs.onopen = () => {
      setState((prevState) => ({
        ...prevState,
        underlayColor: "red",
        disconnected: false,
      }));
      newWs.send("<build />");
      newWs.send('<device_info id="' + props.device_number + '" />');
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
          if (xdColor != props.oot_pos_color) {
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
          if (ydColor != props.oot_pos_color) {
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
          if (zdColor != props.oot_pos_color) {
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
          if (d3Color != props.oot_pos_color) {
            d3Color =
              d3Val < -props.build_tol
                ? props.oot_neg_color
                : props.in_tolerance_color;
          }
          var bBarVal = parseFloat(
            (d3Val / props.build_tol).toFixed(props.decimal_places)
          );
          if (bBarVal > 0) {
            var progColor =
              bBarVal > 1 && bBarVal != null
                ? props.oot_pos_color
                : props.in_tolerance_color;
            var negProgVal = 0;
          } else {
            var negProg =
              bBarVal < -1 && bBarVal != null
                ? props.oot_neg_color
                : props.in_tolerance_color;
            var negProgVal = -bBarVal;
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
      }
    };
  };

  return (
    <TouchableHighlight
      underlayColor={state.underlayColor}
      onPress={props.IPAddress === "" ? null : onPress}
      onPressOut={props.IPAddress === "" ? null : onPressOut}
      onLongPress={props.IPAddress === "" ? null : onLongPress}
      style={[
        styles.container,
        { backgroundColor: EStyleSheet.value("$bgColor") },
      ]}
    >
      <React.Fragment>
        <View
          style={{
            flexDirection: "column",
            height: 120,
            borderColor: EStyleSheet.value("$textColor"),
            borderWidth: 0,
            alignItems: "center",
            justifyContent: "space-around",
            paddingTop: 19,
          }}
        >
          {console.log('FROM RENDER:' + state.xdEcho, state.ydEcho, state.zdEcho, state.d3Echo)}
          <Text style={styles.footerTitle}>
            Tap - Single | Hold - Continuous
          </Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, transform: [{ rotateY: "180deg" }] }}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, transform: [{ rotateY: "180deg" }] }}>
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
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            alignItems: state.isLandscape ? "center" : null,
            justifyContent: state.isLandscape ? "center" : null,
          }}
        >
          {!state.isLandscape && (
            <View style={styles.droLeftBox}>
              <Text adjustsFontSizeToFit={true} style={[styles.droText]}>
                DX:
              </Text>
              <Text adjustsFontSizeToFit={true} style={[styles.droText]}>
                DY:
              </Text>
              <Text adjustsFontSizeToFit={true} style={[styles.droText]}>
                DZ:
              </Text>
              <Text
                adjustsFontSizeToFit={true}
                style={{
                  color: EStyleSheet.value("$textColor"),
                  fontSize: RFValue(60),
                  justifyContent: "space-around",
                }}
              >
                3D:
              </Text>
            </View>
          )}
          <View
            style={[
              styles.droRightBox,
              {
                justifyContent: state.isLandscape ? "center" : "space-around",
                alignItems: state.isLandscape ? "center" : "flex-end",
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{
                fontVariant: ["tabular-nums"],
                fontSize: RFValue(60),
                color: state.xdColor,
              }}
            >
              {console.log("BuildScreen:", state.xdEcho)}
              {state.xdEcho}
            </Text>

            {!state.isLandscape && (
              <Text
                numberOfLines={1}
                style={{
                  fontVariant: ["tabular-nums"],
                  fontSize: RFValue(60),
                  color: state.ydColor,
                }}
              >
                {state.ydEcho}
              </Text>
            )}

            {!state.isLandscape && (
              <Text
                numberOfLines={1}
                style={{
                  fontVariant: ["tabular-nums"],
                  fontSize: RFValue(60),
                  color: state.zdColor,
                }}
              >
                {state.zdEcho}
              </Text>
            )}

            <Text
              numberOfLines={1}
              style={{
                fontVariant: ["tabular-nums"],
                fontSize: state.isLandscape ? RFValue(145) : RFValue(60),
                color: state.ootEcho,
                textAlign: state.isLandscape ? "center" : null,
              }}
            >
              {state.d3Echo}
            </Text>
          </View>
        </View>
        {!state.isLandscape && (
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
                : `${state.dNameEcho} (${state.dInfoEcho})`}
            </Text>
            <Text style={styles.footerText}>
              Probe Radius:{" "}
              {props.IPAddress === ""
                ? "3mm | 67.4°F"
                : `${state.dRadiusEcho}mm | Temperature: ${state.dTempEcho}°F`}
            </Text>
          </View>
        )}
      </React.Fragment>
    </TouchableHighlight>
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
    backgroundColor: "$cardColor",
  },
  instructions: {
    color: "$textColor",
  },
  paragraph: {
    color: "$textColor",
  },
  droText: {
    color: "$textColor",
    fontSize: RFValue(60),
    justifyContent: "space-around",
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
  footerTitle: {
    fontSize: RFValue(16),
    color: "$textColor",
    paddingBottom: RFValue(7),
  },
});
