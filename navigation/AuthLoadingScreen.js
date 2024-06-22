import React from "react";
import { ActivityIndicator, View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import EStyleSheet from "react-native-extended-stylesheet";

class AuthLoadingScreen extends React.Component {
  componentDidMount() {
    this._bootstrapAsync();
  }

  _bootstrapAsync = async () => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      console.log("User token retrieved:", userToken);

      if (userToken) {
        // User token exists, navigate to the App screen
        console.log("Navigating to App screen");
        this.props.navigation.navigate("App");
      } else {
        // User token doesn't exist, navigate back to the SignIn screen
        console.log("Navigating back to SignIn screen");
        this.props.navigation.navigate("SignIn");
      }
    } catch (error) {
      console.error("Error in _bootstrapAsync:", error);
      // Handle the error appropriately (e.g., show an error message to the user)
      this.props.navigation.navigate("SignIn");
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={EStyleSheet.value("$textColor")} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "$bgColor",
  },
  loadingText: {
    fontSize: 18,
    color: "$textColor",
    marginTop: 10,
  },
});

export default AuthLoadingScreen;