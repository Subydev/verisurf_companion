import React, { useState, useRef } from "react";
import { 
  Modal, 
  View, 
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  Keyboard,
  Platform
} from "react-native";
import { Input } from "react-native-elements";
import EStyleSheet from "react-native-extended-stylesheet";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

const TolModal = (props) => {
  const {
    modalVisible,
    setModalVisible,
    in_tolerance_color,
    oot_pos_color,
    oot_neg_color,
    onColorSubmit,
  } = props;

  const [inTolCol, setInTolCol] = useState(in_tolerance_color);
  const [ootPosCol, setOotPosCol] = useState(oot_pos_color);
  const [ootNegCol, setOotNegCol] = useState(oot_neg_color);

  const submitColor = (reduxVal, hexValue) => {
    const matcher = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi;
    const x = matcher.exec(hexValue);
    if (x == null || x == undefined) {
      if (reduxVal === "in_tolerance_color") {
        setInTolCol("");
      } else if (reduxVal === "oot_pos_color") {
        setOotPosCol("");
      } else {
        setOotNegCol("");
      }
    } else {
      onColorSubmit(reduxVal, x[0]);
    }
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const resetColors = () => {
    setInTolCol("#1FCC4D");
    setOotPosCol("#2573FF");
    setOotNegCol("#FF0000");
    submitColor("in_tolerance_color", "#1FCC4D");
    submitColor("oot_pos_color", "#2573FF");
    submitColor("oot_neg_color", "#FF0000");
  };

  const renderColorInput = (label, value, onChange, onSubmit) => (
    <View style={styles.colorInputContainer}>
      <Text style={styles.colorLabel}>{label}</Text>
      <View style={[styles.colorPreview, { backgroundColor: value }]} />
      <Input
        containerStyle={styles.input}
        inputStyle={styles.inputText}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        returnKeyType="done"
        onBlur={dismissKeyboard}
      />
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Tolerance Colors</Text>
            {renderColorInput(
              "In Tolerance",
              inTolCol,
              (text) => {
                setInTolCol(text);
                if (text.match(/#[0-9a-f]{6}|#[0-9a-f]{3}/gi)) {
                  submitColor("in_tolerance_color", text);
                }
              },
              () => submitColor("in_tolerance_color", inTolCol)
            )}
            {renderColorInput(
              "Heavy OOT",
              ootPosCol,
              (text) => {
                setOotPosCol(text);
                if (text.match(/#[0-9a-f]{6}|#[0-9a-f]{3}/gi)) {
                  submitColor("oot_pos_color", text);
                }
              },
              () => submitColor("oot_pos_color", ootPosCol)
            )}
            {renderColorInput(
              "Negative OOT",
              ootNegCol,
              (text) => {
                setOotNegCol(text);
                if (text.match(/#[0-9a-f]{6}|#[0-9a-f]{3}/gi)) {
                  submitColor("oot_neg_color", text);
                }
              },
              () => submitColor("oot_neg_color", ootNegCol)
            )}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={resetColors}>
              <Text style={styles.buttonText}>Reset Colors</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = EStyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '$cardColor',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: RFValue(20),
    fontWeight: 'bold',
    color: '$textColor',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorInputContainer: {
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: RFValue(16),
    color: '$textColor',
    marginBottom: 10,
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '$textColor',
  },
  inputText: {
    color: '$textColor',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: RFValue(16),
  },
});

export default TolModal;