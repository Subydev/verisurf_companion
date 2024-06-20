import React, { useState, useRef } from "react";
import { Modal, View, TouchableHighlight, Button } from "react-native";
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
    // submitColor,
  } = props;

  const [inTolCol, setInTolCol] = useState(in_tolerance_color);
  const [ootPosCol, setOotPosCol] = useState(oot_pos_color);
  const [ootNegCol, setOotNegCol] = useState(oot_neg_color);

  // const inTolText = useRef();
  // const ootPosText = useRef();
  // const ootNegText = useRef();

  // const submitColor = (reduxVal, hexValue) => {
  //   const matcher = /#[0-9a-f]{6}|#[0-9a-f]{3}/gi;
  //   const x = matcher.exec(hexValue);
  //   if (x == null || x == undefined) {
  //     if (reduxVal === "in_tolerance_color") {
  //       setInTolCol("");
  //     } else if (reduxVal === "oot_pos_color") {
  //       setOotPosCol("");
  //     } else {
  //       setOotNegCol("");
  //     }
  //   } else {
  //     onColorSubmit(reduxVal, x[0]);
  //   }
  // };

  const resetColors = () => {
    setInTolCol("#1FCC4D");
    setOotPosCol("#2573FF");
    setOotNegCol("#FF0000");
    onColorSubmit("in_tolerance_color", "#1FCC4D");
    onColorSubmit("oot_pos_color", "#2573FF");
    onColorSubmit("oot_neg_color", "#FF0000");
  };

  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View
        style={{
          margin: RFPercentage(5),
          height: RFPercentage(90),
          marginBottom: RFPercentage(0),
        }}
      >
        <View
          style={{
            paddingTop: RFValue(10),
            flexWrap: "wrap",
            backgroundColor: EStyleSheet.value("$cardColor"),
            flex: 2,
            flexDirection: "row",
            justifyContent: "space-around",
            borderWidth: 1,
            borderRadius: 10,
          }}
        >
          <TouchableHighlight
            style={[
              styles.colorCircle,
              {
                borderColor: inTolCol,
                marginTop: RFPercentage(5),
              },
            ]}
          >
            <View
              style={[
                styles.innerCircle,
                {
                  backgroundColor: inTolCol,
                  borderColor: inTolCol,
                },
              ]}
            ></View>
          </TouchableHighlight>

          <Input
            label={"In Tolerance"}
            labelStyle={{ color: EStyleSheet.value("$textColor") }}
            inputContainerStyle={{
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: EStyleSheet.value("$textColor"),
            }}
            containerStyle={{
              width: 150,
              height: 50,
              alignSelf: "center",
              marginTop: RFPercentage(5),
            }}
            inputStyle={{ color: EStyleSheet.value("$textColor") }}
            placeholderTextColor={EStyleSheet.value("$textColor")}
            placeholder={inTolCol}
            onChangeText={(text) => setInTolCol(text)}
            onSubmitEditing={() =>
              onColorSubmit("in_tolerance_color", inTolCol)
            }
            value={inTolCol}
          />

          <TouchableHighlight
            style={[
              styles.colorCircle,
              {
                borderColor: ootPosCol,
                marginTop: RFPercentage(5),
              },
            ]}
          >
            <View
              style={[
                styles.innerCircle,
                {
                  backgroundColor: ootPosCol,
                  borderColor: ootPosCol,
                },
              ]}
            ></View>
          </TouchableHighlight>

          <Input
            label={"Heavy OOT"}
            labelStyle={{ color: EStyleSheet.value("$textColor") }}
            ref={this.ootPosText}
            inputContainerStyle={{
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: EStyleSheet.value("$textColor"),
            }}
            containerStyle={{
              width: 150,
              height: 50,
              alignSelf: "center",
              marginTop: RFPercentage(5),
            }}
            inputStyle={{ color: EStyleSheet.value("$textColor") }}
            placeholder={oot_pos_color}
            placeholderTextColor={EStyleSheet.value("$textColor")}
            onChangeText={(text) => setOotPosCol(text)}
            onSubmitEditing={() => onColorSubmit("oot_pos_color", ootPosCol)}
            value={ootPosCol}
          />

          <TouchableHighlight
            style={[
              styles.colorCircle,
              {
                borderColor: ootNegCol,
                marginTop: RFPercentage(5),
              },
            ]}
          >
            <View
              style={[
                styles.innerCircle,
                {
                  backgroundColor: ootNegCol,
                  borderColor: ootNegCol,
                },
              ]}
            ></View>
          </TouchableHighlight>

          <Input
            label={"Negative OOT"}
            labelStyle={{ color: EStyleSheet.value("$textColor") }}
            ref={this.ootNegText}
            inputContainerStyle={{
              alignSelf: "center",
              justifyContent: "center",
              alignItems: "center",
              borderBottomWidth: 1,
              borderColor: EStyleSheet.value("$textColor"),
            }}
            containerStyle={{
              width: 150,
              height: 50,
              alignSelf: "center",
              marginTop: RFPercentage(5),
            }}
            inputStyle={{ color: EStyleSheet.value("$textColor") }}
            placeholder={ootNegCol}
            placeholderTextColor={EStyleSheet.value("$textColor")}
            onChangeText={(text) => setOotNegCol(text)}
            onSubmitEditing={() => onColorSubmit("oot_neg_color", ootNegCol)}
            value={ootNegCol}
          />
          <View style={{ marginTop: RFPercentage(10) }}>
            <Button
              title="Reset Colors"
              onPress={resetColors}
              color="#007AFF"
            />
          </View>
          <View style={{ marginTop: RFPercentage(10) }}>
            <Button
              title="Close Window"
              onPress={() => setModalVisible(false)}
              color="#B13034"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = EStyleSheet.create({
  colorCircle: {
    margin: RFValue(10),
    padding: 10,
    borderWidth: 3,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    height: RFValue(75),
    width: RFValue(75),
  },
  innerCircle: {
    borderWidth: 1,
    borderRadius: 50,
    alignSelf: "center",
    height: RFValue(55),
    width: RFValue(55),
  },
});

export default TolModal;
