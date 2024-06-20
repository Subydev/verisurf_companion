import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ScrollView,
  View,
  Text,
  Animated,
  RefreshControl,
  Keyboard,
  Alert,
  Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import EStyleSheet from "react-native-extended-stylesheet";
import Accordion from "react-native-collapsible/Accordion";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { Input } from "react-native-elements";
import { connect } from "react-redux";
import { useFocusEffect } from "@react-navigation/native";
import reportData from "../constants/reportData.json";

var SECTIONS = [];
var deleted = [];
var did_load = 0;

const windowWidth = Dimensions.get("window").width;

const ReportsScreen = (props) => {
  const [activeSections, setActiveSections] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [animValue, setAnimValue] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [planNumber, setPlanNumber] = useState(undefined);
  const [planName, setPlanName] = useState("");
  const [numOfObjects, setNumOfObjects] = useState(0);
  const [deviceWidth, setDeviceWidth] = useState(Dimensions.get("window").width);
  const [deviceHeight, setDeviceHeight] = useState(Dimensions.get("window").height);
  const [totalPlans, setTotalPlans] = useState(0);
  const [allPlans, setAllPlans] = useState([]);
  const [isReportLoaded, setIsReportLoaded] = useState(false);

  const searchForm = useRef();
  const currentPlan = useRef(undefined);
  const _isMounted = useRef(false);
  const ws = useRef(null);

  useFocusEffect(
    useCallback(() => {
      if (props.IPAddress !== "") {
        ws.current = new WebSocket(`ws://${props.IPAddress}:${props.port}`);
      }

      Dimensions.addEventListener("change", () => {
        setDeviceWidth(Dimensions.get("window").width);
      });

      return () => {
        deleted = [];
        SECTIONS = [];
      };
    }, [props.IPAddress, props.port])
  );

  useEffect(() => {
    if (props.decimal_places !== undefined) {
      // Ensure the component re-renders when decimal_places changes
      setActiveSections([...activeSections]);
    }
  }, [props.decimal_places], props.single_or_average, props.device_number);

  const CLEAR_DATA = () => {
    did_load = 0;
    SECTIONS = [];
    deleted = [];
    setAllPlans([]);
    setActiveSections([]);
    setHeaders([]);
    setAnimValue([]);
    setSearch("");
    setPlanNumber(undefined);
  };

  const _GetData = useCallback(
    (q) => {
      if (props.IPAddress !== '') {

        ws.current.onopen = () => {
          if (q === undefined) {
            ws.current.send("<inspect_plan_list />");
            ws.current.send("<inspect_plan_info id='0' />");
          } else {
            ws.current.send(`<inspect_plan_list />`);
            ws.current.send(`<inspect_plan_info id='${q}' />`);
          }
        };

        ws.current.onmessage = ({ data }) => {
          if (data.includes("acknowledgement")) {
            return;
          }

          if (data.includes("inspect_plan_info")) {
            var xmlResult = _xmlParse(data);

            if (
              xmlResult["response"]["success"]["data"]["inspect_plan_info"] === ""
            ) {
              return;
            }

            var currentPlanName =
              xmlResult["response"]["success"]["data"]["inspect_plan_info"][
                "plan"
              ]["Object Name:"];

            if (planNumber === undefined) {
              currentPlan.current =
                xmlResult["response"]["success"]["data"]["inspect_plan_info"][
                  "plan"
                ]["attr"]["id"];
              setPlanNumber(currentPlan.current);
              setPlanName(currentPlanName);
            } else {
              setPlanName(currentPlanName);
            }

            var objsInPlan =
              xmlResult["response"]["success"]["data"]["inspect_plan_info"][
                "plan"
              ]["plan_object"];
            var num_of_objects = 0;

            if (objsInPlan === undefined) {
              setRefreshing(false);
              return;
            } else if (Array.isArray(objsInPlan)) {
              for (var key in objsInPlan) {
                num_of_objects += 1;
                let planName = objsInPlan[key]["Object Name:"];
                SECTIONS.push({
                  title: planName,
                  content: {},
                });
                var joined = animValue.concat(new Animated.Value(250));
                setAnimValue(joined);
                setRefreshing(false);
              }
            } else {
              num_of_objects = 1;
              SECTIONS.push({
                title: objsInPlan["Object Name:"],
                content: {},
              });
              var joined = animValue.concat(new Animated.Value(250));
              setAnimValue(joined);
              setRefreshing(false);
            }
            setNumOfObjects(num_of_objects);
          }

          if (data.includes("inspect_plan_list")) {
            var xmlResult = _xmlParse(data);
            var plans = xmlResult["response"]["success"]["data"]["plans"]["plan"];

            if (plans === undefined) {
              setRefreshing(false);
              return;
            } else if (Array.isArray(plans)) {
              setTotalPlans(plans.length);
              for (var key in plans) {
                setAllPlans((prevPlans) => [
                  ...prevPlans,
                  <Picker.Item
                    label={plans[key]["Object Name:"]}
                    value={plans[key]["attr"]["id"]}
                    key={plans[key]["attr"]["id"]}
                  />,
                ]);
              }
            } else {
              setTotalPlans(1);
              setAllPlans((prevPlans) => [
                ...prevPlans,
                <Picker.Item
                  label={plans["Object Name:"]}
                  value={plans["attr"]["id"]}
                  key={plans["attr"]["id"]}
                />,
              ]);
            }
          }
        };
      } else {
        console.log('No IP Address')
        // No WebSocket connection, use simulator data
        const simulatorData = reportData.inspect_plan_info.plan.plan_objects;
        setAllPlans((prevPlans) => [
          ...prevPlans,
          <Picker.Item
            label="Inspection Report"
            value="id"
            key="attr"
          />,
        ]);
        // Clear the existing sections
        SECTIONS = [];

        // Populate the sections array with simulator data
        setPlanNumber(0);
        setPlanName("Inspection Report");
        console.log(planName)
        console.log(simulatorData)
        simulatorData.forEach((object) => {
          SECTIONS.push({
            title: object.name,
            content: {
              
              // Add any additional properties you want to display
            },
          });
        });
        

        // Update the state with the new sections
        setActiveSections([]);
        setAnimValue(SECTIONS.map(() => new Animated.Value(0)));
        setRefreshing(false);
      }
    },
    [props.IPAddress, props.port]
  );

  const _xmlParse = (data) => {
    var options = {
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
    var parser = require("fast-xml-parser");
    var he = require("he");
    var res = parser.parse(data, options);
    return res;
  };

  const onRefresh = (q) => {
    setRefreshing(true);
    setIsReportLoaded(true); 
    CLEAR_DATA();
    if (search.length > 0) {
      Keyboard.dismiss();
      const node = searchForm.current;
      node.clear();
    }
    _GetData(q);
  };

  const _renderHeader = (section, index, isActive) => {
    Animated.timing(animValue[index], {
      toValue: isActive ? 0 : 250,
      duration: 300,
      useNativeDriver: false,
    }).start();

    return (
      <View
        style={[
          styles.header,
          index === 0 ? styles.headerFirst : null,
          { backgroundColor: EStyleSheet.value("$cardColor") },
        ]}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText}>{section.title}</Text>
        </View>
        <Animated.View
          style={{
            transform: [
              {
                rotate: animValue[index].interpolate({
                  inputRange: [0, 250],
                  outputRange: ["0deg", "180deg"],
                  extrapolate: "clamp",
                }),
              },
            ],
          }}
        >
          <Ionicons
            name="chevron-down-outline"
            size={RFValue(12)}
            color={EStyleSheet.value("$textColor")}
          />
        </Animated.View>
      </View>
    );
  };

  const _renderContent = (section) => {
    if (props.IPAddress !== '') {
      let views = [];
      let properties = section["content"];
  
      if (Object.keys(properties).length !== 0) {
        for (var key in properties) {
          let name = key;
          let nom = properties[key]["nom"];
          let meas = properties[key]["measured"];
          let dev = properties[key]["deviation"];
          
  
          views.push(
            <React.Fragment key={name}>
              <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
                <Text numberOfLines={1} style={styles.category}>
                  {name}
                </Text>
              </View>
  
              <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
                <Text numberOfLines={1} style={styles.category}>
                  {parseFloat(nom).toFixed(props.decimal_places)}
                </Text>
              </View>
  
              <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
                <Text numberOfLines={1} style={styles.category}>
                  {parseFloat(meas).toFixed(props.decimal_places)}
                </Text>
              </View>
  
              <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
                <Text numberOfLines={1} style={styles.category}>
                  {parseFloat(dev).toFixed(props.decimal_places)}
                </Text>
              </View>
            </React.Fragment>
          );
        }
      }
  
      return (
        <View style={styles.dataContainer}>
          <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
            <Text style={styles.category}></Text>
          </View>
  
          <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
            <Text style={styles.category}>Nom.</Text>
          </View>
  
          <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
            <Text style={styles.category}>Act.</Text>
          </View>
  
          <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
            <Text style={styles.category}>Dev.</Text>
          </View>
  
          {views}
        </View>
      );
    } else {
      // No IP address provided, use simulator data
      const object = reportData.inspect_object_info.object.find(
        (obj) => obj.name === section.title
      );
  
      if (!object) {
        return null;
      }
      let views = [];

      object.properties.forEach((property) => {
        views.push(
          <React.Fragment key={property.name}>
            <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
              <Text numberOfLines={1} style={styles.category}>
                {property.name}
              </Text>
            </View>
  
            <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
              <Text numberOfLines={1} style={styles.category}>
                {property.nominal !== undefined
                  ? parseFloat(property.nominal).toFixed(props.decimal_places)
                  : "-"}
              </Text>
            </View>
  
            <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
              <Text numberOfLines={1} style={styles.category}>
                {property.measured !== undefined
                  ? parseFloat(property.measured).toFixed(props.decimal_places)
                  : "-"}
              </Text>
            </View>
  
            <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
              <Text numberOfLines={1} style={styles.category}>
                {property.deviation !== undefined
                  ? parseFloat(property.deviation).toFixed(props.decimal_places)
                  : "-"}
              </Text>
            </View>
          </React.Fragment>
        );
      });
  
      return (
        <View style={styles.dataContainer}>
          <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
            <Text style={styles.category}></Text>
          </View>
  
          <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
            <Text style={styles.category}>Nom.</Text>
          </View>
  
          <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
            <Text style={styles.category}>Act.</Text>
          </View>
  
          <View style={[styles.data, { width: deviceWidth / 4.5 }]}>
            <Text style={styles.category}>Dev.</Text>
          </View>
  
          {views}
        </View>
      );
    }
  };

  const _updateSections = (activeSections) => {
    setActiveSections(activeSections);
  };

  const searchSection = (text) => {
    if (text.length === 0) {
      SECTIONS = SECTIONS.concat(deleted);
      deleted = [];
    } else {
      deleted = [];
      for (let i = 0; i < SECTIONS.length; i++) {
        if (!SECTIONS[i].title.toLowerCase().includes(text.toLowerCase())) {
          deleted.push(SECTIONS[i]);
          SECTIONS.splice(i, 1);
          i--;
        }
      }
    }
  };

  return (
    <View style={{ backgroundColor: EStyleSheet.value("$bgColor"), flex: 1 }}>
      <View
        style={{
          backgroundColor: EStyleSheet.value("$bgColor"),
          paddingBottom: RFValue(10),
        }}
      >
        <Input
          ref={searchForm}
          inputStyle={styles.searchForm}
          containerStyle={{ paddingTop: RFPercentage(5) }}
          inputContainerStyle={styles.searchContainer}
          clearButtonMode="while-editing"
          underlineColorAndroid="transparent"
          placeholder={"Search..."}
          placeholderTextColor={EStyleSheet.value("$textColor")}
          onChangeText={(text) => {
            searchSection(text);
            setSearch(text);
          }}
          value={search}
          borderBottomWidth={1}
        />
      </View>

      {!isReportLoaded && (
        <Text style={{color: "white", fontSize: RFPercentage(2), paddingBottom: 10, alignSelf: "center"}}>Swipe Down to Load Example Report!

  </Text>
)}

      <View
        key={props.dark_mode}
        style={{
          margin: 0,
          backgroundColor: EStyleSheet.value("$cardColor"),
          borderWidth: 1,
          borderRadius: 5,
          borderBottomWidth: 1,
          alignItems: "stretch",
          borderColor: "$bgColor",
        }}
      >
        <Picker
          selectedValue={planNumber}
          itemStyle={styles.pickerItem2}
          style={{
            color: EStyleSheet.value("$textColor"),
            borderWidth: 0,
            height: RFValue(50),
            backgroundColor: "$bgColor",
          }}
          onValueChange={(itemValue) => {
            console.log(itemValue);
            console.log(did_load);

            if (did_load === 0 && planNumber === 0) {
              did_load += 1;
              return;
            }
            setPlanNumber(itemValue);
            setActiveSections([]);
            setAnimValue([]);
            _GetData(itemValue);
          }}
        >
          {allPlans}
        </Picker>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={100}
          />
        }
        ref={(scrollView) => {
          this.scrollView = scrollView;
        }}
      >
        <Accordion
          expandMultiple={true}
          sections={SECTIONS}
          activeSections={activeSections}
          renderHeader={_renderHeader}
          renderContent={_renderContent}
          onChange={_updateSections}
          containerStyle={styles.accordionContainer}
          sectionContainerStyle={styles.accordionSection}
          underlayColor={EStyleSheet.value("$bgColor")}
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
        <Text style={styles.footerText}>Active Plan: `{props.IPAddress === "" ? `Inspection Report` : `${planName}`}</Text>

        <Text style={styles.footerText}>
          Objects in Plan: `{props.IPAddress === "" ? 17 : `${numOfObjects}`}` | Total Plans: {totalPlans}
        </Text>
      </View>
    </View>
  );
};

ReportsScreen.navigationOptions = {
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReportsScreen);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$bgColor",
    alignContent: "flex-start",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "$bgColor",
  },
  accordionContainer: {
    backgroundColor: "$bgColor",
  },
  accordionSection: {
    backgroundColor: "$cardColor",
    marginBottom: 10,
    borderRadius: 5,
  },
  dataContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    paddingBottom: RFValue(10),
  },
  data: {
    margin: RFValue(3),
    height: RFPercentage(5),
    alignItems: "center",
    justifyContent: "center",
  },
  category: {
    fontSize: RFValue(14),
    color: "$textColor",
    fontVariant: ["tabular-nums"],
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "$cardColor",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    paddingLeft: RFValue(10),
    paddingRight: RFValue(10),
    paddingTop: RFValue(5),
    paddingBottom: RFValue(5),
  },
  headerFirst: {
    marginTop: RFValue(10),
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: "flex-start",
  },
  headerText: {
    fontSize: RFValue(16),
     fontWeight: "normal",
    color: "$textColor",
  },
  searchForm: {
    fontSize: RFValue(20),
    color: "$textColor",
  },
  searchContainer: {
    backgroundColor: "$cardColor",
    borderBottomColor: "$textColor",
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 5,
  },
  pickerItem2: {
    fontSize: RFValue(20),
    height: RFValue(100),
    color: "$textColor",
    backgroundColor: "$bgColor",
  },
  footerText: {
    fontSize: RFValue(12),
    color: "$textColor",
  },
});
