import React from 'react';
import {
  ActivityIndicator,
  Keyboard,
  View,
  Image,
  Linking,
  Alert,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Input } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EStyleSheet from 'react-native-extended-stylesheet';
import {connect} from 'react-redux';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import NetInfo from "@react-native-community/netinfo";

class SignInScreen extends React.Component {
  constructor(){
    super();
    console.log('SignInScreen: Constructor');
  }

  state = {
    IPAddress: '',
    port: '',
    errormsg: '',
    ip_error: '',
    port_error: '',
    loading: false,
  };

  componentDidMount(){
    console.log('SignInScreen: Component did mount');
    this.setState({IPAddress: this.props.IPAddress, port: this.props.port});

    NetInfo.fetch().then(state => {
      console.log('SignInScreen: Network state', state);
      if (state.type !== "wifi") {
        Alert.alert(
          'No WiFi Connection Found',
          `You must be connected to the same wireless network as the Verisurf PC.`,
          [{text: 'Ok'}]
        );
      }
    });
  }

  loginPressed= () => {
    console.log('SignInScreen: Login button pressed');
    if(this.state.IPAddress === ''){
      console.log('SignInScreen: IPAddress is empty');
      this.props.change_value_only('', 'IPAddress');
      this.props.change_value_only('red', 'statusColor');
      this.props.navigation.navigate('App');
    }
    this.setState({loading: true, ip_error: '', port_error: ''});

    if(this.state.IPAddress.length == 0 || this.state.port.length == 0){
      console.log('SignInScreen: Missing IPAddress or port');
      if(this.state.IPAddress.length == 0){
        this.setState({ip_error: 'Please enter an IP Address.'});
      }
      if(this.state.port.length == 0){
        this.setState({port_error: 'Please enter a port number.'});
      }

      this.setState({loading: false});
      return;
    }

    var ws = new WebSocket("ws://" + this.state.IPAddress + ":" + this.state.port);
    ws.onopen = () => { 
      console.log('SignInScreen: WebSocket connection opened');
      this.props.change_value_only(this.state.IPAddress, 'IPAddress');
      this.props.change_value_only(this.state.port, 'port');
      this._signInAsync(); 
    };

    ws.onerror = (error) => {
      console.error('SignInScreen: WebSocket error', error);
      this.setState({loading: false, ip_error: 'Connection error. Unable to login.', port_error: 'Connection error. Unable to login.'});
    };
  };

  static navigationOptions = {
    header: null
  };

  render() {
    console.log('SignInScreen: Rendering');
    return (
      <KeyboardAvoidingView style={styles.containerView} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.loginScreenContainer}>
            <Image
              style={{ flex: 1, borderWidth: 0, alignSelf: 'center', alignContent: 'center', paddingBottom: RFPercentage(20) }}
              source={this.props.dark_mode ? require('../assets/images/verisurf.png'):require('../assets/images/verisurfblk.png')}
              resizeMode="contain"
            />
            <View style={styles.inputSection}>
              <View style={styles.textForms}>
                <Input
                  containerStyle={{borderWidth: 0, paddingBottom: RFPercentage(2)}}
                  inputContainerStyle={styles.hello}
                  inputStyle={styles.loginFormTextInput}
                  clearButtonMode="while-editing"
                  underlineColorAndroid="transparent"
                  placeholder="IP Address"
                  placeholderTextColor={EStyleSheet.value('$textColor')}
                  onChangeText={ (text) => {
                    if(this.state.ip_error.length > 0){
                      this.setState({ip_error: ''});
                    }
                    this.setState({ IPAddress: text.replace(/,/g, '.') });
                  }}
                  value={this.state.IPAddress}
                  borderBottomWidth={1.5}
                  borderColor={EStyleSheet.value('$textColor')}
                  keyboardType="numeric"
                  errorMessage={this.state.ip_error}
                  errorStyle={{paddingLeft: 10, fontSize: 12, margin: 0, paddingBottom: 0}} 
                />
                <Input
                  containerStyle={{borderWidth: 0}}
                  inputContainerStyle={styles.hello}
                  inputStyle={styles.loginFormTextInput}
                  clearButtonMode="while-editing"
                  underlineColorAndroid="transparent"
                  placeholder="Port"
                  placeholderTextColor={EStyleSheet.value('$textColor')}
                  onChangeText={(text) => {
                    if(this.state.port_error.length > 0){
                      this.setState({port_error: ''});
                    }
                    this.setState({ port: text });
                  }}
                  value={this.state.port}
                  borderBottomWidth={1.5}
                  borderColor={EStyleSheet.value('$textColor')}
                  keyboardType={'number-pad'}
                  onSubmitEditing={() => { Keyboard.dismiss(); this.loginPressed(); }}
                  errorMessage={this.state.port_error}
                  errorStyle={{paddingLeft: 10, fontSize: 12, marginBottom: 0, paddingBottom: 0}}
                  // errorProps={style={marginBottom: 0, paddingBottom: 0}}
                />
              </View>
            </View> 
            <View>
            <TouchableOpacity
                onPress={this.loginPressed}
                style={styles.loginContainer}
>
                <View style={styles.loginInner}>
                  <Text style={{fontSize: RFValue(20), color: EStyleSheet.value('$bgColor')}}>
                    Login
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.help}
                              onPress={() => {
                                Linking.openURL('https://www.verisurf.com/companion-app-help/')
                              }}>
              <Text style={{fontSize: 15, color: EStyleSheet.value('$textColor'), opacity: .7}}> 
                Need help?
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
        {this.state.loading &&
        <View style={styles.loading}>
          <ActivityIndicator size='large' />
        </View>}
      </KeyboardAvoidingView>
    );
  }

  _signInAsync = async () => {
    console.log('SignInScreen: Signing in asynchronously');
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('AuthLoading');
  };
}

function mapStateToProps(state){
  return {
    dark_mode: state.dark_mode,
    IPAddress: state.IPAddress,
    port: state.port,
  };
}

function mapDispatchToProps(dispatch){
  return {
    change_value_only: (value, name) => dispatch({type: 'CHANGE_VALUE', value, name})
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);

const styles = EStyleSheet.create({
  hello:{
    borderWidth: 0,
    borderBottomWidth: 0
  },
  help: {
    padding: RFPercentage(2.3),
    alignSelf: 'center',
  },
  inputSection: {
    marginTop: RFPercentage(5),
    paddingBottom: RFPercentage(2),
  },
  textForms:{
  
  },
  container: {
    flex: 1,
    backgroundColor: '$bgColor',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  compText: {
    fontSize: 22,
  },
  loginContainer: {
    marginRight: RFValue(80),
    marginLeft: RFValue(80),
    marginTop: RFValue(100),
    marginBottom: RFValue(10),
    shadowColor: '$bgColor',
    shadowOffset: {
        width: 0,
        height: 1,
      },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
    backgroundColor: '$textColor',
    borderRadius: 30,
  },
  loginInner: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  loginScreenContainer: {
    borderWidth: 0,
    paddingTop: RFValue(50),
    marginTop: RFValue(50),
  },
  containerView: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: '$bgColor',
  },
  loginFormTextInput: {
    height: 45,
    fontSize: 20,
    marginLeft: 15,
    marginRight: 15,
    marginTop: 30,
    marginBottom: 0,
    color: '$textColor',
  },
  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
