import React from "react";
import ProgressBar from "react-native-progress/Bar";
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
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ScreenOrientation } from 'expo';
longPressed = 0;


class BuildScreen extends React.Component {
  constructor(props) {
    super(props);

    this._isMounted = false;
    if(this.props.IPAddress != ''){
      this.ws = new WebSocket("ws://" + this.props.IPAddress + ":" + this.props.port);
    }
    else{
      this.ws = new WebSocket("ws://localhost:"+this.props.port)
    }
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
      negTol: "0.001",
      negProgColor: '#1fcc4d',
      isLandscape: false,
    };

    this.state = {
      underlayColor: EStyleSheet.value('$bgColor'),
      disconnected: true,
    };
  }
  onPress = () => {

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send('<measure_set_' + this.props.single_or_average + ' />')
      this.ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10])
    }
  };

  onPressOut = val => {
    if (longPressed === 1) {
      this.ws.send("<measure_trigger />");
      longPressed = 0;
    }
  };

  onLongPress=()=> {
    this.ws.send("<measure_set_cloud />");
    this.ws.send("<measure_trigger />");
    Vibration.vibrate([0, 50])
    longPressed = 1;
  }


  //Handles the disconnection event and changes the underlay color
  //to indicate to the user we are unconnected.
  UNSAFE_componentWillReceiveProps(){
    if(this.props.IPAddress === ''){
      return;
    }
  }


  componentDidUpdate(prevProps){

    if(this.props.IPAddress === '' && this.props.isFocused && this.state.underlayColor != EStyleSheet.value('$bgColor')){
      this.setState({underlayColor: EStyleSheet.value('$bgColor')})
      return;
    }
    else if(this.props.IPAddress == '' && this.props.isFocused){
      ScreenOrientation.unlockAsync()
      return;
    }

    else if(prevProps.isFocused === false && this.props.isFocused === true){
      this.ws = new WebSocket("ws://" + this.props.IPAddress + ":" + this.props.port);
      ScreenOrientation.unlockAsync()
      this.setState({disconnected: false, underlayColor: 'red'})
      this.beginStream();
    }

    if(this.props.isFocused === false && this.ws != undefined){
      ScreenOrientation.lockAsync(ScreenOrientation.Orientation.PORTRAIT_UP)
      this.ws.close();
    }

    if(this.props.statusColor =='red' && this.state.underlayColor != EStyleSheet.value('$bgColor')){

      this.setState({underlayColor: EStyleSheet.value('$bgColor')})
    }

  }
  componentDidMount() {
    ScreenOrientation.unlockAsync()
    ScreenOrientation.getOrientationAsync().then(resolve => {
      var ori = resolve.orientation
      if(ori != "PORTRAIT_UP" || ori != "PORTRAIT_DOWN"){
        this.setState({isLandscape: false})
      }

    }, reject => console.log(reject))
    ScreenOrientation.addOrientationChangeListener(this._orientationListener)

    if(this.props.buildTutorial === false){
        Alert.alert(
          'Check Tolerance!',
          'The build tolerance set in the Verisurf Desktop App is different than the tolerance set in the Mobile App.\n\nPlease navigate to settings and ensure you have your desired build tolerance set.',
            [
              {text: 'Ok'}
            ]
        )
        this.props.change_value_only(true, 'buildTutorial');
      }

      if(this.props.IPAddress === ''){
        
        return;
      }
    
    this.beginStream();
  }

  _orientationListener = orientation => {
    var ori = orientation.orientationInfo.orientation
    if(ori == "LANDSCAPE_LEFT" || ori == "LANDSCAPE_RIGHT" || ori == "LANDSCAPE"){
      this.setState({isLandscape: true})
    }
    else{
      this.setState({isLandscape: false})
    }
  }

  beginStream = () => {
    this._isMounted = true;

      this.ws.onopen = () => {
        this.setState({underlayColor: 'red', disconnected: false})
        this.ws.send("<build />");
        this.ws.send('<device_info id="' + this.props.device_number + '" />');
      }

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
              var xdColor = (xdVal > this.props.build_tol) ? this.props.oot_pos_color:this.props.in_tolerance_color
              if(xdColor != this.props.oot_pos_color){
                xdColor = (xdVal < -(this.props.build_tol)) ? this.props.oot_neg_color:this.props.in_tolerance_color
              }
            }
            if (ydRaw != null) {
              var ydVal = parseFloat(ydRaw).toFixed(this.props.decimal_places);
              var ydColor =( ydVal > this.props.build_tol ) ? this.props.oot_pos_color:this.props.in_tolerance_color
              if(ydColor != this.props.oot_pos_color){
                ydColor = (ydVal < -(this.props.build_tol)) ? this.props.oot_neg_color:this.props.in_tolerance_color
              }
            }
            if (zdRaw != null) {
              var zdVal = parseFloat(zdRaw).toFixed(this.props.decimal_places);
              var zdColor = (zdVal > this.props.build_tol) ?  this.props.oot_pos_color:this.props.in_tolerance_color
              if(zdColor != this.props.oot_pos_color){
                zdColor = (zdVal < -(this.props.build_tol)) ? this.props.oot_neg_color:this.props.in_tolerance_color
              }
            }
            if (d3Raw != null) {
              var d3Val = parseFloat(d3Raw).toFixed(this.props.decimal_places);
              var d3Color = (d3Val > this.props.build_tol) ? this.props.oot_pos_color:this.props.in_tolerance_color
              if(d3Color != this.props.oot_pos_color){
                d3Color = (d3Val < -(this.props.build_tol)) ? this.props.oot_neg_color:this.props.in_tolerance_color
              }

              bBarVal = parseFloat((d3Val / this.props.build_tol).toFixed(this.props.decimal_places));
              if(bBarVal > 0){
                if (bBarVal > 1 && bBarVal != null) {
                  var progColor = this.props.oot_pos_color;
                } else {
                  var progColor = this.props.in_tolerance_color;
                }
                var negProgVal = 0;
              }
              else{
                if(bBarVal < -1 && bBarVal != null){
                  var negProg = this.props.oot_neg_color;
                }
                else{
                  var negProg = this.props.in_tolerance_color;;
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

            this._isMounted && this.setState({
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
              negTol: negProgVal
            });

            setTimeout(() => {
              if(this.props.isFocused === false){
                this.ws.close();
                return;
                }
              this.ws.send('<device_info id="' + this.props.device_number + '" />');
            }, this.props.response_time);
          } else {
            //this.ws.send('<device_info id="' + this.props.device_number + '" />');
          }
        }
      }
  };

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
        style={[
          styles.container,
          { backgroundColor: EStyleSheet.value('$bgColor') }
        ]}
      >
        <React.Fragment>
          <View
            style={{
              flexDirection: "column",
              height: 120,
              borderColor: EStyleSheet.value('$textColor'),
              borderWidth: 0,
              alignItems: "center",
              justifyContent: "space-around",
              paddingTop: 19
            }}
          >
            <Text style={styles.footerTitle}>
              Tap - Single | Hold - Continuous
            </Text>
          </View>
          <View style={{flexDirection: 'row'}}>
          <View style={{flex: 1, transform:[{rotateY: '180deg'}]}}>
          <ProgressBar.Bar
            progress={this.state.negTol}
            useNativeDriver={true}
            borderRadius={0}
            width={null}
            height={32}
            color={this.state.negProgColor}
            borderWidth={0}
            bounciness={10}
          />
          </View>
          <View style={{flex: 1}}>
          <ProgressBar.Bar
            progress={this.state.bBarEcho}
            useNativeDriver={true}
            width={null}
            borderRadius={0}
            height={32}
            color={this.state.progressColor}
            borderWidth={0}
            bounciness={10}
          />
          </View>
          </View>
          <ActivityIndicator size="small" color="#00ff00" animating={this.props.statusColor == 'red' ? (this.props.IPAddress == '' ? false:true):false}/>
          <View style={{ flexDirection: "row", flex: 1, alignItems: this.state.isLandscape? "center":null, 
                          justifyContent: this.state.isLandscape? "center":null }}>
          
          {!this.state.isLandscape && 
            <View style={styles.droLeftBox}>
             <Text adjustsFontSizeToFit={true} style={styles.droText}>DX:</Text> 
             <Text adjustsFontSizeToFit={true} style={styles.droText}>DY:</Text> 
               <Text adjustsFontSizeToFit={true} style={styles.droText}>DZ:</Text> 
              <Text adjustsFontSizeToFit={true} style={{ color: EStyleSheet.value('$textColor'), fontSize: RFValue(60), justifyContent: "space-around" }}>3D:</Text>
            </View>
          }

          <View style={[styles.droRightBox, 
            {justifyContent: this.state.isLandscape ? "center" : "space-around", 
            alignItems: this.state.isLandscape ? "center" : "flex-end"}]}>

            {!this.state.isLandscape && 
              <Text
                numberOfLines={1}
                style={{
                  fontVariant: ["tabular-nums"],
                  fontSize: RFValue(60),
                  color: this.state.xdColor,
                
                }}
              >
                {this.state.xdEcho}
              </Text>
            }
            
            {!this.state.isLandscape && 
              <Text
                numberOfLines={1}
                style={{
                  
                  fontVariant: ["tabular-nums"],
                  fontSize: RFValue(60),
                  color: this.state.ydColor,
                }}
              >
                {this.state.ydEcho}
              </Text>
            }

            {!this.state.isLandscape && 
              <Text
                numberOfLines={1}
                style={{
                  fontVariant: ["tabular-nums"],
                  fontSize: RFValue(60),
                  color: this.state.zdColor,
                }}
              >
                {this.state.zdEcho}
              </Text>
            }
            
              <Text
                numberOfLines={1}
                style={{
                  fontVariant: ["tabular-nums"],
                  fontSize: this.state.isLandscape ? RFValue(145):RFValue(60),
                  color: this.state.ootEcho,
                  textAlign: this.state.isLandscape ? 'center' : null,
                }}
              >
                {this.state.d3Echo}
              </Text>
            </View>
          </View>
          {!this.state.isLandscape &&
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
          
            <View style={{ borderRadius: 5, width: 10, height: 10, backgroundColor: this.props.statusColor }}></View>
            <Text style={styles.footerText}>
              Connected To: {this.state.dNameEcho} ({this.state.dInfoEcho})
            </Text>
            <Text style={styles.footerText}>
              Probe Radius: {this.state.dRadiusEcho} | Temperature:{" "}
              {this.state.dTempEcho}
            </Text>
          </View>
          }
        </React.Fragment>
      </TouchableHighlight>
    );
  }
}

BuildScreen.navigationOptions = {
  header: null
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
  }
};
function mapDispatchToProps(dispatch){
  return{
    change_value_only: (value, name) => dispatch({type: 'CHANGE_VALUE', value, name})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(BuildScreen));

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$cardColor"
  },
  instructions: {
    color: "$textColor"
  },
  paragraph: {
    color: "$textColor"
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
    paddingLeft: RFValue(5)
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
    color: "$textColor"
  },
  footerTitle: {
    fontSize: RFValue(16),
    color: "$textColor",
    paddingBottom: RFValue(7)
  },
});

BuildScreen.navigationOptions = {
  header: null
};
