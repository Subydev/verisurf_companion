import React, { useState, useRef } from "react";
import {
  Image,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Linking,
Platform,
SafeAreaView,
} from "react-native";
import {
  SocialIcon,
  ListItem,
  Icon,
} from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect, useSelector, useDispatch  } from "react-redux";
import EStyleSheet from "react-native-extended-stylesheet";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Dimensions } from "react-native";
import AppData from "../app.json";
import { Ionicons } from "@expo/vector-icons";


const AppearanceList = [
    { title: "Appearance Options", icon: "color-palette" },
    { title: "Notifications ", icon: "notifications-outline" },
  ];
  const MeasureSettingsList = [
    { title: "Measure Settings", icon: "resize-outline" },
  ];
  
  const ReportSettingsList = [
    { title: "Report Settings", icon: "document-text-outline" },
    { title: "Auto-Inspect Settings", icon: "play-outline" },
  ];
  
  const DeviceAndMeasureSettingsList = [
    { title: "Device Settings", icon: "hardware-chip-outline" },
    { title: "Measure Settings", icon: "resize-outline" },
  ];

  const ContactUsSettingsList = [
    { title: "Contact Us", icon: "call-outline" },
  ];

  const NotificationSettingsList = [
    { title: "Notifications", icon: "notifications-outline" },

  ];
  
  
const SettingsScreen = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [inTolCol, setInTolCol] = useState("");
  const [ootPosCol, setOotPosCol] = useState("");
  const [ootNegCol, setOotNegCol] = useState("");
  const [opacityLevel, setOpacityLevel] = useState(1);
  const notificationCount = useSelector(state => state.count);

  const dispatch = useDispatch();
  const myRef = useRef(null);
  const inputter = useRef(null);
  const inTolText = useRef(null);
  const ootPosText = useRef(null);
  const ootNegText = useRef(null);
  const screenHeight = Math.round(Dimensions.get("window").height);
  const heightHelper = 150;

  const _signOutAsync = async () => {
    await AsyncStorage.removeItem("userToken");
    props.navigation.navigate("Auth");
  };

  const submitColor = (reduxVal, hexValue) => {
    const matcher = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi;
    const x = matcher.exec(hexValue);
    if (x == null || x == undefined) {
      if (inTolText.current.isFocused()) {
        inTolText.current.shake();
        inTolText.current.clear();
      } else if (ootPosText.current.isFocused()) {
        ootPosText.current.shake();
        ootPosText.current.clear();
      } else {
        ootNegText.current.shake();
        ootNegText.current.clear();
      }
    } else {
      props.change_value_only(x[0], reduxVal);
    }
  };

  const textFocused = () => {
    if (myRef.current) {
      myRef.current.scrollTo({
        y: heightHelper + screenHeight / 5,
        animated: true,
      });
    }
  };

  const renderList = (list) => {
    return list.map((item, i) => (
      <ListItem
        key={i}
        containerStyle={[
          styles.listItemContainer,
          i === 0 ? { borderTopLeftRadius: 10, borderTopRightRadius: 10 } : {},
          i === list.length - 1 ? { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 } : {},
          i !== list.length - 1 ? { borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' } : {},
        ]}
        onPress={() => {
          const { navigate } = props.navigation;
          const title = item.title;
          switch (title) {
            case "Appearance Options":
              navigate("AppearanceSettings");
              break;
            case "Notifications":
              navigate("NotificationSettingsScreen");
              dispatch({ type: 'CLEAR_NOTIFICATIONS' });
              break;
            case "Report Settings":
              navigate("ReportSettingsScreen");
              break;
            case "Device Settings":
              navigate("DeviceSettings");
              break;
            case "Auto-Inspect Settings":
              navigate("AutoInspectSettingsScreen");
              break;
            case "Contact Us":
              navigate("ContactusSettingsScreen");
              break;
            case "Measure Settings":
              navigate("MeasureSettingsScreen");
              break;
            default:
              break;
          }
        }}
        underlayColor="#444"
      >
     <Ionicons name={item.icon} size={24} color="white" />
        <ListItem.Content>
          <ListItem.Title style={{ color: "white" }}>
            {item.title}
          </ListItem.Title>
        </ListItem.Content>
        {item.title === "Notifications" && notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
        <ListItem.Chevron />
      </ListItem>
    ));
  };

  return (
<SafeAreaView style={{ flex: 1, backgroundColor: EStyleSheet.value("$bgColor") }}>
      <ScrollView
        style={[styles.scrollContainer, { opacity: opacityLevel }]}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }} // Add this line

        ref={myRef}
      >
        <View style={styles.content}>
          <View style={styles.Headercontainer}>
            <TouchableOpacity
              style={styles.imagebox}
              onPress={() => {
                const { navigate } = props.navigation;
                navigate("Scanner");
              }}
            >
              <Image
                source={require("../assets/images/verisurfround.png")}
                style={styles.imagebox}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.containerList}>

        <View style={styles.sectionList}>
            <Text style={styles.sectionTitleList}>Apps</Text>
            {renderList(NotificationSettingsList)}
          </View>
          <View style={styles.sectionList}>
  <Text style={styles.sectionTitleList}>Devices</Text>
  {renderList(DeviceAndMeasureSettingsList)}
</View>
          <View style={styles.sectionList}>
            <Text style={styles.sectionTitleList}>Reports</Text>
            {renderList(ReportSettingsList)}
          </View>
     
          <View style={styles.sectionList}>
            <Text style={styles.sectionTitleList}>Resources</Text>
            {renderList(ContactUsSettingsList)}
          </View>
     
        </View>

        <View style={styles.container}>
          <TouchableOpacity onPress={_signOutAsync}>
            <View style={styles.containerSection}>
              <Text style={{ fontSize: RFValue(15), color: "red" }}>
                Sign Out
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.endSeperator}>
          <SocialIcon
            type="twitter"
            raised
            light={!props.dark_mode}
            onPress={() => Linking.openURL("https://twitter.com/verisurf")}
          />
          <SocialIcon
            type="linkedin"
            raised
            light={!props.dark_mode}
            onPress={() =>
              Linking.openURL("https://www.linkedin.com/company/verisurf/")
            }
          />
          <SocialIcon
            type="facebook"
            raised
            light={!props.dark_mode}
            onPress={() =>
              Linking.openURL("https://www.facebook.com/verisurf/")
            }
          />
          <SocialIcon
            type="instagram"
            raised
            light={!props.dark_mode}
            onPress={() =>
              Linking.openURL("https://www.instagram.com/verisurf/")
            }
          />
          <SocialIcon
            type="youtube"
            raised
            light={!props.dark_mode}
            onPress={() =>
              Linking.openURL(
                "https://www.youtube.com/channel/UCRaDH0ERMqN5Zrz9pUjzwyw"
              )
            }
          />
        </View>

        <View style={styles.footerContainer}>
          <View style={styles.poweredByContainer}>
            <SocialIcon
              button
              title="Powered by the Verisurf API"
              raised={false}
              padding={10}
              underlayColor="#333"
              style={styles.poweredByButton}
              type="github"
              onPress={() =>
                Linking.openURL("https://github.com/verisurf/verisurf-api")
              }
            />
          </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Version {AppData["expo"]["version"]}
          </Text>
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const mapStateToProps = (state) => ({
  IPAddress: state.IPAddress,
  build_tol: state.build_tol,
  dark_mode: state.dark_mode,
  decimal_places: state.decimal_places,
  response_time: state.response_time,
  auto_response_time: state.auto_response_time,
  plan_number: state.plan_number,
  device_number: state.device_number,
  single_or_average: state.single_or_average,
  in_tolerance_color: state.in_tolerance_color,
  oot_pos_color: state.oot_pos_color,
  oot_neg_color: state.oot_neg_color,
});

const mapDispatchToProps = (dispatch) => ({
  updating_value: (value, name) =>
    dispatch({ type: "UPDATING_VALUE", value, name }),
  finalizetol: (text) => dispatch({ type: "FINALIZE_TOL", text }),
  themeswitch: (value, name) =>
    dispatch({ type: "THEME_SWITCH", value, name }),
  toggleswitch: (value, name) =>
    dispatch({ type: "TOGGLE_SWITCH", value, name }),
  change_value_only: (value, name) =>
    dispatch({ type: "CHANGE_VALUE", value, name }),
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);

  const styles = EStyleSheet.create({

  // ... (styles remain the same)
  containerList: {
    flex: 1,
    // backgroundColor: '#000',
    padding: 10,
  },
  badge: {
    backgroundColor: 'red',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionList: {
    paddingBottom: RFPercentage(5),
  },
  sectionTitleList: {
    fontWeight: "400",
    color: "lightgray",
    fontSize: RFValue(14),
    paddingLeft: 5,
    paddingBottom: 10,
  },
  poweredByButton: {
    backgroundColor: "rgb(39,39,39)",
    width: '90%', // Adjust this value as needed
    justifyContent: 'center',
  },

  section: {
    paddingBottom: RFPercentage(5),
  },
  sectionTitle: {
    fontWeight: "400",
    color: "lightgray",
    fontSize: RFValue(14),
    paddingLeft: 5,
    paddingBottom: 10,
  },
  listItemContainer: {
    overflow: "hidden",
    backgroundColor: "#333333",
    paddingVertical: 15, // Adjust this value as needed
  },
  pickerContainer: {
    
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "white",
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
  picker: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
  },
  pickerItem: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
  },
  container: {
    marginBottom: RFValue(10),
    shadowColor: "$cardColor",

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
    backgroundColor: "$cardColor",
    borderRadius: 5,
  },
  container2: {
    marginBottom: RFValue(10),
    shadowColor: "$cardColor",
    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
    backgroundColor: "$cardColor",
    borderRadius: 5,
  },
  inputText: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
  },
  inputView: {
    flex: 1,
    width: 0,
    paddingRight: 0,
    flexShrink: 1,
    textAlign: "center",
    color: "$textColor",
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "white",
    overflow: "hidden",
    height: 40,
    justifyContent: "center",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "$bgColor",
  },
  content: {
    flex: 1,
    margin: RFValue(15),
  },
  Headercontainer: {
    padding: RFValue(20),
    height: RFValue(100),
    paddingBottom: 20,
  },
  sliderStuff: {
    alignContent: "center",
    justifyContent: "center",
  },
  SliderTitle: {
    alignContent: "center",
    justifyContent: "center",
    height: RFValue(50),
  },

  imagebox: {
    flex: 1,
    height: RFValue(80),
    width: RFValue(80),
    resizeMode: "contain",
    alignSelf: "center",
  },
  imageText: {
    color: "$textColor",
    alignSelf: "center",
  },
  footerContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  poweredByContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: "$textColor",
    fontSize: RFValue(15),
    opacity: 0.5,
  },
  container: {
    marginBottom: RFValue(10),
    shadowColor: "$bgColor",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
    backgroundColor: "$cardColor",
    borderRadius: 5,
  },
  containerSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: RFValue(50),
  },
  containerInSection: {
    flex: 1,
    height: RFValue(80),
    borderRadius: 1,
    borderBottomWidth: 0.1,
    borderColor: "$bgColor",
    opacity: 1,
  },
  containerInSection2: {
    flex: 1,
    height: RFValue(50),
    borderRadius: 1,
    borderBottomWidth: 0.1,
    opacity: 1,
    borderColor: "$bgColor",
  },
  inputInnerContainer: {
    paddingHorizontal: 10,
  },
  containerEndSection: {
    flex: 1,
    height: RFValue(80),
    borderRadius: 1,
    borderBottomWidth: 0.1,
    borderColor: "$cardColor",
    opacity: 1,
  },
  containerInnerSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  containerInnerSectionMiddle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  endSeperator: {
    borderTopWidth: 0,
    borderColor: "white",
    flexDirection: "row",
    justifyContent: "space-evenly",
    paddingTop: 20,
    paddingBottom: 5,
  },
  text: {
    flex: 6,
    flexDirection: "row",
    fontSize: RFValue(15),
    color: "$textColor",
    margin: RFValue(10),
    marginRight: 0,
    padding: 0,
    opacity: 0.8,
  },
  text2: {
    flex: 2,
    fontSize: RFValue(15),
    color: "$textColor",
    margin: RFValue(10),
    opacity: 0.8,
  },
  textSection: {
    flex: 1,
    textAlign: "left",
    fontSize: RFValue(21),
    //fontWeight: 'bold',
    color: "$textColor",
    paddingLeft: RFValue(8),
    opacity: 1,
  },
  iconRight: {
    flex: 1,
    textAlign: "center",
  },
  iconLeft: {
    flex: 1,
    textAlign: "center",
  },
  switchSt: {
    flex: 1,
    marginRight: RFValue(30),
    transform: [{ scaleX: RFValue(1) }, { scaleY: RFValue(1) }],
  },
  checkSt: {
    flex: 1,
  },
  sliderSt: {
    marginHorizontal: RFValue(40),
  },
  // picker: {
  //   //transform: [{scaleX: RFValue(1.3)}, {scaleY: RFValue(1.3)}],
  //   color: "$textColor",
  //   opacity: 1,
  //   marginRight: RFValue(14),
  //   width: 130,
  //   },
  // pickerItem: {
  //   color: "$textColor",
  //   height: RFValue(35),
  //   width: RFValue(30),
  //   fontSize: 18,
  //   opacity: 1,
  //   alignContent: "center",
  //   flexDirection: "column",
  // },
  colorCircle: {
    margin: RFValue(10),
    padding: 10,
    borderWidth: 3,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    height: RFValue(75),
    width: RFValue(75),
  },
  innerCircle: {
    borderWidth: 1,
    borderRadius: 50,
    alignSelf: "center",
    height: RFValue(55),
    width: RFValue(55),
  },
});
