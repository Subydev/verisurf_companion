import React, { useState, useCallback } from "react";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { useFocusEffect } from "@react-navigation/native";
import EStyleSheet from "react-native-extended-stylesheet";
import { connect } from "react-redux";
import {
  Text,
  View,
  TouchableHighlight,
  Vibration,
  ActivityIndicator,
} from "react-native";

let propsInObj = 0;
let objNames = [];
let objValues = [];

const AutoScreen = (props) => {
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
    backgroundColor: EStyleSheet.value("$bgColor"),
    underlayColor: EStyleSheet.value("$bgColor"),
    disconnected: true,
  });

  const onPress = () => {
    if (isMounted && ws.readyState === WebSocket.OPEN) {
      ws.send(`<measure_set_${props.single_or_average} />`);
      ws.send("<measure_trigger />");
      Vibration.vibrate([0, 10]);
    }
  };

  const onLongPress = () => {
    if (isMounted) {
      ws.send("<inspect_plan_start id='0' />");
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (props.IPAddress === "") {
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
      const name = vals[i]["attr"]["name"];
      const deviation =
        vals[i]["attr"]["deviation"] !== undefined ||
        vals[i]["attr"]["deviation"] !== null
          ? parseFloat(vals[i]["attr"]["deviation"]).toFixed(
              props.decimal_places
            )
          : parseFloat(0).toFixed(props.decimal_places);

      const objArr = { [name]: deviation };
      propsArr.push(objArr);
    }
    const obj = Object.assign({}, ...propsArr);
    objNames = Object.keys(obj);
    objValues = Object.values(obj);
    if (propsInObj > 10 && state.responsiveText === RFPercentage(4.1)) {
      setState((prevState) => ({
        ...prevState,
        responsiveText: RFPercentage(propsInObj / 5),
      }));
    } else if (propsInObj < 11 && state.responsiveText !== RFPercentage(4.1)) {
      setState((prevState) => ({
        ...prevState,
        responsiveText: RFPercentage(4.1),
      }));
    }
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

  const namesArr = [];
  for (let i = 0; i < propsInObj; i++) {
    namesArr.push(
      <Text
        key={i}
        numberOfLines={1}
        style={[styles.droText, { fontSize: state.responsiveText }]}
      >
        {objNames[i] + ":"}
      </Text>
    );
  }

  const valuesArr = [];
  for (let i = 0; i < propsInObj; i++) {
    valuesArr.push(
      <Text key={i} style={[styles.droText, { fontSize: state.responsiveText }]}>
        {objValues[i]}
      </Text>
    );
  }

  return (
    <TouchableHighlight
      underlayColor={state.underlayColor}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.container}
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
            Tap - Measure Point | Hold - Start Plan
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
            {state.currMeasNameEcho}
          </Text>
        </View>

        <View style={styles.tableView}>
          <View style={styles.droLeftBox}>{state.hasMeasEcho && namesArr}</View>
          <View style={styles.droRightBox}>
            {state.hasMeasEcho && valuesArr}
          </View>
        </View>

        <View style={styles.upNextView}>
          <Text style={styles.upNextText}>
            Up Next: {state.nextMeasNameEcho}
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
              backgroundColor: props.statusColor,
            }}
          ></View>
          <Text style={styles.footerText}>
            Active Plan: {state.planNameEcho} ({state.planIDEcho})
          </Text>
          <Text style={styles.footerText}>
            Objects in Plan: {state.objectsInPlanEcho} | Run State:{" "}
            {state.runStateEcho}
          </Text>
        </View>
      </React.Fragment>
    </TouchableHighlight>
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
    alignContent: "flex-start",
  },
  text: {
    color: "$textColor",
  },
  justMeasuredView: {
    height: RFValue(55),
    borderWidth: 0,
    borderColor: "$textColor",
    alignItems: "center",
    justifyContent: "center",
  },
  justMeasuredText: {
    color: "$textColor",
    fontSize: RFPercentage(3.5),
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
    fontSize: RFValue(16),
    color: "$textColor",
    paddingBottom: RFValue(7),
  },
});