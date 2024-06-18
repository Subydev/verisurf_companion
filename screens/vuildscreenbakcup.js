import React, { useCallback } from 'react';
import Bar from 'react-native-progress/Bar';
// import * as Progress from "react-native-progress";

import {
  View,
  Text,
  TouchableHighlight,
  Vibration,
  ActivityIndicator,
  Alert,
} from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
// import { withNavigationFocus } from "react-navigation";
import { useFocusEffect } from '@react-navigation/native';
import { connect } from "react-redux";
import EStyleSheet from "react-native-extended-stylesheet";
// import * as ScreenOrientation from 'expo-screen-orientation';

let longPressed = 0;

class BuildScreen extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.onPress = this.onPress.bind(this);

    this.state = {
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
      xdColor: 'white',
      ydColor: 'white',
      zdColor: 'white',
      ootEcho: 'white', // Add this line
      negTol: "0.001",
      negProgColor: '#1fcc4d',
      isLandscape: false,
      underlayColor: EStyleSheet.value('$bgColor'),
      disconnected: true,
    };

    this.state = {
      underlayColor: EStyleSheet.value("$bgColor"),
      disconnected: true,
    };
  }
  onPress = () => {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send("<measure_set_" + this.props.single_or_average + " />");
      this.ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10]);
    }
  };

  onPressOut = (val) => {
    if (longPressed === 1) {
      this.ws.send("<measure_trigger />");
      longPressed = 0;
    }
  };

  onLongPress = () => {
    this.ws.send("<measure_set_cloud />");
    this.ws.send("<measure_trigger />");
    Vibration.vibrate([0, 50]);
    longPressed = 1;
  };

  //Handles the disconnection event and changes the underlay color
  //to indicate to the user we are unconnected.
  UNSAFE_componentWillReceiveProps() {
    if (this.props.IPAddress === "") {
      return;
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.IPAddress === "" &&
      this.props.isFocused &&
      this.state.underlayColor != EStyleSheet.value("$bgColor")
    ) {
      this.setState({ underlayColor: EStyleSheet.value("$bgColor") });
      return;
    } else if (this.props.IPAddress == "" && this.props.isFocused) {
      // ScreenOrientation.unlockAsync()
      return;
    } else if (prevProps.isFocused === false && this.props.isFocused === true) {
      this.ws = new WebSocket(
        "ws://" + this.props.IPAddress + ":" + this.props.port
      );
      // ScreenOrientation.unlockAsync()
      this.setState({ disconnected: false, underlayColor: "red" });
      this.beginStream();
    }
  
    if (this.props.isFocused === false && this.ws && this.ws.close) {
      // ScreenOrientation.lockAsync(ScreenOrientation.Orientation.PORTRAIT_UP)
      this.ws.close();
    }
  
    if (
      this.props.statusColor == "red" &&
      this.state.underlayColor != EStyleSheet.value("$bgColor")
    ) {
      this.setState({ underlayColor: EStyleSheet.value("$bgColor") });
    }
    
    if (Platform.OS !== "web") {
      // Use ScreenOrientation module only on native platforms
      ScreenOrientation.unlockAsync();
      // ...
    }
  }
  componentDidMount() {
    this._isMounted = true;

    if (this.props.buildTutorial === false) {
      Alert.alert(
        "Check Tolerance!",
        "The build tolerance set in the Verisurf Desktop App is different than the tolerance set in the Mobile App.\n\nPlease navigate to settings and ensure you have your desired build tolerance set.",
        [{ text: "Ok" }]
      );
      this.props.change_value_only(true, "buildTutorial");
    }

    if (this.props.IPAddress === "") {
      // In Preview Mode, simulate the data
      this.simulateData();
    } else {
      // Establish WebSocket connection
      this.ws = new WebSocket(
        "ws://" + this.props.IPAddress + ":" + this.props.port
      );
      this.beginStream();
    }
  }
  simulateData = () => {
    this.simulationInterval = setInterval(() => {
      if (this._isMounted) {
        const randomX = (Math.random() * 10 - 5).toFixed(this.props.decimal_places);
        const randomY = (Math.random() * 10 - 5).toFixed(this.props.decimal_places);
        const randomZ = (Math.random() * 10 - 5).toFixed(this.props.decimal_places);
        const randomD3 = (Math.random() * 10 - 5).toFixed(this.props.decimal_places);
        const randomD3Color = randomD3 > this.props.build_tol ? this.props.oot_pos_color : this.props.in_tolerance_color;
        const randomBBarVal = Math.random();
        const randomProgColor = randomBBarVal > 0.5 ? this.props.oot_pos_color : this.props.in_tolerance_color;
        const randomNegProgColor = randomBBarVal < -0.5 ? this.props.oot_neg_color : this.props.in_tolerance_color;
        const randomNegTol = -Math.abs(randomBBarVal);
  
        this.setState(
          {
            xdEcho: randomX,
            ydEcho: randomY,
            zdEcho: randomZ,
            d3Echo: randomD3,
            ootEcho: randomD3Color,
            bBarEcho: randomBBarVal,
            progressColor: randomProgColor,
            negProgColor: randomNegProgColor,
            negTol: randomNegTol,
          },
          () => {
            console.log(this.state.xdEcho, this.state.ydEcho, this.state.zdEcho, this.state.d3Echo, this.state.ootEcho);
          }
        );
      }
    }, 500);
  };
  beginStream = () => {
    this._isMounted = true;

    this.ws.onopen = () => {
      this.setState({ underlayColor: "red", disconnected: false });
      this.ws.send("<build />");
      this.ws.send('<device_info id="' + this.props.device_number + '" />');
    };

    if (this._isMounted) {
      this.ws.onmessage = ({ data }) => {
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
            var xdVal = parseFloat(xdRaw).toFixed(this.props.decimal_places);
            var xdColor =
              xdVal > this.props.build_tol
                ? this.props.oot_pos_color
                : this.props.in_tolerance_color;
            if (xdColor != this.props.oot_pos_color) {
              xdColor =
                xdVal < -this.props.build_tol
                  ? this.props.oot_neg_color
                  : this.props.in_tolerance_color;
            }
          }
          if (ydRaw != null) {
            var ydVal = parseFloat(ydRaw).toFixed(this.props.decimal_places);
            var ydColor =
              ydVal > this.props.build_tol
                ? this.props.oot_pos_color
                : this.props.in_tolerance_color;
            if (ydColor != this.props.oot_pos_color) {
              ydColor =
                ydVal < -this.props.build_tol
                  ? this.props.oot_neg_color
                  : this.props.in_tolerance_color;
            }
          }
          if (zdRaw != null) {
            var zdVal = parseFloat(zdRaw).toFixed(this.props.decimal_places);
            var zdColor =
              zdVal > this.props.build_tol
                ? this.props.oot_pos_color
                : this.props.in_tolerance_color;
            if (zdColor != this.props.oot_pos_color) {
              zdColor =
                zdVal < -this.props.build_tol
                  ? this.props.oot_neg_color
                  : this.props.in_tolerance_color;
            }
          }
          if (d3Raw != null) {
            var d3Val = parseFloat(d3Raw).toFixed(this.props.decimal_places);
            var d3Color =
              d3Val > this.props.build_tol
                ? this.props.oot_pos_color
                : this.props.in_tolerance_color;
            if (d3Color != this.props.oot_pos_color) {
              d3Color =
                d3Val < -this.props.build_tol
                  ? this.props.oot_neg_color
                  : this.props.in_tolerance_color;
            }

            bBarVal = parseFloat(
              (d3Val / this.props.build_tol).toFixed(this.props.decimal_places)
            );
            if (bBarVal > 0) {
              if (bBarVal > 1 && bBarVal != null) {
                var progColor = this.props.oot_pos_color;
              } else {
                var progColor = this.props.in_tolerance_color;
              }
              var negProgVal = 0;
            } else {
              if (bBarVal < -1 && bBarVal != null) {
                var negProg = this.props.oot_neg_color;
              } else {
                var negProg = this.props.in_tolerance_color;
              }
              var negProgVal = -bBarVal;
              var bBarVal = 0;
            }
          }
          if (dTempRaw != null) {
            var dTemp = parseFloat(dTempRaw).toFixed(1);
          }
          if (dRadiusRaw != null) {
            var dRadius = parseFloat(dRadiusRaw).toFixed(3);
          }

          this._isMounted &&
            this.setState({
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
            });

          setTimeout(() => {
            if (this.props.isFocused === false) {
              this.ws.close();
              return;
            }
            this.ws.send(
              '<device_info id="' + this.props.device_number + '" />'
            );
          }, this.props.response_time);
        } else {
          //this.ws.send('<device_info id="' + this.props.device_number + '" />');
        }
      };
    }
  };

  componentWillUnmount() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
    }
    if (this.ws && this.ws.close) {
      this.ws.close();
    }
    this._isMounted = false;
  }
  render() {
    const {
      xdEcho,
      ydEcho,
      zdEcho,
      d3Echo,
      dNameEcho,
      ootEcho,
      dInfoEcho,
      dTempEcho,
      bBarEcho,
      progressColor,
      negTol,
      dRadiusEcho,
      dotEcho,
      xdColor,
      ydColor,
      zdColor,
      negProgColor,
      isLandscape,
      underlayColor,
      disconnected,
    } = this.state;

    return (
      <TouchableHighlight
        underlayColor={this.state.underlayColor}
        onPress={this.onPress}
        onPressOut={this.onPressOut}
        onLongPress={this.onLongPress}
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
            <Text style={styles.footerTitle}>
              Tap - Single | Hold - Continuous
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, transform: [{ rotateY: "180deg" }] }}>
            <Bar
      progress={negTol}
      width={null}
      height={32}
      color={negProgColor}
      borderWidth={0}
      borderRadius={0}
              />
            </View>
            <View style={{ flex: 1 }}>
            <Bar
      progress={bBarEcho}
      width={null}
      height={32}
      color={progressColor}
      borderWidth={0}
      borderRadius={0}
              />
            </View>
          </View>
          <ActivityIndicator
            size="small"
            color="#00ff00"
            animating={
              this.props.statusColor == "red"
                ? this.props.IPAddress == ""
                  ? false
                  : true
                : false
            }
          />
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              alignItems: isLandscape ? "center" : null,
              justifyContent: isLandscape ? "center" : null,
            }}
          >
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
                  justifyContent: isLandscape
                    ? "center"
                    : "space-around",
                  alignItems: isLandscape ? "center" : "flex-end",
                },
              ]}
            >
                <Text
                  numberOfLines={1}
                  style={{
                    fontVariant: ["tabular-nums"],
                    fontSize: RFValue(60),
                    color: xdColor,
                  }}
                >
                {xdEcho}
                </Text>

              {!isLandscape && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontVariant: ["tabular-nums"],
                    fontSize: RFValue(60),
                    color: ydColor,
                  }}
                >
                {ydEcho}
                </Text>
              )}

              {!isLandscape && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontVariant: ["tabular-nums"],
                    fontSize: RFValue(60),
                    color: zdColor,
                  }}
                >
                {zdEcho}
                </Text>
              )}

              <Text
                numberOfLines={1}
                style={{
                  fontVariant: ["tabular-nums"],
                  fontSize: isLandscape ? RFValue(145) : RFValue(60),
                  color: ootEcho, // Use ootEcho from the state
                  textAlign: isLandscape ? "center" : null,
                }}
              >
              {d3Echo}
              </Text>
            </View>
          </View>
          {!isLandscape && (
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
                // borderTopRightRadius: 10,
                // borderTopLeftRadius: 10,
                borderRadius: 8,
                //borderTopColor: "darkgray"
              }}
            >
              <View
                style={{
                  borderRadius: 5,
                  width: 10,
                  height: 10,
                  backgroundColor: this.props.statusColor,
                }}
              ></View>
              <Text style={styles.footerText}>
              Connected To: {dNameEcho} ({dInfoEcho})
              </Text>
              <Text style={styles.footerText}>
              Probe Radius: {dRadiusEcho} | Temperature: {dTempEcho}
              {dTempEcho}              </Text>
            </View>
          )}
        </React.Fragment>
      </TouchableHighlight>
    );
  }
}

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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(BuildScreen));

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

    //paddingLeft: 10,
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
    //paddingRight: 5,
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

BuildScreen.navigationOptions = {
  header: null,
};







Measre:
 import React from "react";
import Constants from "expo-constants";
import { ActivityIndicator } from "react-native";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { withNavigationFocus } from "react-navigation";
import EStyleSheet from "react-native-extended-stylesheet";
import { connect } from "react-redux";
import registerForPushNotificationsAsync from "../components/notifications";
import { Picker } from "@react-native-picker/picker";
import {
  Text,
  View,
  TouchableHighlight,
  Vibration,
  Alert,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import AutoScreen from './AutoScreen';

var error_detector = true;

class MeasureScreen extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    if (this.props.IPAddress != "") {
      this.ws = new WebSocket(
        "ws://" + this.props.IPAddress + ":" + this.props.port
      );
    } else {
      this.ws = new WebSocket("ws://localhost:" + this.props.port);
    }
    this.onPress = this.onPress.bind(this);
    this.state = {
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
    };
  }

  onPickerValueChange = (value, index) => {
    this._isMounted &&
      this.setState(
        {
          meastype: value,
        },
        () => {
          if (this.state.meastype != "none") {
            this.setState({ underlayColor: "red" });
            var measSend = `<measure_${this.state.meastype} />`;
            this.ws.send(measSend);
          } else {
            this.setState({ underlayColor: EStyleSheet.value("$bgColor") });
          }
        }
      );
  };

  onPress = () => {
    this._isMounted && this.setState({ backgroundColor: "red" });

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send("<measure_set_" + this.props.single_or_average + " />");
      this.ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10]);
    }
  };

  onPressOut = () => {
    this._isMounted &&
      this.setState({ backgroundColor: EStyleSheet.value("$bgColor") });

    if (this.state.longPressed === 1) {
      this.ws.send("<measure_trigger />");
      this.setState({ longPressed: 0 });
    }
  };

  onLongPress = () => {
    this.ws.send("<measure_set_cloud />");
    this.ws.send("<measure_trigger />");
    Vibration.vibrate([0, 50]);

    this.setState({ longPressed: 1 });
  };

  componentDidUpdate(prevProps) {
    if (this.props.IPAddress === "" && this.props.isFocused) {
      //this.setState({underlayColor: EStyleSheet.value('$bgColor')})
      return;
    }

    if (prevProps.isFocused === false && this.props.isFocused === true) {
      error_detector = true;
      this.setState({
        backgroundColor: EStyleSheet.value("$bgColor"),
        underlayColor: EStyleSheet.value("$bgColor"),
      });
      this.ws = new WebSocket(
        "ws://" + this.props.IPAddress + ":" + this.props.port
      );
      this.beginStream();
    }

    if (this.props.isFocused === false) {
      error_detector = false;
      this.ws.close();
    }
  }

  beginStream = () => {
    this.setState({ meastype: "none" });
    this._isMounted = true;

    this.ws.onopen = () => {
      this.props.change_value_only("#1fcc4d", "statusColor");
      this.ws.send('<device_info id="' + this.props.device_number + '" />');
    };

    if (this._isMounted) {
      this.ws.onmessage = ({ data }) => {
        if (data.includes("device_info")) {
          var XMLParser = require("react-xml-parser");
          var info = new XMLParser()
            .parseFromString(data)
            .getElementsByTagName("device_info");
          var attributes = info[0]["attributes"];
          var xRaw = undefined ? 0 : attributes["X"];
          var yRaw = undefined ? 0 : attributes["Y"];
          var zRaw = undefined ? 0 : attributes["Z"];
          var dInfo = attributes["id"];
          var dTempRaw = attributes["Temp"];
          var dRadiusRaw = attributes["ProbeRadius"];
          var dName = info[0]["value"];

          var xVal = parseFloat(xRaw).toFixed(this.props.decimal_places);
          var yVal = parseFloat(yRaw).toFixed(this.props.decimal_places);
          var zVal = parseFloat(zRaw).toFixed(this.props.decimal_places);

          if (dTempRaw != null) {
            var dTemp = parseFloat(dTempRaw).toFixed(1);
          }
          if (dRadiusRaw != null) {
            var dRadius = parseFloat(dRadiusRaw).toFixed(3);
          }
          this.ws.onerror = () => {
            if (error_detector) {
              this.props.change_value_only("red", "statusColor");
              Alert.alert(
                "Verisurf Connection Lost.",
                "Click retry to attempt to reconnect the app, or click sign out to return to the main screen.",
                [
                  {
                    text: "Sign Out",
                    onPress: () => {
                      AsyncStorage.clear();
                      this.props.navigation.navigate("Auth");
                    },
                  },
                  {
                    text: "retry",
                    onPress: () => {
                      this.ws = new WebSocket(
                        "ws://" + this.props.IPAddress + ":" + this.props.port
                      );
                      this.beginStream();
                    },
                  },
                ]
              );
            }
          };

          this._isMounted &&
            this.setState({
              xEcho: xVal,
              yEcho: yVal,
              zEcho: zVal,
              dNameEcho: dName,
              dTempEcho: dTemp,
              dInfoEcho: dInfo,
              dRadiusEcho: dRadius,
            });
          if (xVal.length > 7 || yVal.length > 7 || zVal > 7) {
            var biggest =
              xVal.length > yVal.length
                ? xVal.length > zVal.length
                  ? xVal.length
                  : zVal.length
                : yVal.length > zVal.length
                ? yVal.length
                : zVal.length;
            this.setState({
              scaler: parseFloat(1 - (biggest - 7) * 0.08),
            });
          } else {
            this.setState({ scaler: 1 });
          }

          setTimeout(() => {
            if (this.props.isFocused === false) {
              return;
            }
            if (this._isMounted) {
              this.ws.send(
                '<device_info id="' + this.props.device_number + '" />'
              );
            }
          }, this.props.response_time);
        } else {
          // this.ws.send('<device_info id="' + this.props.device_number + '" />');
        }
      };
    }
  };

  componentDidMount() {
    if (Constants.isDevice && this.props.is_registered == false) {
      var self = this;
      var x = registerForPushNotificationsAsync();
      x.then(function (value) {
        self.props.change_value_only(value, "is_registered");
      });
    }

    if (this.props.IPAddress === "") {
      Alert.alert(
        "Preview Mode",
        "Since IP was left blank, you have entered preview mode. The app is not connected, but you may freely roam the components.\n\nYou may sign out now, or visit settings and sign out later.",
        [
          {
            text: "Sign Out",
            onPress: async () => {
              await AsyncStorage.removeItem("userToken");
              this.props.navigation.navigate("Auth");
            },
          },
          { text: "Continue" },
        ]
      );
      return;
    }
    this.beginStream();
  }

  UNSAFE_componentWillReceiveProps() {
    if (this.props.statusColor === "red") {
      this.setState({ underlayColor: EStyleSheet.value("$bgColor") });
    } else if (
      this.props.statusColor != "red" &&
      this.state.meastype != "none"
    ) {
      if (this.state.meastype == undefined) {
        return;
      }
      this.setState({ underlayColor: "red" });
    }
  }

  componentWillUnmount() {
    // Remove the event listener
    this.ws.close();
    this._isMounted = false;
  }

  render() {
    return (
      <TouchableHighlight
        underlayColor={this.state.underlayColor}
        onPress={this.onPress}
        onPressOut={this.onPressOut}
        onLongPress={this.onLongPress}
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
              height: 90,
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
                this.props.statusColor == "red"
                  ? this.props.IPAddress == ""
                    ? false
                    : true
                  : false
              }
            />
          </View>
          <View style={{ flexDirection: "row", flex: 1 }}>
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
                  fontSize: RFValue(59) * this.state.scaler,
                  color: EStyleSheet.value("$textColor"),
                }}
              >
                {this.state.xEcho}
              </Text>
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                style={{
                  fontVariant: ["tabular-nums"],
                  opacity: 1,
                  fontSize: RFValue(59) * this.state.scaler,
                  color: EStyleSheet.value("$textColor"),
                }}
              >
                {this.state.yEcho}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontVariant: ["tabular-nums"],
                  opacity: 1,
                  fontSize: RFValue(59) * this.state.scaler,
                  color: EStyleSheet.value("$textColor"),
                }}
              >
                {this.state.zEcho}
              </Text>
            </View>
          </View>
          <View key={this.props.dark_mode}>
            <Picker
              selectedValue={this.state.meastype}
              itemStyle={styles.pickerItem}
              style={styles.pickerStyle}
              onValueChange={this.onPickerValueChange}
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
              // borderTopRightRadius: 10,
              // borderTopLeftRadius: 10,
              borderRadius: 8,
              //borderTopColor: "darkgray"
            }}
          >
            <View
              style={{
                borderRadius: 5,
                width: 10,
                height: 10,
                backgroundColor: this.props.statusColor,
              }}
            ></View>
            <Text style={styles.footerText}>
              Connected To: {this.state.dNameEcho} ({this.state.dInfoEcho})
            </Text>
            <Text style={styles.footerText}>
              Probe Radius: {this.state.dRadiusEcho} | Temperature:{" "}
              {this.state.dTempEcho}
            </Text>
          </View>
        </React.Fragment>
      </TouchableHighlight>
    );
  }
}
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
    //scaler: state.scaler,
    is_registered: state.is_registered,
  };
}
function mapDispatchToProps(dispatch) {
  return {
    change_value_only: (value, name) =>
      dispatch({ type: "CHANGE_VALUE", value, name }),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigationFocus(MeasureScreen));

//export default withNavigation(MeasureScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: "$textColor",
  },
  pickerItem: {
    color: "$textColor",
    height: 120,
    fontSize: 32,
    alignContent: "center",
    flexDirection: "column",
  },
  pickerStyle: {
    color: "$textColor",
    borderColor: "$textColor",
    borderWidth: 1,
    borderRadius: 50,
    borderBottomWidth: 1,
  },
  droText: {
    color: "$textColor",
    //fontSize: {this.state.scaler},
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


AutoScreen
import React from "react";
import {
  View,
  Text,
  TouchableHighlight,
  ActivityIndicator,
  Vibration,
  Alert,
  Linking,
} from "react-native";
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { withNavigationFocus } from 'react-navigation';

var runState = 0
var objsInPlan = 0
var obj = []
var objNames = []
var objValues = []
var propsInObj = 0

class AutoScreen extends React.Component {

  constructor(props) {
    super(props);

    this._isMounted = false;
    this.loaded = false;
    this.onPress = this.onPress.bind(this);

    if(this.props.IPAddress != ''){
      this.ws = new WebSocket("ws://" + this.props.IPAddress + ":" + this.props.port);
    }

    this.state = {
      planNameEcho: "",
      runStateEcho: 0,
      planIDEcho: 0,
      objectsInPlanEcho: 0,
      currMeasNameEcho: "",
      nextMeasNameEcho: "",
      measDataState: {},
      hasMeasEcho: "",
      responsiveText: RFPercentage(4.1),
    };

    this.state = {
      backgroundColor: EStyleSheet.value('$bgColor'),
      underlayColor: EStyleSheet.value('$bgColor'),
      disconnected: true,
    };
  }

  onPress = () => {

    if (this._isMounted && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('<measure_set_' + this.props.single_or_average + ' />')
      this.ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10])
    }
  };

  onLongPress = () => {
    if(this._isMounted) {
      this.ws.send("<inspect_plan_start id='0' />"); 
    } 
  };


  componentDidUpdate(prevProps){
    if(this.props.IPAddress === '' && this.props.isFocused && this.state.underlayColor != EStyleSheet.value('$bgColor')){
      this.setState({underlayColor: EStyleSheet.value('$bgColor')})
      this._isMounted = false;
      return;
    }
    else if(this.props.IPAddress == '' && this.props.isFocused){
      this._isMounted = false;
      return;
    }

    else if(prevProps.isFocused === false && this.props.isFocused === true){
      this.ws = new WebSocket("ws://" + this.props.IPAddress + ":" + this.props.port);
      this.beginStream();
    }

    else if(this.props.isFocused=== false){
      this.loaded= false;
      if(this.ws != undefined){
        this.ws.close();
      }
    }

  }

  //Handles the disconnection event and changes the underlay color
  //to indicate to the user we are unconnected.
  UNSAFE_componentWillReceiveProps(){
  
    if(this.props.IPAddress === ''){
      return;
    }

    if(this.loaded && this.props.statusColor == '#1fcc4d'){
      this.setState({underlayColor: EStyleSheet.value('$bgColor'), disconnected: true})
    }
    else if(this.props.statusColor == 'red'){
      this.setState({underlayColor: EStyleSheet.value('red'), disconnected: false})
    }
    this.loaded = true;
  }

  componentDidMount(){
    if(this.props.IPAddress === ''){
      this._isMounted = false;
      this.setState({underlayColor: EStyleSheet.value('$bgColor')})
      return;
    }
    else{
      this.beginStream();
    }
  }

  beginStream = () => {
    this._isMounted = true;
    this.ws.onopen = () => {
      this.setState({underlayColor: 'red', disconnected: false})
      if(this.props.APICompatible === false){
        this.ws.send('<Version />')
      }
      this.ws.send("<inspect_plan_info />");
    }

      if (this._isMounted) {
        this.ws.onmessage = ({ data }) => {
           
          if (data.includes("<acknowledgement />")) {
            return;
          }    
          //Checks if the Plan Info Data has Run State. If it doesn't, there are no Plans made.                
          else if (data.includes("inspect_plan_info" && "run_state")) {
            this._getPlanInfo(data)
            setTimeout(() => {

              if(this.props.isFocused === false){
                return;
              }
  
              this.ws.send("<inspect_plan_info />");
            }, this.props.auto_response_time);
          }


          else if (data.includes("measured")) {
            this._isMounted && this.setState({ hasMeasEcho: true })
            var xmlResult = this._xmlParse(data)
            objVals = (xmlResult['response']['success']['data']['inspect_object_info']['object']['property'])
            this._renderObjInfo(objVals)
          }

          else if (data.includes('>version<')){
            var xmlResult = this._xmlParse(data)
            result = (xmlResult['response']['success']['data'])
            currentVersion = result;
            minVersion = ['1', '0','6']
            currentVersion = currentVersion.split('.')

            for(item in currentVersion){
              if(currentVersion[item] < minVersion[item]){
                Alert.alert(
                  'Verisurf Software Version',
                  `Your Verisurf desktop client is out of date. Auto Inspect requires API version 1.0.6 or greater (Verisurf 2019 1).\n\nProceed to downloads page?`,
                  [
                    {text: 'Yes', onPress: () => {Linking.openURL("https://www.verisurf.com/downloads")}},
                    {text: 'Cancel'}
                  ]
                )
                this.setState({underlayColor: 'black'})
                this._isMounted = false;
                this.props.change_value_only(false, "APICompatible")
                return;
              }
            }

            this.props.change_value_only(true, "APICompatible")

          }   
        };
      }
  }

  _getPlanInfo = (d) => {

    var xmlResult = this._xmlParse(d)
    var planName = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['Object Name:'])
    var planIndex = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['attr']['id'])
    runState = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['attr']['run_state'])
    objsInPlan = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['plan_object'].length)
    if (objsInPlan == undefined) {
      var objsInPlan = 1
    }


    this._isMounted && this.setState({ planNameEcho: planName, planIDEcho: planIndex, runStateEcho: runState, objectsInPlanEcho: objsInPlan })

    if (runState == 1) {
      var currMeasuringID = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['attr']['measure_object_id'])

      if (objsInPlan == 1) {
        
       var currMeasuringName = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['plan_object']['Object Name:'])
      }

      else  {
        var currMeasuringName = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['plan_object'][currMeasuringID]['Object Name:'])
      }

      if (currMeasuringID != undefined && currMeasuringName != undefined) {
        if (currMeasuringID <= objsInPlan - 2) {
         
         let nextMeasuringName = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['plan_object'][currMeasuringID + 1]['Object Name:'])
          this._isMounted && this.setState({ nextMeasNameEcho: nextMeasuringName })
        }
        else {
          this._isMounted && this.setState({ nextMeasNameEcho: "" })

        }
        this._isMounted && this.setState({ currMeasNameEcho: currMeasuringName })
        this._getObjInfo(currMeasuringID)


      }
      else {
        this._isMounted && this.setState({ hasMeasEcho: false, currMeasNameEcho: "" })
      }

    }
  };

  _getObjInfo = (id) => {
    this.ws.send('<inspect_object_info id="' + id + '" />');
  };

  _renderObjInfo = (vals) => {
    propsInObj = vals.length
    var propsArr = []
    for (i = 0; i < propsInObj; i++) {
      var name = vals[i]["attr"]['name']
        if(vals[i]['attr']['deviation'] != undefined || vals[i]['attr']['deviation'] != null){
          var deviation = parseFloat(vals[i]['attr']['deviation']).toFixed(this.props.decimal_places)
        }
        else{
          var deviation = parseFloat(0).toFixed(this.props.decimal_places)
        }
      
      var objArr = { [name]: deviation };
      propsArr.push(objArr)
    }
    obj = Object.assign({}, ...propsArr);
    objNames = Object.keys(obj)
    objValues = Object.values(obj)
    if(propsInObj > 10 && this.state.responsiveText == RFPercentage(4.1)){
      this.setState({responsiveText: RFPercentage(propsInObj/5)})
    }
    else if(propsInObj < 11 && this.state.responsiveText != RFPercentage(4.1)){
      this.setState({responsiveText: RFPercentage(4.1)})
    }
    
  };


  _xmlParse = (d) => {
    var options = {
      attributeNamePrefix: "",
      attrNodeName: "attr", //default is 'false'
      textNodeName: "Object Name:",
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      cdataTagName: "__cdata", //default is 'false'
      cdataPositionChar: "\\c",
      localeRange: "", //To support non english character in tag/attribute values.
      parseTrueNumberOnly: true,
      attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),//default is a=>a
      tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
      stopNodes: ["parse-me-as-string"]
    };

    var parser = require('fast-xml-parser');
    var he = require('he');
    var res = parser.parse(d, options);
    return res;
  };


  render() {

    var namesarr = [];
    for (let i = 0; i < propsInObj; i++) {

      namesarr.push(
        <Text key={i}
          numberOfLines={1}
          style={[styles.droText, {fontSize: this.state.responsiveText}]}>{objNames[i] + ":"}</Text>
      )
    }

    var valuesarr = [];
    for (let i = 0; i < propsInObj; i++) {

      valuesarr.push(
        <Text key={i}
          style={[styles.droText, {fontSize: this.state.responsiveText}]}>{objValues[i]}</Text>
      )
    }

    return (
      <TouchableHighlight
        underlayColor={this.state.underlayColor}
        onPress={this.onPress}
        onPressOut={this.onPressOut}
        onLongPress={this.onLongPress}
        onLongPressOut={this.onLongPressOut}
        style={ styles.container }
      >
        <React.Fragment>
          <View
            style={{
              flexDirection: "column",
              height: 90,
              borderColor: EStyleSheet.value('$textColor'),
              borderWidth: 0,
              alignItems: "center",
              justifyContent: "space-around",
              paddingTop: 50
            }}
          >
            
            <Text style={styles.footerTitle}>Tap - Measure Point | Hold - Start Plan
                </Text>
          </View>
          <View style={styles.justMeasuredView}>
          <ActivityIndicator size="small" color="#00ff00" animating={this.props.statusColor == 'red' ? (this.props.IPAddress == '' ? false:true):false}/>
            <Text style={styles.justMeasuredText}>{this.state.currMeasNameEcho}</Text>
          </View>
          <View style={styles.tableView}>
            <View style={styles.droLeftBox}>
              {this.state.hasMeasEcho && namesarr}
            </View>
            <View style={styles.droRightBox}>
              {this.state.hasMeasEcho && valuesarr}
            </View>
          </View>
          <View style={styles.upNextView}>
            <Text style={styles.upNextText}>Up Next: {this.state.nextMeasNameEcho}</Text>
          </View>
          <View
            style={{
              flexDirection: "column",
              height: 75,
              alignItems: "center",
              justifyContent: "space-around",
              paddingBottom: 2,
              paddingTop: 6,
              backgroundColor: EStyleSheet.value('$cardColor'),
              opacity: 0.8,
              borderTopWidth: 0,
              // borderTopRightRadius: 10,
              // borderTopLeftRadius: 10,
              borderRadius: 8,
              //borderTopColor: "darkgray"
            }}
          >
            <View style={{ borderRadius: 5, width: 10, height: 10, backgroundColor: this.props.statusColor}}></View>
            <Text style={styles.footerText}>
              Active Plan: {this.state.planNameEcho} ({this.state.planIDEcho})
                </Text>
            <Text style={styles.footerText}>
              Objects in Plan: {this.state.objectsInPlanEcho} | Run
                    State:{this.state.runStateEcho}
            </Text>
          </View>
        </React.Fragment>
      </TouchableHighlight>
    );
  };
}
AutoScreen.navigationOptions = {
  header: null
};



//You can remove whichever of these states you don't need.
//I suspect a performance decrease if you import all of these,
//as anytime anyone of them is called in settings,
//this component will incur a re-render.
function mapStateToProps(state) {
  return {
    user: state.user,
    dark_mode: state.dark_mode,
    decimal_places: state.decimal_places,
    auto_response_time: state.auto_response_time,
    plan_number: state.plan_number,
    device_number: state.device_number,
    IPAddress: state.IPAddress,
    port: state.port,
    statusColor: state.statusColor,
    APICompatible: state.APICompatible,
    single_or_average: state.single_or_average
  }
};

function mapDispatchToProps(dispatch){
  return{
    change_value_only: (value, name) => dispatch({type: 'CHANGE_VALUE', value, name})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(AutoScreen));

//You can add global styles here for light/dark theme
//See >src>theme>dark/light
//To add global to your css:
//Just replace your color ie. '#333333' to
//'$textColor' or whatever property in theme.
const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$bgColor',
    alignContent: "flex-end",
    flexDirection: "column"
  },
  tableView: {
    flex: 1,
    borderWidth: 0,
    //borderColor: "darkgray",
    backgroundColor: "$cardColor",
    borderRadius: 12,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: "row",
    flexShrink: 1,
  },
  droLeftBox: {
    justifyContent: "space-around",
    flexDirection: "column",
    width: 190,
    alignItems: "flex-start",
    borderWidth: 0,
    borderColor: "$textColor",
    paddingTop: 20,
    paddingLeft: 5,
    flexShrink: 1,
  },
  droRightBox: {
    flex: 1,
    justifyContent: "space-around",
    flexDirection: "column",
    borderWidth: 0,
    borderColor: "$textColor",
    alignItems: "flex-end",
    paddingRight: 5,
    paddingTop: 20
  },
  droText: {
    color: "$textColor",
    fontSize: RFPercentage(4.1),
    fontVariant: ["tabular-nums"],
    justifyContent: "space-around"
    //paddingLeft: 10,
  },
  upNextView: {
    height: RFValue(55),
    borderWidth: 0,
    borderColor: "$textColor",
  },
  upNextText: {
    color: "$textColor",
    fontSize: RFValue(19),
    paddingLeft: RFValue(10),
  },
  justMeasuredView: {
    height: RFValue(55),
    marginBottom: 18,
    borderColor: "$textColor",
    paddingTop: RFValue(10),
  },
  justMeasuredText: {
    color: "$textColor",
    fontSize: RFValue(40),
    paddingLeft: RFValue(10),
  },
  loaderText: {
    alignItems: 'center',
    color: "$textColor",
    fontSize: RFValue(16)
  },

  footerText: {
    fontSize: RFValue(12),
    color: "$textColor"
  },
  footerTitle: {
    fontSize: RFValue(16),
    color: "$textColor",
    paddingBottom: RFValue(7)
  },
  MainContainer: {
    flex: 1,
    margin: RFValue(10)
  },

  TextStyle: {
    fontSize: RFValue(25),
    textAlign: "center"
  },

  title: {
    fontSize: RFValue(24)
  },

});


Reports 

import React from "react";
import {
  ScrollView,
  View,
  Text,
  Animated,
  RefreshControl,
  Keyboard,
  Alert,
  Dimensions
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from "@react-native-picker/picker";
import EStyleSheet from 'react-native-extended-stylesheet';
import Accordion from 'react-native-collapsible/Accordion';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from '@expo/vector-icons';
import { Input } from 'react-native-elements';
import {connect} from 'react-redux';
import { withNavigationFocus } from 'react-navigation';

//data for all sections
var SECTIONS = [];
//data from sections that were removed during search queries
var deleted = [];

//If the picker only has one object, it calls it's own onChangeValue function with index 0,
//This will trigger a refresh event. The did load variable handles this situation
//to prevent unecessary loading. This greatly helps with large plans,
//as loading time would be DOUBLED. DO NOT DELETE OR TAMPER WITH THIS VARIABLE
var did_load = 0;

const windowWidth = Dimensions.get('window').width;

class DroScreen extends React.Component {

  static navigationOptions = () => ({
    header:
      null,
  })

  constructor(props) {
    super(props);

    //React.createRef so we may manipulate the search form text boxes.
    this.searchForm = React.createRef();
    //Helper variable for plan organizing
    this.currentPlan = undefined;

    //Helper variable to check if its safe to run state updates in the background.
    //This is helpful in the case where a user wants to scan a QR code to load in a new project.
    //This triggers reports to load in the data, but if reports hasn't been visited yet or "mounted",
    //It causes a memory leak.
    this._isMounted = false;

    //Initializes the websocket as long as we are not in preview mode.
    //Remember: preview mode is accessed when IP is left blank on sign in.
    if(this.props.IPAddress != ''){
      this.ws = new WebSocket("ws://" + this.props.IPAddress + ":"+ this.props.port);
    }

    //listens to screen rotations and sets width accordingly.
    Dimensions.addEventListener('change', () => {
      this.setState({
        device_width: Dimensions.get('window').width
      });
    });

    this.state={
      activeSections: [],
      decimal_places: undefined,
      headers: [],
      animValue: [],
      refreshing: false,
      search: '',
      plan_number: undefined,
      plan_name: '',
      num_of_objects: 0,
      device_width: Dimensions.get('window').width,
      device_height: Dimensions.get('window').height,
      totalPlans: 0,
      all_plans: [],
    }
  }

  //clears all data for refresh and remount events
  CLEAR_DATA = () => {
    did_load = 0;
    SECTIONS = [];
    deleted = [];
    this.state.all_plans = [];
    this.setState({activeSections: [], headers: [], animValue: [], search: '', plan_number: undefined})
  }

  componentDidUpdate(prevProps){

    if(this.props.IPAddress === ''){
      return;
    }

    //if the screen is now focused, soft reset-> did_load var helps with
    //react native bug regarding picker components.
    if(prevProps.isFocused == false && this.props.isFocused== true){

    }
  }


  UNSAFE_componentWillReceiveProps(prevProps){
    
    //Handles when preferences are changed,
    //Will close all sections, and flip all accordion icons
    //Important** when accordions are expanded and we receive props,
    //coming back to this component will result in unopened accordions,
    //with incorrectly flipped accordion icons.
    if(this.props.decimal_places != prevProps.decimal_places || this.props.dark_mode != prevProps.dark_mode){
      for(x in this.state.activeSections){
        this.handleSelect(this.state.activeSections[x])
        this.setState({activeSections: []})
      }
    }

    //Refreshes the component in events where a QR code was scanned to load a new plan.
    if(this.props.new_plan_loaded == true && this._isMounted == true){
      this.onRefresh();
      this.props.change_value_only(false, 'new_plan_loaded')
    }
  }


  componentWillUnmount(){
    did_load = 0;
    this.ws.close();
  }

  componentDidMount(){
    this._isMounted = true;
    if(this.props.IPAddress === ''){
      return;
    }
    did_load=0;
    this._GetData();
  }

  _GetData(q){

    //this will ensure refresh events run properly
    if(this.state.refreshing === false){
      SECTIONS = []
      this.setState({refreshing: true})
      this.ws = new WebSocket("ws://" + this.props.IPAddress + ":"+ this.props.port);
    }

    this.ws.onopen = () => {
      this.props.change_value_only('#1fcc4d', 'statusColor')
      //logic to handle unecessary web socket communications
      if(q != undefined){
        this.ws.send("<Inspect_Plan_Load id=\"" + q + "\" />")
      }
      if(this.state.all_plans.length === 0){
      this.ws.send('<Inspect_Plan_List />');
      }
      this.ws.send("<inspect_plan_info />");
    }

    this.ws.onmessage = ({data}) => {

      if(data.includes("acknowledgement")){

        return;
      }

      if(data.includes("inspect_plan_info")){
        var xmlResult = this._xmlParse(data)
        
        //if the plan is empty, return
        if(xmlResult['response']['success']['data']['inspect_plan_info'] == ''){
          return;
        }

        var currentPlanName = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['Object Name:'])
        //get plan index
        if(this.state.plan_number === undefined){
          this.currentPlan = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['attr']['id'])
          //get and set the plan_number required for the picker component.
          this.setState({ plan_number: this.currentPlan, plan_name: currentPlanName })
        }
        else{
          this.setState({plan_name: currentPlanName})
        }

        //get objects in current plan
        objsInPlan = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['plan_object'])
        var num_of_objects = 0;
        //if no objects in plan, stop refreshing and return
        if(objsInPlan === undefined){
          this.setState({refreshing: false})
          return;
        }
        //if multiple objects are in the plan...
        else if(Array.isArray(objsInPlan)){ 
          for(var key in objsInPlan){
            num_of_objects += 1;
            let planName = objsInPlan[key]['Object Name:']
            SECTIONS.push(
              {title: planName,
                content:{
              }});
              //append an animated value for each accordion icon
              var joined = this.state.animValue.concat(new Animated.Value(250));
              this.setState({animValue: joined, refreshing: false})
          }
        }
        //if only one object in the plan..
        else{
          num_of_objects = 1;
          SECTIONS.push({
            title: objsInPlan['Object Name:'],
              content:{

              }
          });
          //append an animated value for each accordion icon
          var joined = this.state.animValue.concat(new Animated.Value(250));
          this.setState({animValue: joined, refreshing: false})
        }
        this.setState({num_of_objects: num_of_objects})
      }

      //load plans into plan picker
      if(data.includes('inspect_plan_list')){
        var xmlResult = this._xmlParse(data)
        plans = (xmlResult['response']['success']['data']['plans']['plan'])
        //if no plans, return, stop refreshing.
        if(plans === undefined){
          this.setState({refreshing: false})
          return;
        }
        //if multiple plans...
        else if(Array.isArray(plans)){
          this.setState({totalPlans: plans.length})
          for(var key in plans){
            this.state.all_plans.push(
              <Picker.Item label={plans[key]['Object Name:']} value={plans[key]['attr']['id']} key={plans[key]['attr']['id']} />
            )
          }
      }
        //if only one plan...
        else{
          this.setState({totalPlans: 1})
          this.state.all_plans.push(
            <Picker.Item label={plans['Object Name:']} value={plans['attr']['id']} key={plans['attr']['id']} />
          )
        }
      }
      
    }

    //pushes an alert when the websocket connection drops.
    this.ws.onerror = () => {
      this.setState({refreshing: false})
      this.props.change_value_only('red', 'statusColor')
      Alert.alert(
        'Verisurf Connection Lost.',
        'Click retry to attempt to reconnect the app, or click sign out to return to the main screen.',
        [
          {text:'Sign Out', onPress: () =>{
            AsyncStorage.clear();
            this.props.navigation.navigate("Auth");
          }},
          {text: 'retry', onPress: () => {
            this.CLEAR_DATA();
            this._GetData();
          }}
        ]
      )
    }

  }


  //1 of two handlers for icon animation 
  //decides which direction the icon should point
  handleSelect = (i) => {
    this.state.animValue[i]._value > 250
      ? Animated.timing(this.state.animValue[i], {
          toValue: 250,
          duration: 150,
          useNativeDriver: true,
        }).start()       
      :   
      Animated.timing(this.state.animValue[i], {
          toValue: 450,
          duration: 150,
          useNativeDriver: true,
        }).start();

  };

  //2 of 2 handlers for icon animation - > handles the rotation of drop-down-triangles
  rotateAnimation = (i) => {
    return (
      this.state.animValue[2].interpolate({
        inputRange: [250, 450],
        outputRange: ['0deg', '180deg']
      })
    );
  }

  //renders the header
  _renderHeader = section => {

    let i = SECTIONS.indexOf(section)
    //we need this index to properly assign a rotation value.
    //If we completely left that out, clicking on a header would rotate 
    //every single icon. they NEED individual animation values in state.
    //see -> transform:[{rotate: this.state.animValue[i]}] <-- important thing
   
    if(i === 0){
      var headerstyle = styles.headerFirst
    }
    else{
      var headerstyle = styles.header
    }
    
    return (
        <View style={headerstyle}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{section['title']}</Text>
              <Animated.View style={[{marginLeft: 10}, {transform:[{rotate: this.state.animValue[i].interpolate({
                              inputRange: [250, 450],
                              outputRange: ['0deg', '180deg']})}]}]}>
                <Ionicons name="arrow-down-circle" size={20} color={EStyleSheet.value('$textColor')} />
              </Animated.View>
          </View>
        </View>
    );
  };


  //renders the data inside each header 
  _renderContent = section => {

    //array to hold all the view data
    let views = []
    
    //the actual object data ie x values, y values, etc etc..
    properties = section['content']

    //if the object has properites...
    if(Object.keys(properties).length !== 0){
      for(var key in properties){

        let name = key
        let nom = properties[key]['nom']
        let meas = properties[key]['measured']
        let dev = properties[key]['deviation']

        views.push(
          
          <React.Fragment key={name}>
          
            <View style={[styles.data, {width: this.state.device_width/4.5}]}>
              <Text numberOfLines={1} style={styles.category}> {name} </Text> 
            </View>

            <View style={[styles.data, {width: this.state.device_width/4.5}]}>
              <Text numberOfLines={1} style={styles.category}> {parseFloat(nom).toFixed(this.props.decimal_places)} </Text> 
            </View>

            <View style={[styles.data, {width: this.state.device_width/4.5}]}>
              <Text numberOfLines={1} style={styles.category}> {parseFloat(meas).toFixed(this.props.decimal_places)} </Text> 
            </View>

            <View style={[styles.data, {width: this.state.device_width/4.5}]}>
              <Text numberOfLines={1} style={styles.category}> {parseFloat(dev).toFixed(this.props.decimal_places)} </Text> 
            </View>


          </React.Fragment>

        )
      }
    }
  
  
    return (
      <View style={styles.dataContainer}>

        {/* NAME/ID Header */}
        <View style={[styles.data, {width: this.state.device_width/4.5}]}>
          <Text style={styles.category}></Text>
        </View>

        {/* NOMINAL Header */}
        <View style={[styles.data, {width: this.state.device_width/4.5}]}>
          <Text style={styles.category}>Nom.</Text>
        </View>

        {/* MEASURED Header */}
        <View style={[styles.data, {width: this.state.device_width/4.5}]}>
          <Text style={styles.category}>Act.</Text>
        </View>

        {/* DEVIATION Header */}
        <View style={[styles.data, {width: this.state.device_width/4.5}]}>
          <Text style={styles.category}>Dev.</Text>
        </View> 

        {/* Actual Nom/Meas/Dev Data values */}

        { views }

      </View>
    );
  };

  //handles what happens when you click a header.
  _updateSections = activeSections => {

    //this logic handles if a section was opened or not. activeSections is most recent,
    //and this.state.activeSections was the previously recent. 
    if(activeSections.length > this.state.activeSections.length){
      
      //this index variable will be the most RECENTLY clicked header.
      let objectIndex = activeSections[activeSections.length -1]

      //call the handleSelect method to handle animations 
      
      


      //If it already has data, don't query verisurf. Just display.
      if(Object.keys(SECTIONS[objectIndex]['content']).length > 0){
        this.handleSelect(objectIndex)
        this.setState({ activeSections });
        return;
      }
  
      //Ask verisurf for object data.
      this.ws.send('<inspect_object_info id=\"' + objectIndex + '\" />')    
      this.ws.onmessage = ({data}) => {

      if(data.includes('acknowledgement')){
        return
        }
      else if(data.includes('inspect_object_info')){
        var xmlResult = this._xmlParse(data)
        var objVals = (xmlResult['response']['success']['data']['inspect_object_info']['object']['property'])
        // Check if ObjVals is undefined 
        // (Some items return only a name, so grab the name attr)
        if (objVals === undefined){
          objVals = (xmlResult['response']['success']['data']['inspect_object_info']['object']['Object Name:'])
        }
        let section_to_update = SECTIONS[objectIndex]['content']
        

      if(Array.isArray(objVals)){
        for(var item in objVals){
          let attributes = objVals[item]['attr']
          let categories = [attributes['nominal'], attributes['tolmin'], attributes['tolmax'], attributes['measured'], attributes['deviation']]
          //loop to format data.
          for(item in categories){
            if(categories[item] === undefined){
              categories[item] = parseFloat(0).toFixed(this.props.decimal_places);
            }
            else{
              categories[item] = parseFloat(categories[item]).toFixed(this.props.decimal_places);
            }
          }
          
          //Load up mock section with data
          section_to_update[attributes['name']] = 
          {
            'nom': categories[0],
            'tolmin': categories[1],
            'tolmax': categories[2],
            'measured': categories[3],
            'deviation': categories[4],
          }
        }
      }
      else{
        if(objVals != undefined){
          let attributes = objVals['attr']
          let categories = [attributes['nominal'], attributes['tolmin'], attributes['tolmax'], attributes['measured'], attributes['deviation']]
          for(item in categories){
            if(categories[item] === undefined){
              categories[item] = parseFloat(0).toFixed(this.props.decimal_places);
            }
            else{
              categories[item] = parseFloat(categories[item]).toFixed(this.props.decimal_places);
            }
          }

          section_to_update[objVals['attr']['name']] = 
          {
            'nom': categories[0],
            'tolmin': categories[1],
            'tolmax': categories[2],
            'measured': categories[3],
            'deviation': categories[4],
          }

        }
      }

        this.handleSelect(objectIndex)
        //append mock section to global section
        SECTIONS[objectIndex]['content'] = section_to_update
        this.setState({ activeSections });
      }
      }
      this.ws.onerror = () => {
        Alert.alert(
          'Verisurf Connection Lost.',
          'Click retry to attempt to reconnect the app, or click sign out to return to the main screen.',
          [
            {text:'Sign Out', onPress: () =>{
              AsyncStorage.clear();
              this.props.navigation.navigate("Auth");
            }},
            {text: 'retry', onPress: () => {
              this.CLEAR_DATA();
              this._GetData();
            }}
          ]
        )
      }
      return;
    
    }
    let closeIndex = this.state.activeSections[this.state.activeSections.length -1]
    //This finds the difference between the two arrays to decide which icon needs to be flipped
    //in the animation. activeSections = current, this.state.activeSections = previous. 
    for(i =0; i < activeSections.length; ++i){
      if(activeSections[i] != this.state.activeSections[i]){
          closeIndex = this.state.activeSections[i]
          break;
      }
    }

    this.handleSelect(closeIndex)
    this.setState({ activeSections });
  };

  componentWillUnmount(){
      deleted = []
      SECTIONS=[]
  }

  _xmlParse(data) {
    var options = {
      attributeNamePrefix: "",
      attrNodeName: "attr", //default is 'false'
      textNodeName: "Object Name:",
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      cdataTagName: "__cdata", //default is 'false'
      cdataPositionChar: "\\c",
      localeRange: "", //To support non english character in tag/attribute values.
      parseTrueNumberOnly: true,
      attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),//default is a=>a
      tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
      stopNodes: ["parse-me-as-string"]
    }
    var parser = require('fast-xml-parser');
    var he = require('he');
    var res = parser.parse(data, options);
    return res;
  }

  //handles the drag-down refresh event.
  //clears all data, and prepares a clean screen.
  onRefresh = (q) => {
    this.setState({refreshing: true})
    this.CLEAR_DATA();
    if(this.state.search.length > 0){
      Keyboard.dismiss()
      const node = this.searchForm.current;
      node.clear();
    }
 
      this._GetData(q);

  }

  //Search bar function
  searchSection = (text) => {
    text = text.toLowerCase()
    if(text.length > this.state.search.length){
      for(var i in SECTIONS){
        if(!SECTIONS[i]['title'].toLowerCase().startsWith(text)){
          deleted.push(SECTIONS[i])
          deleted[deleted.length-1]['index'] = i;
          delete SECTIONS[i]
        }
      }
    }
    else{
      if(text === ''){
        for(var i in deleted){
          //put the deleted data back into its proper index.
          SECTIONS.splice(deleted[i]['index'], 0, deleted[i])
        }
        //clear data, as the search bar is empty.
        deleted = []
      }
      for(var i in deleted){
        if(deleted[i]['title'].toLowerCase().startsWith(text)){
          //put the deleted data back into its proper index
          SECTIONS.splice(deleted[i]['index'], 0, deleted[i])
          //delete the entry we spliced.
          delete deleted[i]
        }
      }
      
    }
    //handle nullities 
    var filtered = SECTIONS.filter(function (el) {
      return el != null;
    });
    SECTIONS = filtered;
    //set state twice because it doesn't work otherwise.
    this.setState(this.activeSections)
    this.setState(this.activeSections)
  }

  scrollToEnd = () => {
    this.scrollView.scrollToEnd();
  }

  render(){

   return(
    <View style={{backgroundColor: EStyleSheet.value('$bgColor'), flex: 1}}>

      <View style={{backgroundColor: EStyleSheet.value('$bgColor'), paddingBottom: RFValue(10)}}>

      <Input
        ref={this.searchForm}
        inputStyle={styles.searchForm}
        containerStyle={{paddingTop: RFPercentage(5)}}
        inputContainerStyle={styles.searchContainer}
        clearButtonMode="while-editing"
        underlineColorAndroid="transparent"
        placeholder={'Search...'}
        placeholderTextColor={EStyleSheet.value('$textColor')}
        onChangeText={ (text) => {
          this.searchSection(text);
          this.setState({ search: text });
        }}
        value={this.state.search}
        borderBottomWidth={1} />
    </View>
    <View key={ this.props.dark_mode } style={{margin: 0, backgroundColor: EStyleSheet.value('$cardColor'), borderWidth: 1, borderRadius:5, borderBottomWidth: 1, alignItems: 'stretch', borderColor: '$bgColor'}}>
        <Picker
          selectedValue={this.state.plan_number}
          itemStyle={styles.pickerItem2}
          style={{ color: EStyleSheet.value('$textColor'), borderWidth: 0, height: RFValue(50), backgroundColor: '$bgColor' }}
          onValueChange={(itemValue) => {

            console.log(itemValue)
            console.log(did_load)

            if(did_load == 0 && this.state.plan_number == 0){
              did_load += 1;
              return;
            }
            this.setState({plan_number: itemValue, activeSections: [], animValue: []})
            this._GetData(itemValue);
          }
          }>
            {this.state.all_plans}
        </Picker>
      </View>
     <ScrollView style={styles.scrollContainer}  refreshControl={
      <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} progressViewOffset={100} />}
      ref={(scrollView) => { this.scrollView = scrollView }}>
        <Accordion
          expandMultiple={true}
          sections={SECTIONS}
          activeSections={this.state.activeSections}
          renderHeader={this._renderHeader}
          renderContent={this._renderContent}
          onChange={this._updateSections}
          containerStyle={styles.accordionContainer}
          sectionContainerStyle={styles.accordionSection}
          underlayColor={EStyleSheet.value('$bgColor')}
        />
      </ScrollView>
      <View
            style={{
              flexDirection: "column",
              height: 75,
              alignItems: "center",
              justifyContent: "space-around",
              paddingBottom: 2,
              paddingTop: 6,
              backgroundColor: EStyleSheet.value('$cardColor'),
              opacity: 0.8,
              borderTopWidth: 0,
              // borderTopRightRadius: 10,
              // borderTopLeftRadius: 10,
              borderRadius: 8,
              //borderTopColor: "darkgray"
            }}
          >
            <View style={{ borderRadius: 5, width: 10, height: 10, backgroundColor: this.props.statusColor}}></View>
              <Text style={styles.footerText}>
                Active Plan: {this.state.plan_name}
              </Text>
              <Text style={styles.footerText}>
                Objects in Plan: {this.state.num_of_objects}  |  Total Plans: {this.state.totalPlans}
              </Text>
          </View>
    </View>
    
    
    );
  };
}

//redux state
function mapStateToProps(state){
  return{
    dark_mode: state.dark_mode,
    decimal_places: state.decimal_places,
    plan_number: state.plan_number,
    IPAddress: state.IPAddress,
    port: state.port,
    statusColor: state.statusColor,
    new_plan_loaded: state.new_plan_loaded
  }
}

function mapDispatchToProps(dispatch){
  return{
    change_value_only: (value, name) => dispatch({type: 'CHANGE_VALUE', value, name})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(DroScreen));


const styles = EStyleSheet.create({
  scrollContainer:{
    backgroundColor: '$bgColor',
  },
  accordionContainer: {
    backgroundColor: '$bgColor',
  },
  dataContainer: {
    flex:1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  data:{
    fontVariant: ["tabular-nums"],
    color: '$textColor',
    margin: RFValue(3),
    height: RFPercentage(5),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  category:{
    color: '$textColor',
    fontSize: RFValue(15),
  },
  headerText:{
    color: '$textColor',
    fontSize: RFValue(24),
    textAlign: 'center',
 },
  header: { 
    flex: 1,
    flexDirection: 'row',
    marginTop: RFValue(25),
    borderTopWidth: .3,
    borderColor: '$textColor',
  },
  headerFirst: { 
    flex: 1,
    flexDirection: 'row',
    marginTop: RFValue(25),
  },

  headerTextContainer: { 
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: RFValue(20),

  },

  searchForm: {
    borderWidth: 1,
    borderColor: '$textColor',
    fontSize: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 3,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 1,
    color: '$textColor',
    borderRadius: 20,

  },
  searchContainer: {
    color: '$bgColor',
    borderWidth: 0,
    borderColor: '$bgColor',
    borderBottomWidth: 0
  },
  searchContainerColor: {
    color: '$bgColor',

  },
  pickerItem2: {
    color: '$textColor',
    height: RFValue(55),
    fontSize: 22,
    alignContent: "center",
    flexDirection: "column"
  },
  footerText: {
    fontSize: RFValue(12),
    color: "$textColor"
  },
  footerTitle: {
    fontSize: RFValue(16),
    color: "$textColor",
    paddingBottom: RFValue(7)
  },
});