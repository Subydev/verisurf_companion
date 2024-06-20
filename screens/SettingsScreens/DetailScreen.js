import React from 'react';
import { View, Text } from 'react-native';
import SettingsSubPage from '../../components/SettingsSubPage';
import { Input, Slider } from 'react-native-elements';

const DetailScreen = ({ route, navigation }) => {
  const { title } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     marginBottom: 20,
//   },
// });

export default DetailScreen;