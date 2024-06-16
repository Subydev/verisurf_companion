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
