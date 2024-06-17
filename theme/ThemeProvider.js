import React from "react";
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import dark from './dark';
import light from './light';
import { changeTheme } from './themeActions';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ThemeProvider extends React.Component {
  componentDidMount() {
    this.buildTheme(this.props.dark_mode);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.dark_mode !== this.props.dark_mode) {
      console.log('ThemeProvider: dark_mode changed, rebuilding theme');
      this.buildTheme(this.props.dark_mode);
      this.props.changeTheme(); // Dispatch the action
    }
  }
  buildTheme(darkMode) {
    console.log('ThemeProvider: Building theme, darkMode:', darkMode);
    const theme = darkMode ? dark : light;
    EStyleSheet.build(theme);
  }

  render() {
    console.log('ThemeProvider: Rendering');
    return this.props.children;
  }
}
const mapDispatchToProps = {
  changeTheme,
};
const mapStateToProps = (state) => ({
  dark_mode: state.dark_mode,
});

export default connect(mapStateToProps, mapDispatchToProps)(ThemeProvider);