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
