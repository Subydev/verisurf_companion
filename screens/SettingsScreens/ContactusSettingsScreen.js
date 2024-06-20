import React from 'react';
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
} from "react-native";import SettingsSubPage from '../../components/SettingsSubPage';
import {
  Slider,
  Input,
  SocialIcon,
  Tooltip,
  ListItem,
  Icon,
} from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from "@expo/vector-icons";

const ContactusSettingsScreen = (props) => {
  const {
    navigation,
    updating_value,
    change_value_only,
    dark_mode,
    decimal_places,
    auto_response_time,
    device_number
  } = props;
  return (
    <SettingsSubPage
    title="Contact Us"
    navigation={navigation}
    updating_value={updating_value}
    change_value_only={change_value_only}
    dark_mode={dark_mode}
    decimal_places={decimal_places}

  >


    <View >
      <Text style={styles.text} numberOfLines={1} ellipsizeMode={"tail"}>
      </Text>
    </View>

    <View>
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

            </View>

  </SettingsSubPage>
  );
};

export default ContactusSettingsScreen;

const styles = EStyleSheet.create({
  text: {
    // flex: 6,
    flexDirection: "row",
    fontSize: RFValue(15),
    color: "$textColor",
    margin: RFValue(10),
    marginRight: 0,
    padding: 0,
    opacity: 0.8,
  },
  containerInnerSection: {
    // flex: 1,
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-evenly",
  },
  containerEndSection: {
    // flex: 1,
    height: RFValue(80),
    borderRadius: 1,
    borderBottomWidth: 0.1,
    borderColor: "$cardColor",
    opacity: 1,
  },
});
