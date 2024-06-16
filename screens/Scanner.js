import * as React from 'react';
import { Text, View, StyleSheet, Button, ActivityIndicator, Alert } from 'react-native';
import { BarCodeScanner, Camera } from 'expo-barcode-scanner'; // Add import for Camera here
import {connect} from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { returnStatement } from '@babel/types';
import Toast from 'react-native-root-toast';
import { RFPercentage } from 'react-native-responsive-fontsize';

class Scanner extends React.Component {
    static navigationOptions = () => ({
        title: 'QR Scanner',
        headerTintColor: '#B13034',
        headerStyle: {
            backgroundColor: EStyleSheet.value('$bgColor')
        },
      })


  state = {
    hasCameraPermission: null,
    scanned: false,
    loading: false,
    visible: false,
    filename: '',
  };

  async componentDidMount() {
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    this.setState({ hasCameraPermission: status === 'granted' });
  };
  render() {
    const { hasCameraPermission, scanned } = this.state;

    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>;
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    }
    return (
        
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: EStyleSheet.value('$bgColor')
        }}>
            
        <View style={{
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
        
        
        </View>

        <Toast
          visible={this.state.visible}
          position={RFPercentage(50)}
          shadow={true}
          animation={true}
          hideOnPress={true}>
            Successfully loaded file: {this.state.filename}
          </Toast>
        
        {!this.state.loading &&  <BarCodeScanner onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                                  style={StyleSheet.absoluteFillObject}
        />}
        <ActivityIndicator size="large" color="#0000ff" animating={this.state.loading} style={StyleSheet.absoluteFillObject} />


        {scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />
        )}
      </View>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    if(this.props.IPAddress == ''){
        Alert.alert(
            'No connection',
            'The app is in preview mode, and does not have a connection.\n\nIn order to scan QR codes, a connection is required.',
            [
                {text:'Ok'}
            ]
        )
        this.setState({scanned: true})
        return;
    }

    if(data.length == 0){
      Alert.alert(
        'No Data',
        'The scanned code contained no data. Please try a different code.',
        [
          {text: 'Ok'}
        ]
      )
      this.setState({scanned: true})
      return;
    }

    else{
      var regx = /\w[:][\\][^?!@#$%\^&*()=+<>'";:|]*[.][m][c][a][m]/gi
      var matchedarray = regx.exec(data)
      console.log(matchedarray)
      if(matchedarray[0] != undefined || matchedarray[0] != null){
        var filepath = matchedarray[0]
        console.log(filepath)
      }
      else{
        Alert.alert(
          'Invalid Filepath',
          'The filepath found in this QR code is invalid. Please assure the code has the correctly copied and pasted filepath.',
          [
            {text: 'Ok'}
          ]
        )
        return;
      }
    }

    this.setState({ scanned: true, loading: true, });
    var ws = new WebSocket( "ws://" + this.props.IPAddress + ":" + this.props.port );
    ws.onopen = () => {
        ws.send("<File_Open filename=\"" + filepath + "\" />")
    }

    ws.onmessage = () => {
        ws.close()
        this.setState({loading: false})
        this.props.change_value_only(true, 'new_plan_loaded')
        var regxp = /[ \w-]+?(?=\.[m][c][a][m])/gm
        var matched = regxp.exec(filepath)
        this.setState({filename: matched[0], visible: true})

        //this.props.navigation.navigate('Settings')
    }

    ws.onerror = () => {
        console.log('error!')
        Alert.alert(
            'Connection Error',
            'A problem occurred while opening the file. Please try again.',
            [
                {text: 'Ok'}
            ]
        )
        this.setState({loading: false})
    }
  };
}

function mapStateToProps(state){
    return{
      IPAddress: state.IPAddress,
      port: state.port,
      dark_mode: state.dark_mode,
      new_plan_loaded: state.new_plan_loaded
    }
  }

  function mapDispatchToProps(dispatch){
    return{
      change_value_only: (value, name) => dispatch({type: 'CHANGE_VALUE', value, name})
    }
  }


export default connect(mapStateToProps, mapDispatchToProps)(Scanner)