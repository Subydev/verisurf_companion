import React, { useState, useCallback, useEffect } from "react";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useFocusEffect } from "@react-navigation/native";
import EStyleSheet from 'react-native-extended-stylesheet';

import { connect } from "react-redux";
import {
  Text,
  View,
  TouchableHighlight,
  Vibration,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTabBarHeight } from "../components/useTabBarHeight";
import CustomStatusBar from "../components/CustomStatusBar.js";

let propsInObj = 0;
let objNames = [];
let objValues = [];
import reportData from "../constants/reportData.json";

let longPressed = 0;

const AutoScreen = (props) => {
  const insets = useSafeAreaInsets();

  const [isMounted, setIsMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ws, setWs] = useState(null);
  const [state, setState] = useState({
    planNameEcho: "",
    runStateEcho: 0,
    planIDEcho: 0,
    objectsInPlanEcho: 0,
    currMeasNameEcho: "",
    nextMeasNameEcho: "",
    measDataState: {},
    hasMeasEcho: "",
    responsiveText: RFPercentage(4.1),
    // backgroundColor: EStyleSheet.value("$bgColor"),
    underlayColor: EStyleSheet.value("$bgColor"),
    disconnected: true,
    objNames: [],
    objValues: [],
  });

  const onPress = () => {
    setState(prevState => ({
      ...prevState,
      underlayColor: "red"
    }));
    if (isMounted && ws.readyState === WebSocket.OPEN) {
      ws.send(`<measure_set_${props.single_or_average} />`);
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10]);
    }
    longPressed = 0;
console.log(state.underlayColor);  };

  const onLongPress = () => {
    state.underlayColor= "red";

    if (isMounted) {
      ws.send("<inspect_plan_start id='0' />");
    }
    longPressed = 1;

  };

  const onPressOut = () => {
    state.underlayColor= "red";

    if (longPressed === 1 && ws) {
      ws.send("<measure_trigger />");
    }
    longPressed = 0;
    console.log("onPressOut");

  };

  useEffect(() => {
    // Update the state when props.decimal_places changes
    setState((prevState) => ({
      ...prevState,
      objValues: prevState.objValues.map((value) =>
        parseFloat(value).toFixed(props.decimal_places)
      ),
    }));
  }, [props.decimal_places, props.single_or_average]);

  useFocusEffect(
    useCallback(() => {
      if (props.IPAddress === "") {
        const simulatorData = reportData.inspect_object_info.object.find(
          (obj) => obj.name === "Circle1"
        );
        if (simulatorData) {
          const properties = simulatorData.properties.map((prop) => ({
            name: prop.name,
            deviation: prop.deviation !== undefined ? prop.deviation : 0,
          }));
          _renderObjInfo(properties);
        }
        setState((prevState) => ({
          ...prevState,
          underlayColor: EStyleSheet.value("$bgColor"),
        }));
        setIsMounted(false);
        return;
      }

      const newWs = new WebSocket(
        `ws://${props.IPAddress}:${props.port}`
      );
      setWs(newWs);
      beginStream(newWs);

      return () => {
        setLoaded(false);
        if (newWs !== undefined) {
          newWs.close();
        }
      };
    }, [props.IPAddress, props.port])
  );

  const beginStream = (newWs) => {
    setIsMounted(true);

    newWs.onopen = () => {
      props.change_value_only("#1fcc4d", "statusColor");
      newWs.send(`<inspect_plan_start id="${props.plan_number}" />`);
    };

    newWs.onmessage = ({ data }) => {
      if (data.includes("inspect_plan_start")) {
        const res = _xmlParse(data);
        const planName = res["inspect_plan_start"]["attr"]["name"];
        const planID = res["inspect_plan_start"]["attr"]["id"];
        const objectsInPlan =
          res["inspect_plan_start"]["attr"]["objects_in_plan"];
        const runState = res["inspect_plan_start"]["attr"]["run_state"];
        setState((prevState) => ({
          ...prevState,
          planNameEcho: planName,
          planIDEcho: planID,
          objectsInPlanEcho: objectsInPlan,
          runStateEcho: runState,
        }));
      }

      if (data.includes("inspect_plan_measure")) {
        const res = _xmlParse(data);
        const currMeasName =
          res["inspect_plan_measure"]["attr"]["current_name"];
        const nextMeasName =
          res["inspect_plan_measure"]["attr"]["next_name"];
        const vals = res["inspect_plan_measure"]["Object"];
        setState((prevState) => ({
          ...prevState,
          currMeasNameEcho: currMeasName,
          nextMeasNameEcho: nextMeasName,
          hasMeasEcho: true,
        }));
        _renderObjInfo(vals);
      }

      if (data.includes("inspect_plan_finish")) {
        setState((prevState) => ({
          ...prevState,
          currMeasNameEcho: "Plan Finished",
          nextMeasNameEcho: "Plan Finished",
          hasMeasEcho: false,
        }));
      }
    };
  };

  const _renderObjInfo = (vals) => {
    propsInObj = vals.length;
    const propsArr = [];
    for (let i = 0; i < propsInObj; i++) {
      const name = vals[i]["attr"] ? vals[i]["attr"]["name"] : vals[i].name;
      const deviation =
        vals[i]["attr"] && vals[i]["attr"]["deviation"] !== undefined
          ? parseFloat(vals[i]["attr"]["deviation"]).toFixed(props.decimal_places)
          : vals[i].deviation !== undefined
          ? vals[i].deviation.toFixed(props.decimal_places)
          : parseFloat(0).toFixed(props.decimal_places);
  
      const objArr = { [name]: deviation };
      propsArr.push(objArr);
    }
    const obj = Object.assign({}, ...propsArr);
    const objNames = Object.keys(obj);
    const objValues = Object.values(obj);
  
    setState((prevState) => ({
      ...prevState,
      objNames,
      objValues,
      responsiveText:
        propsInObj > 10 && prevState.responsiveText === RFPercentage(4.1)
          ? RFPercentage(propsInObj / 5)
          : propsInObj < 11 && prevState.responsiveText !== RFPercentage(4.1)
          ? RFPercentage(4.1)
          : prevState.responsiveText,
    }));
  };

  const _xmlParse = (d) => {
    const options = {
      attributeNamePrefix: "",
      attrNodeName: "attr",
      textNodeName: "Object Name:",
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      cdataTagName: "__cdata",
      cdataPositionChar: "\\c",
      localeRange: "",
      parseTrueNumberOnly: true,
      attrValueProcessor: (val, attrName) =>
        he.decode(val, { isAttributeValue: true }),
      tagValueProcessor: (val, tagName) => he.decode(val),
      stopNodes: ["parse-me-as-string"],
    };

    const parser = require("fast-xml-parser");
    const he = require("he");
    const res = parser.parse(d, options);
    return res;
  };

  const namesArr = state.objNames.map((name, i) => (
    <Text
      key={i}
      numberOfLines={1}
      style={[styles.droText, { fontSize: state.responsiveText }]}
    >
      {props.IPAddress === "" ? name + ":" : name + ":"}
    </Text>
  ));

  const valuesArr = state.objValues.map((value, i) => (
    <Text key={i} style={[styles.droText, { fontSize: state.responsiveText }]}>
      {props.IPAddress === "" ? state.objValues[i] : value}
    </Text>
  ));
  
  return (
    <View style={styles.container}>
    <View
      style={[
        styles.contentContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom + 80 },
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

        <View style={styles.justMeasuredView}>
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
          <Text style={styles.justMeasuredText}>
          {props.IPAddress === "" ? `Circle1` :  `${state.currMeasNameEcho}`}
            
          </Text>
        </View>

        <View style={styles.tableView}>
        <View style={styles.droLeftBox}>
    {props.IPAddress === "" ? namesArr : state.hasMeasEcho && namesArr}
  </View>
  <View style={styles.droRightBox}>
    {props.IPAddress === "" ? valuesArr : state.hasMeasEcho && valuesArr}
  </View>
        </View>

        <View style={styles.upNextView}>
          <Text style={styles.upNextText}>
            Up Next: {props.IPAddress === "" ? 'Circle2' :  `${state.nextMeasNameEcho}`}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "column",
            height: 75,
            alignItems: "center",
            justifyContent: "space-around",
            paddingBottom: 2,
            paddingTop: 6,
            position: "relative",
            backgroundColor: EStyleSheet.value("$cardColor"),
            // backgroundColor: "pink",
            marginBottom:RFValue(-19),
            opacity: .8,
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
              Active Plan: {props.IPAddress === "" ? `CMM Master Plan_1  PlanID: 1` : `${state.planNameEcho} (${state.planIDEcho})`}
            </Text>
          <Text style={styles.footerText}>
          Objects in Plan: {props.IPAddress === "" ? 17 : `${state.objectsInPlanEcho}`} | Run State:{" "}
            {state.runStateEcho}

          </Text>
        </View>
      </React.Fragment>
    </TouchableHighlight>
    </View>
    </View>
    
  );
};

AutoScreen.navigationOptions = {
  header: null,
};

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
    single_or_average: state.single_or_average,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    change_value_only: (value, name) =>
      dispatch({ type: "CHANGE_VALUE", value, name }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AutoScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$bgColor",
    // alignContent: "flex-start",
  },
  text: {
    color: "$textColor",
  },
  contentContainer: {
    flex: 1,
    // backgroundColor: "purple",
    marginBottom: 20, // Add some space for the CustomStatusBar
  },

  justMeasuredView: {
    // height: RFValue(55),
    height: Platform.OS === "ios" ? RFValue(55) : RFValue(50),
// backgroundColor:"pink",
    borderWidth: 0,
    borderColor: "$textColor",
    alignItems: "center",
    justifyContent: "center",
  },
  justMeasuredText: {
    color: "$textColor",
    fontSize: RFPercentage(3.5),
    // backgroundColor:"red",
  },
  footerTitle: {
    color: "$textColor",
    fontSize: RFValue(18),

  },

  headerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: RFValue(0),
    backgroundColor:"yellow",
  },
  tableView: {
    flex: 1,
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
    paddingTop: 20,
  },
  droText: {
    color: "$textColor",
    fontSize: RFPercentage(4.1),
    fontVariant: ["tabular-nums"],
    justifyContent: "space-around",
  },
  upNextView: {
    height: RFValue(55),
    borderWidth: 0,
    borderColor: "$textColor",
    alignItems: "center",
    justifyContent: "center",
  },
  upNextText: {
    color: "$textColor",
    fontSize: RFPercentage(3.5),
  },
  footerText: {
    fontSize: RFValue(12),
    color: "$textColor",
  },
  footerTitle: {
    fontSize: RFValue(18),
    color: "$textColor",
    paddingBottom: RFValue(7),
  },
});