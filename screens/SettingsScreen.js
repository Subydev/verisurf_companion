import * as React from "react";
import {
  Image,
  Text,
  View,
  ScrollView,
  Switch,
  TouchableOpacity,
  Linking,
  Button,
  Modal,
  TouchableHighlight,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Slider,
  Input,
  SocialIcon,
  Tooltip,
  ListItem,
  Icon,
} from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect } from "react-redux";
import EStyleSheet from "react-native-extended-stylesheet";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";
import AppData from "../app.json";

const AppearanceList = [
  { title: 'Appearance Options', icon: 'av-timer' },
];

const MeasureSettingsList = [
  { title: 'Measure Settings', icon: 'flight-takeoff' },
  { title: 'Build Settings', icon: 'flight-takeoff' },
];

const ReportSettingsList = [
  { title: 'Report Settings', icon: 'flight-takeoff' },
  { title: 'Auto-Inspect Settings', icon: 'flight-takeoff' },
];

const DeviceSettingsList = [
  { title: 'Device Settings', icon: 'flight-takeoff' },
];

const ContactList = [
  { title: 'Contact Us', icon: 'flight-takeoff' },
];

class SettingsScreen extends React.Component {
  constructor() {
    super();
    this.myRef = React.createRef();
    this.inputter = React.createRef();
    this.inTolText = React.createRef();
    this.ootPosText = React.createRef();
    this.ootNegText = React.createRef();
    this.screenHeight = Math.round(Dimensions.get("window").height);
    this.heightHelper = 150;

    this.state = {
      modalVisible: false,
      inTolCol: "",
      ootPosCol: "",
      ootNegCol: "",
      opacitylevel: 1,
    };
  }

  componentWillUnmount() {
    this.setState({ modalVisible: false });
  }

  _signOutAsync = async () => {
    await AsyncStorage.removeItem("userToken");
    this.props.navigation.navigate("Auth");
  };

  submitColor = (reduxval, hexValue) => {
    var matcher = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi;
    var x = matcher.exec(hexValue);
    if (x == null || x == undefined) {
      if (this.inTolText.current.isFocused() == true) {
        this.inTolText.current.shake();
        this.inTolText.current.clear();
      } else if (this.ootPosText.current.isFocused() == true) {
        this.ootPosText.current.shake();
        this.ootPosText.current.clear();
      } else {
        this.ootNegText.current.shake();
        this.ootNegText.current.clear();
      }
    } else {
      this.props.change_value_only(x[0], reduxval);
    }
  };

  textFocused = () => {
    this.myRef.scrollTo({
      y: this.heightHelper + this.screenHeight / 5,
      animated: true,
    });
  };

  renderList = (list) => {
    return list.map((item, i) => (
      <ListItem
        key={i}
        containerStyle={[
          styles.listItemContainer,
          i === 0 ? { borderTopLeftRadius: 10, borderTopRightRadius: 10 } : {},
          i === list.length - 1 ? { borderBottomLeftRadius: 10, borderBottomRightRadius: 10 } : {},
        ]}
        // bottomDivider={i !== list.length - 1}
        // onPress={() => this.handlePress(item.title)}
        onPress={() => {
          const { navigate } = this.props.navigation;
          const title = item.title;
          navigate('Details', { title });
        }}
        underlayColor="#444"
      >
        <Icon name={item.icon} color="white" />
        <ListItem.Content>
          <ListItem.Title style={{ color: 'white' }}>{item.title}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>
    ));
  };

  render() {
    const { dark_mode, themeswitch } = this.props;

    return (
      //SETUP FOR CONTENT -----------------------------------
      <View style={{ flex: 1, backgroundColor: EStyleSheet.value("$bgColor") }}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
        >
          <View
            style={{
              margin: RFPercentage(5),
              height: RFPercentage(90),
              marginBottom: RFPercentage(0),
            }}
          >
            <View
              style={{
                paddingTop: RFValue(10),
                flexWrap: "wrap",
                backgroundColor: EStyleSheet.value("$cardColor"),
                flex: 2,
                flexDirection: "row",
                justifyContent: "space-around",
                borderWidth: 1,
                borderRadius: 10,
              }}
            >
              <TouchableHighlight
                style={[
                  styles.colorCircle,
                  {
                    borderColor: this.props.in_tolerance_color,
                    marginTop: RFPercentage(5),
                  },
                ]}
              >
                <View
                  style={[
                    styles.innerCircle,
                    {
                      backgroundColor: this.props.in_tolerance_color,
                      borderColor: this.props.in_tolerance_color,
                    },
                  ]}
                ></View>
              </TouchableHighlight>

              <Input
                label={"In Tolerance"}
                labelStyle={{ color: EStyleSheet.value("$textColor") }}
                ref={this.inTolText}
                inputContainerStyle={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderColor: EStyleSheet.value("$textColor"),
                }}
                containerStyle={{
                  width: 150,
                  height: 50,
                  alignSelf: "center",
                  marginTop: RFPercentage(5),
                }}
                inputStyle={{ color: EStyleSheet.value("$textColor") }}
                placeholderTextColor={EStyleSheet.value("$textColor")}
                placeholder={this.props.in_tolerance_color}
                onChangeText={(text) => {
                  this.setState({ inTolCol: text });
                }}
                onSubmitEditing={() =>
                  this.submitColor("in_tolerance_color", this.state.inTolCol)
                }
              />

              <TouchableHighlight
                style={[
                  styles.colorCircle,
                  {
                    borderColor: this.props.oot_pos_color,
                    marginTop: RFPercentage(5),
                  },
                ]}
              >
                <View
                  style={[
                    styles.innerCircle,
                    {
                      backgroundColor: this.props.oot_pos_color,
                      borderColor: this.props.oot_pos_color,
                    },
                  ]}
                ></View>
              </TouchableHighlight>

              <Input
                label={"Heavy OOT"}
                labelStyle={{ color: EStyleSheet.value("$textColor") }}
                ref={this.ootPosText}
                inputContainerStyle={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderColor: EStyleSheet.value("$textColor"),
                }}
                containerStyle={{
                  width: 150,
                  height: 50,
                  alignSelf: "center",
                  marginTop: RFPercentage(5),
                }}
                inputStyle={{ color: EStyleSheet.value("$textColor") }}
                placeholder={this.props.oot_pos_color}
                placeholderTextColor={EStyleSheet.value("$textColor")}
                onChangeText={(text) => {
                  this.setState({ ootPosCol: text });
                }}
                onSubmitEditing={() =>
                  this.submitColor("oot_pos_color", this.state.ootPosCol)
                }
              />

              <TouchableHighlight
                style={[
                  styles.colorCircle,
                  {
                    borderColor: this.props.oot_neg_color,
                    marginTop: RFPercentage(5),
                  },
                ]}
              >
                <View
                  style={[
                    styles.innerCircle,
                    {
                      backgroundColor: this.props.oot_neg_color,
                      borderColor: this.props.oot_neg_color,
                    },
                  ]}
                ></View>
              </TouchableHighlight>

              <Input
                label={"Negative OOT"}
                labelStyle={{ color: EStyleSheet.value("$textColor") }}
                ref={this.ootNegText}
                inputContainerStyle={{
                  alignSelf: "center",
                  justifyContent: "center",
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderColor: EStyleSheet.value("$textColor"),
                }}
                containerStyle={{
                  width: 150,
                  height: 50,
                  alignSelf: "center",
                  marginTop: RFPercentage(5),
                }}
                inputStyle={{ color: EStyleSheet.value("$textColor") }}
                placeholder={this.props.oot_neg_color}
                placeholderTextColor={EStyleSheet.value("$textColor")}
                onChangeText={(text) => {
                  this.setState({ ootNegCol: text });
                }}
                onSubmitEditing={() =>
                  this.submitColor("oot_neg_color", this.state.ootNegCol)
                }
              />

              <View style={{ marginTop: RFPercentage(10) }}>
                <Button
                  title="Close Window"
                  onPress={() =>
                    this.setState({ modalVisible: false, opacitylevel: 1 })
                  }
                  color="#B13034"
                />
              </View>
            </View>
          </View>
        </Modal>

        <ScrollView
          style={[styles.scrollContainer, { opacity: this.state.opacitylevel }]}
          ref={(c) => (this.myRef = c)}
        >
          <View style={styles.content}>
            {/* END SETUP -------------------------------------------*/}

            {/* Header + Image */}
            <View style={styles.Headercontainer}>
              <TouchableOpacity
                style={styles.imagebox}
                onPress={() => {
                  const { navigate } = this.props.navigation;
                  navigate("Scanner");
                }}
              >
                <Image
                  source={require("../assets/images/verisurfround.png")}
                  style={styles.imagebox}
                />
                {/* <Text style={styles.imageText}>
            Settings
          </Text> */}
              </TouchableOpacity>
            </View>
</View>
            <View style={styles.containerList}>
        <View style={styles.sectionList}>
          <Text style={styles.sectionTitleList}>Application</Text>
          {this.renderList(AppearanceList)}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitleList}>Measurements</Text>
          {this.renderList(MeasureSettingsList)}
        </View>
        <View style={styles.sectionList}>
          <Text style={styles.sectionTitleList}>Reports</Text>
          {this.renderList(ReportSettingsList)}
        </View>
        <View style={styles.sectionList}>
          <Text style={styles.sectionTitleList}>Devices</Text>
          {this.renderList(DeviceSettingsList)}
        </View>
        <View style={styles.sectionList}>
          <Text style={styles.sectionTitleList}>Resources</Text>
          {this.renderList(ContactList)}
        </View>
      </View>

            {/* SECTION Appearance */}
            <View style={styles.container2}>
              <View style={styles.containerSection}>
                <Text
                  style={styles.textSection}
                  numberOfLines={1}
                  ellipsizeMode={"tail"}
                >
                  Appearance
                </Text>
                {/* <Tooltip
                  height={RFValue(155)}
                  width={RFValue(310)}
                  popover={
                    <Text style={{ fontSize: RFValue(15) }}>
                      <Text
                        style={{ fontWeight: "bold", fontSize: RFValue(15) }}
                      >
                        Dark Mode
                      </Text>
                      : Toggle between a dark and light theme.{"\n"}
                      {"\n"}
                      <Text
                        style={{ fontWeight: "bold", fontSize: RFValue(15) }}
                      >
                        Tolerance Colors
                      </Text>
                      : Set the colors used for indicating tolerance levels in
                      the build screen. Requires a hex value input.
                    </Text>
                  }
                >
                  <Icon
                    iconStyle={{ paddingRight: 15 }}
                    name="help-outline"
                    color={EStyleSheet.value("$textColor")}
                  />
                </Tooltip> */}
              </View>

              {/* COMPONENTS */}
              <View style={{marginTop:RFPercentage(-10)}}>
                {/* Theme Swithcer */}
                <View style={(styles.containerInSection, { height: 150 })}>
                  <View style={styles.containerInnerSection}>
                    {/* <Text
                      style={styles.text}
                      numberOfLines={1}
                      ellipsizeMode={"tail"}
                    >
                      Dark Mode
                    </Text> */}
                    {/* <View style={styles.container}>
                      <Switch
                        style={styles.switchSt}
                        value={dark_mode}
                        onValueChange={() =>
                          themeswitch(!dark_mode, "dark_mode")
                        }
                      />
                    </View> */}
                  </View>
                  <View>
                    <Text></Text>
                  </View>
                  <View style={styles.containerInSection}>
                    <TouchableOpacity
                      style={styles.containerInnerSection}
                      onPress={() =>
                        this.setState({ modalVisible: true, opacitylevel: 0.5 })
                      }
                    >
                      <Text
                        style={styles.text}
                        numberOfLines={1}
                        ellipsizeMode={"tail"}
                      >
                        Tolerance Colors
                      </Text>
                      <View style={{ flex: 1, marginRight: RFPercentage(1.7) }}>
                        <Ionicons
                          name="brush-outline"
                          size={RFPercentage(3.8)}
                          color={EStyleSheet.value("$textColor")}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
            {/* End Appearance Section*/}

            {/* Section Measure */}
            <View style={styles.container}>
              <View style={styles.containerSection}>
                <Text
                  style={styles.textSection}
                  numberOfLines={1}
                  ellipsizeMode={"tail"}
                >
                  Measure
                </Text>
                <Tooltip
                  height={RFValue(155)}
                  width={RFValue(310)}
                  popover={
                    <Text style={{ fontSize: RFValue(15) }}>
                      <Text
                        style={{ fontWeight: "bold", fontSize: RFValue(15) }}
                      >
                        Decimal Place
                      </Text>
                      : Change how many decimals are displayed in all VS
                      Companion screens.{"\n"}
                      {"\n"}
                      <Text
                        style={{ fontWeight: "bold", fontSize: RFValue(15) }}
                      >
                        Build Tolerance
                      </Text>
                      : Change the Build Tolerance used in the Build Screen.
                    </Text>
                  }
                >
                  <Icon
                    iconStyle={{ paddingRight: 15 }}
                    name="help-outline"
                    color={EStyleSheet.value("$textColor")}
                  />
                </Tooltip>
              </View>

              {/*Components*/}
              <View>
                {/* Decimal Picker */}
                <View style={styles.containerInSection}>
                  <View
                    key={this.props.dark_mode}
                    style={styles.containerInnerSection}
                  >
                    <Text
                      style={styles.text}
                      numberOfLines={1}
                      ellipsizeMode={"tail"}
                    >
                      Decimal Places
                    </Text>
                    <View style={styles.pickerContainer}>
    <Picker
      selectedValue={this.props.decimal_places.toString()}
      style={styles.picker}
      itemStyle={styles.pickerItem}
      onValueChange={(itemValue, itemIndex) => {
        this.props.change_value_only(itemValue, "decimal_places");
      }}
    >
      <Picker.Item label="1" value="1" />
      <Picker.Item label="2" value="2" />
      <Picker.Item label="3" value="3" />
      <Picker.Item label="4" value="4" />
    </Picker>
                  </View>
                </View>

                {/* Build Tolerance */}
                <View style={styles.containerEndSection}>
                  <View style={styles.containerInnerSection}>
                    <Text
                      style={styles.text2}
                      numberOfLines={1}
                      ellipsizeMode={"tail"}
                    >
                      Build Tolerance
                    </Text>
                    <Input
                      onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        this.heightHelper = layout.height;
                      }}
                      ref={this.inputter}
                      clearButtonMode={"while-editing"}
                      textAlign={"center"}
                      inputContainerStyle={styles.inputContainer}
                      inputStyle={styles.inputText}
                      labelStyle={styles.text}
                      containerStyle={styles.inputInnerContainer} // Merged containerStyle here
                      Label={"Build Tolerance"}
                      disabled={false}
                      keyboardType="numeric"
                      defaultValue={this.props.build_tol.toString()}
                      onFocus={this.textFocused}
                      onChangeText={(text) =>
                        this.props.updating_value(text, "build_tol")
                      }
                      onEndEditing={() =>
                        this.props.finalizetol(this.props.build_tol.toString())
                      }
                    />
                  </View>
                </View>
              </View>
              {/* End Components */}
            </View>
            {/* End Section Measure */}

            {/* Section Auto Inspect */}
            <View style={styles.container}>
              <View style={styles.containerSection}>
                <Text
                  style={styles.textSection}
                  numberOfLines={1}
                  ellipsizeMode={"tail"}
                >
                  Auto Inspect
                </Text>
                <Tooltip
                  height={RFValue(70)}
                  width={RFValue(310)}
                  popover={
                    <Text style={{ fontSize: RFValue(15) }}>
                      <Text
                        style={{ fontWeight: "bold", fontSize: RFValue(15) }}
                      >
                        Response Time
                      </Text>
                      : How fast data is transmitted from Verisurf.{"\n"}
                      {"\n"}
                    </Text>
                  }
                >
                  <Icon
                    iconStyle={{ paddingRight: 15 }}
                    name="help-outline"
                    color={EStyleSheet.value("$textColor")}
                  />
                </Tooltip>
              </View>

              {/*Components*/}
              <View>
                {/* Response Time Slider */}
                <View style={[styles.containerInSection, { marginBottom: 10 }]}>
                  <View stlye={styles.containerInnerSection}></View>
                  <Text
                    style={styles.text}
                    numberOfLines={1}
                    ellipsizeMode={"tail"}
                  >
                    Response Time (ms): {this.props.auto_response_time}
                  </Text>
                  <Slider
                    step={50}
                    disabled={false}
                    style={styles.sliderSt}
                    thumbTintColor={this.props.dark_mode ? "white" : "#000"}
                    maximumValue={1000}
                    minimumTrackTintColor={
                      this.props.dark_mode ? "#B13034" : "black"
                    }
                    thumbStyle={{ height: 20, width: 20 }}
                    minimumValue={300}
                    value={this.props.auto_response_time}
                    onValueChange={(value) =>
                      this.props.updating_value(value, "auto_response_time")
                    }
                  />
                </View>
              </View>
            </View>
            {/* End Section Auto Inspect */}

            {/* Section Device */}
            <View style={styles.container}>
              <View style={styles.containerSection}>
                <Text
                  style={styles.textSection}
                  numberOfLines={1}
                  ellipsizeMode={"tail"}
                >
                  Device
                </Text>
                <Tooltip
                  height={RFValue(200)}
                  width={RFValue(310)}
                  popover={
                    <Text style={{ fontSize: RFValue(15) }}>
                      <Text
                        style={{ fontWeight: "bold", fontSize: RFValue(15) }}
                      >
                        Response Time
                      </Text>
                      : How fast data is transmitted from Verisurf.{"\n"}
                      {"\n"}
                      <Text
                        style={{ fontWeight: "bold", fontSize: RFValue(15) }}
                      >
                        Device Number
                      </Text>
                      : Which device is used to retreive data. Defaults to the
                      first device.{"\n"}
                      {"\n"}
                      <Text
                        style={{ fontWeight: "bold", fontSize: RFValue(15) }}
                      >
                        Single Point Method
                      </Text>
                      : Toggle Average or Single Point when tapping to measure.
                    </Text>
                  }
                >
                  <Icon
                    iconStyle={{ paddingRight: 15 }}
                    name="help-outline"
                    color={EStyleSheet.value("$textColor")}
                  />
                </Tooltip>
              </View>

              {/*Components*/}
              <View>
                {/* Response Time Slider */}
                <View style={styles.containerInSection}>
                  <View stlye={styles.containerInnerSection}></View>
                  <Text
                    style={styles.text}
                    numberOfLines={1}
                    ellipsizeMode={"tail"}
                  >
                    Response Time (ms): {this.props.response_time}
                  </Text>
                  <Slider
                    step={10}
                    thumbStyle={{ height: 20, width: 20 }}
                    disabled={false}
                    style={styles.sliderSt}
                    thumbTintColor={this.props.dark_mode ? "white" : "#000"}
                    maximumValue={1000}
                    minimumTrackTintColor={
                      this.props.dark_mode ? "#B13034" : "black"
                    }
                    minimumValue={10}
                    value={this.props.response_time}
                    onValueChange={(value) =>
                      this.props.updating_value(value, "response_time")
                    }
                  />
                </View>
                {/* Device Number Slider */}
                <View style={styles.containerInSection}>
                  <View stlye={styles.containerInnerSection}></View>
                  <Text
                    style={styles.text}
                    numberOfLines={1}
                    ellipsizeMode={"tail"}
                  >
                    Device Number: {this.props.device_number}
                  </Text>
                  <Slider
                    disabled={false}
                    thumbStyle={{ height: 20, width: 20 }}
                    style={styles.sliderSt}
                    thumbTintColor={this.props.dark_mode ? "white" : "#000"}
                    maximumValue={8}
                    minimumTrackTintColor={
                      this.props.dark_mode ? "#B13034" : "black"
                    }
                    minimumValue={1}
                    value={this.props.device_number}
                    step={1}
                    onValueChange={(value) =>
                      this.props.updating_value(value, "device_number")
                    }
                  />
                </View>
                {/* Single || Continous Component*/}
                <View style={styles.containerEndSection}>
                  <View style={styles.containerInnerSection}>
                    <Text
                      style={styles.text2}
                      numberOfLines={1}
                      ellipsizeMode={"tail"}
                    >
                      Single Point Method
                    </Text>
                    <View style={{ flex: 2, marignRight: 25, padding: 0 }}>
                      <Button
                        style={{ marginLeft: 20, padding: 0 }}
                        title={this.props.single_or_average}
                        onPress={() => {
                          {
                            var changeValue =
                              this.props.single_or_average == "single"
                                ? "average"
                                : "single";
                            this.props.change_value_only(
                              changeValue,
                              "single_or_average"
                            );
                          }
                        }}
                        color={"#C12030"}
                      />
                    </View>
                  </View>
                </View>
                {/*End Single Component */}
              </View>
              {/* End Components */}
            </View>
            {/* End Section Device */}

            {/* SUPPORT SECTION */}
            <View style={styles.container}>
              <View style={styles.containerSection}>
                <Text
                  style={styles.textSection}
                  numberOfLines={1}
                  ellipsizeMode={"tail"}
                >
                  Support
                </Text>
              </View>
              <View>
                <View style={styles.containerInSection}>
                  <TouchableOpacity
                    style={[
                      styles.containerInnerSection,
                      { paddingLeft: RFPercentage(2) },
                    ]}
                    onPress={() => Linking.openURL("mailto:codes@verisurf.com")}
                  >
                    <Ionicons
                      name="mail"
                      color={EStyleSheet.value("$textColor")}
                      size={RFPercentage(3)}
                    />
                    <Text style={styles.text}>codes@verisurf.com</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.containerEndSection}>
                  <TouchableOpacity
                    style={[
                      styles.containerInnerSection,
                      { paddingLeft: RFPercentage(2) },
                    ]}
                    onPress={() =>
                      Linking.openURL("mailto:support@verisurf.com")
                    }
                  >
                    <Ionicons
                      name="mail"
                      color={EStyleSheet.value("$textColor")}
                      size={RFPercentage(3)}
                    />
                    <Text style={styles.text}>support@verisurf.com</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* End Support Sction*/}

            {/* Sign Out Section */}
            <View style={styles.container}>
              <TouchableOpacity onPress={this._signOutAsync}>
                <View style={styles.containerSection}>
                  <Text style={{ fontSize: RFValue(15), color: "red" }}>
                    Sign Out
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            {/* End Sign Out Section */}

            {/* End Section Seperator & Social Media Icons */}
            <View style={styles.endSeperator}>
              <SocialIcon
                type="twitter"
                raised
                light={this.props.dark_mode ? false : true}
                onPress={() => Linking.openURL("https://twitter.com/verisurf")}
              />
              <SocialIcon
                type="linkedin"
                raised
                light={this.props.dark_mode ? false : true}
                onPress={() =>
                  Linking.openURL("https://www.linkedin.com/company/verisurf/")
                }
              />
              <SocialIcon
                type="facebook"
                raised
                light={this.props.dark_mode ? false : true}
                onPress={() =>
                  Linking.openURL("https://www.facebook.com/verisurf/")
                }
              />
              <SocialIcon
                type="instagram"
                raised
                light={this.props.dark_mode ? false : true}
                onPress={() =>
                  Linking.openURL("https://www.instagram.com/verisurf/")
                }
              />
              <SocialIcon
                type="youtube"
                raised
                light={this.props.dark_mode ? false : true}
                onPress={() =>
                  Linking.openURL(
                    "https://www.youtube.com/channel/UCRaDH0ERMqN5Zrz9pUjzwyw"
                  )
                }
              />
            </View>
            {/* Powered by Section */}
            <View
              style={
                {
                  // borderTopWidth: 0,
                  // borderColor: "white",
                  // flexDirection: "row",
                  // justifyContent: "space-evenly",
                  // paddingTop: 5,
                  // paddingBottom: 20,
                  // backgroundColor: "pink"
                }
              }
            >
              <SocialIcon
                button
                title="Powered by the Verisurf API"
                backgroundColor="pink"
                raised={false}
                padding={10}
                // iconStyle={{
                //   borderRadius: 0,
                //   backgroundColor: 'transparent',
                //   borderWidth: 0,
                //   shadowOpacity: 0,
                //   elevation: 0,
                // }}""
                underlayColor="$cardColor"
                style={{ backgroundColor: "rgb(39,39,39)" }}
                // light={this.props.dark_mode ? false : true}
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
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updating_value: (value, name) =>
      dispatch({ type: "UPDATING_VALUE", value, name }),
    finalizetol: (text) => dispatch({ type: "FINALIZE_TOL", text }),
    themeswitch: (value, name) =>
      dispatch({ type: "THEME_SWITCH", value, name }),

    toggleswitch: (value, name) =>
      dispatch({ type: "TOGGLE_SWITCH", value, name }),
    themeswitch: (value, name) =>
      dispatch({ type: "THEME_SWITCH", value, name }),
    change_value_only: (value, name) =>
      dispatch({ type: "CHANGE_VALUE", value, name }),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);

const styles = EStyleSheet.create({
  containerList: {
    flex: 1,
    // backgroundColor: '#000',
    padding: 10,
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
  listItemContainer: {
    overflow: "hidden",
    backgroundColor: "#333333",
    paddingBottom: 20,
    flex: 1,
    backgroundColor: "#000",
    padding: 10,
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
    paddingBottom: 20,
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
  footer: {},
  footerText: {
    alignSelf: "center",
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
