Requirements:

node js --release
expo sdk 36

npm install -g expo-cli
npm install
npm start

{
  "main": "./AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject",
    "test": "jest --watchAll"
  },
  "jest": {
    "preset": "jest-expo"
  },
  "dependencies": {
    "@expo/config-plugins": "~6.0.0",
    "@expo/samples": "~3.0.3",
    "@expo/vector-icons": "^13.0.0",
    "@expo/webpack-config": "^18.0.1",
    "@react-native-async-storage/async-storage": "1.17.11",
    "@react-native-community/netinfo": "9.3.7",
    "@react-native-picker/picker": "2.4.8",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "@react-navigation/drawer": "^6.6.15",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/stack": "^6.3.29",
    "@reduxjs/toolkit": "^2.2.5",
    "babel-preset-expo": "^9.3.0",
    "core-js": "^3.37.1",
    "expo": "^48.0.21",
    "expo-asset": "~8.9.1",
    "expo-barcode-scanner": "~12.3.2",
    "expo-constants": "~14.2.1",
    "expo-font": "~11.1.1",
    "expo-module-scripts": "^3.5.2",
    "expo-notifications": "~0.18.1",
    "expo-splash-screen": "~0.18.2",
    "expo-web-browser": "~12.1.1",
    "fast-xml-parser": "^3.21.1",
    "glob": "^10.4.1",
    "he": "^1.2.0",
    "install": "^0.13.0",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.71.14",
    "react-native-animatable": "^1.3.2",
    "react-native-collapsible": "^1.5.1",
    "react-native-elements": "^3.4.3",
    "react-native-extended-stylesheet": "^0.12.0",
    "react-native-gesture-handler": "~2.9.0",
    "react-native-indicators": "^0.16.0",
    "react-native-progress": "^3.6.0",
    "react-native-reanimated": "~2.14.4",
    "react-native-responsive-fontsize": "^0.2.3",
    "react-native-root-toast": "^3.2.0",
    "react-native-safe-area-context": "4.5.0",
    "react-native-screens": "~3.20.0",
    "react-native-table-component": "^1.2.1",
    "react-native-web": "~0.18.10",
    "react-navigation": "^4.4.4",
    "react-redux": "^7.2.5",
    "react-xml-parser": "^1.1.3",
    "redux": "^4.0.4",
    "redux-persist": "^6.0.0",
    "redux-starter-kit": "^0.0.2",
    "redux-thunk": "^2.3.0",
    "rimraf": "^5.0.7",
    "typescript": "^4.9.4",
    "uuid": "^10.0.0",
    "xml2js": "^0.6.0",
    "xmldom": "^0.1.27"
  },
  "devDependencies": {
    "@babel/plugin-proposal-unicode-property-regex": "^7.18.6",
    "babel-preset-expo": "^9.3.0",
    "jest-expo": "^48.0.0"
  },
  "private": true
}
