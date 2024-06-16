import React from "react";
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import dark from './dark';
import light from './light';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ThemeProvider extends React.Component {
  async componentDidMount() {
    try {
      console.log('ThemeProvider: componentDidMount');
      const persistedData = await AsyncStorage.getItem('persist:root');
      if (persistedData) {
        const { dark_mode } = JSON.parse(persistedData);
        console.log('ThemeProvider: Persisted dark_mode', dark_mode);
        this.buildTheme(dark_mode === 'true');
      }
    } catch (error) {
      console.log('ThemeProvider: Error retrieving persisted data', error);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.dark_mode !== this.props.dark_mode) {
      console.log('ThemeProvider: dark_mode changed, rebuilding theme');
      this.buildTheme(this.props.dark_mode);
    }
  }

  buildTheme(darkMode) {
    console.log('ThemeProvider: Building theme, darkMode:', darkMode);
    const theme = darkMode ? dark : light;
    EStyleSheet.build(theme);
  }

  render() {
    console.log('ThemeProvider: Rendering');
    return null;
  }
}

function mapStateToProps(state) {
  return {
    dark_mode: state.dark_mode,
  };
}

export default connect(mapStateToProps)(ThemeProvider);
