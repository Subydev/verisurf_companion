import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            paddingLeft={20}
            color={EStyleSheet.value("$textColor")}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
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
    </View>
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
    // paddingHorizontal: 10,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "$textColor",
    marginBottom: 20, // Add margin to the title

  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  content: {
    backgroundColor: "$cardColor",
        marginTop: 20, // Add margin to the content container

    borderRadius: 10,
    padding: 20,
    width: "90%",
    alignSelf: "center",
  },
  inputInnerContainer: {
    paddingHorizontal: 10,
  },
});
