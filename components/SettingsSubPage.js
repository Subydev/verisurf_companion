import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { connect } from "react-redux";
import EStyleSheet from "react-native-extended-stylesheet";
import { Ionicons } from "@expo/vector-icons";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

const SettingsSubPage = ({
  title,
  children,
  navigation,
  updating_value,
  change_value_only,
  dark_mode,
  decimal_places,
  containerWidth, 
  containerPadding,
  containercardColor,
}) => {
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={EStyleSheet.value("$textColor")}
          />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.placeholderButton} />
      </View>
      <View
        style={[
          styles.content,
          containerWidth && { width: containerWidth },
          containerPadding && { padding: containerPadding },
          containercardColor && { backgroundColor: containercardColor },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const mapDispatchToProps = (dispatch) => ({
  updating_value: (value, name) =>
    dispatch({ type: "UPDATING_VALUE", value, name }),
  change_value_only: (value, name) =>
    dispatch({ type: "CHANGE_VALUE", value, name }),
  updating_value: (value, name) =>
    dispatch({ type: "UPDATING_VALUE", value, name }),
  finalizetol: (text) => dispatch({ type: "FINALIZE_TOL", text }),
  themeswitch: (value, name) => dispatch({ type: "THEME_SWITCH", value, name }),

  toggleswitch: (value, name) =>
    dispatch({ type: "TOGGLE_SWITCH", value, name }),
  themeswitch: (value, name) => dispatch({ type: "THEME_SWITCH", value, name }),
  change_value_only: (value, name) =>
    dispatch({ type: "CHANGE_VALUE", value, name }),
});

export default connect(null, mapDispatchToProps)(SettingsSubPage);

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "$bgColor",
    paddingTop: Platform.OS === 'ios' ? 0 : 40, // Adjust for Android
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    height: 44, // Standard height for iOS navigation bar
    marginBottom: 20,
  },
  backButton: {
    padding: 10, // Increase touch area
    width: 44, // Set a fixed width
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: "medium", // "bold" on iOS, "700" on Android
    color: "$textColor",
    textAlign: 'center',
  },
  placeholderButton: {
    width: 44, // Matches the width of backButton
  },
  content: {
    backgroundColor: "$cardColor",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    alignSelf: "center",
  },
  inputInnerContainer: {
    paddingHorizontal: 10,
  },
});
