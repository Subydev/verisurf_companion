import React from "react";
import {
  ScrollView,
  View,
  Text,
  Animated,
  RefreshControl,
  Keyboard,
  Alert,
  Dimensions
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from "@react-native-picker/picker";
import EStyleSheet from 'react-native-extended-stylesheet';
import Accordion from 'react-native-collapsible/Accordion';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
import { Ionicons } from '@expo/vector-icons';
import { Input } from 'react-native-elements';
import {connect} from 'react-redux';
import { withNavigationFocus } from 'react-navigation';

//data for all sections
var SECTIONS = [];
//data from sections that were removed during search queries
var deleted = [];

//If the picker only has one object, it calls it's own onChangeValue function with index 0,
//This will trigger a refresh event. The did load variable handles this situation
//to prevent unecessary loading. This greatly helps with large plans,
//as loading time would be DOUBLED. DO NOT DELETE OR TAMPER WITH THIS VARIABLE
var did_load = 0;

const windowWidth = Dimensions.get('window').width;

class DroScreen extends React.Component {

  static navigationOptions = () => ({
    header:
      null,
  })

  constructor(props) {
    super(props);

    //React.createRef so we may manipulate the search form text boxes.
    this.searchForm = React.createRef();
    //Helper variable for plan organizing
    this.currentPlan = undefined;

    //Helper variable to check if its safe to run state updates in the background.
    //This is helpful in the case where a user wants to scan a QR code to load in a new project.
    //This triggers reports to load in the data, but if reports hasn't been visited yet or "mounted",
    //It causes a memory leak.
    this._isMounted = false;

    //Initializes the websocket as long as we are not in preview mode.
    //Remember: preview mode is accessed when IP is left blank on sign in.
    if(this.props.IPAddress != ''){
      this.ws = new WebSocket("ws://" + this.props.IPAddress + ":"+ this.props.port);
    }

    //listens to screen rotations and sets width accordingly.
    Dimensions.addEventListener('change', () => {
      this.setState({
        device_width: Dimensions.get('window').width
      });
    });

    this.state={
      activeSections: [],
      decimal_places: undefined,
      headers: [],
      animValue: [],
      refreshing: false,
      search: '',
      plan_number: undefined,
      plan_name: '',
      num_of_objects: 0,
      device_width: Dimensions.get('window').width,
      device_height: Dimensions.get('window').height,
      totalPlans: 0,
      all_plans: [],
    }
  }

  //clears all data for refresh and remount events
  CLEAR_DATA = () => {
    did_load = 0;
    SECTIONS = [];
    deleted = [];
    this.state.all_plans = [];
    this.setState({activeSections: [], headers: [], animValue: [], search: '', plan_number: undefined})
  }

  componentDidUpdate(prevProps){

    if(this.props.IPAddress === ''){
      return;
    }

    //if the screen is now focused, soft reset-> did_load var helps with
    //react native bug regarding picker components.
    if(prevProps.isFocused == false && this.props.isFocused== true){

    }
  }


  UNSAFE_componentWillReceiveProps(prevProps){
    
    //Handles when preferences are changed,
    //Will close all sections, and flip all accordion icons
    //Important** when accordions are expanded and we receive props,
    //coming back to this component will result in unopened accordions,
    //with incorrectly flipped accordion icons.
    if(this.props.decimal_places != prevProps.decimal_places || this.props.dark_mode != prevProps.dark_mode){
      for(x in this.state.activeSections){
        this.handleSelect(this.state.activeSections[x])
        this.setState({activeSections: []})
      }
    }

    //Refreshes the component in events where a QR code was scanned to load a new plan.
    if(this.props.new_plan_loaded == true && this._isMounted == true){
      this.onRefresh();
      this.props.change_value_only(false, 'new_plan_loaded')
    }
  }


  componentWillUnmount(){
    did_load = 0;
    this.ws.close();
  }

  componentDidMount(){
    this._isMounted = true;
    if(this.props.IPAddress === ''){
      return;
    }
    did_load=0;
    this._GetData();
  }

  _GetData(q){

    //this will ensure refresh events run properly
    if(this.state.refreshing === false){
      SECTIONS = []
      this.setState({refreshing: true})
      this.ws = new WebSocket("ws://" + this.props.IPAddress + ":"+ this.props.port);
    }

    this.ws.onopen = () => {
      this.props.change_value_only('#1fcc4d', 'statusColor')
      //logic to handle unecessary web socket communications
      if(q != undefined){
        this.ws.send("<Inspect_Plan_Load id=\"" + q + "\" />")
      }
      if(this.state.all_plans.length === 0){
      this.ws.send('<Inspect_Plan_List />');
      }
      this.ws.send("<inspect_plan_info />");
    }

    this.ws.onmessage = ({data}) => {

      if(data.includes("acknowledgement")){

        return;
      }

      if(data.includes("inspect_plan_info")){
        var xmlResult = this._xmlParse(data)
        
        //if the plan is empty, return
        if(xmlResult['response']['success']['data']['inspect_plan_info'] == ''){
          return;
        }

        var currentPlanName = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['Object Name:'])
        //get plan index
        if(this.state.plan_number === undefined){
          this.currentPlan = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['attr']['id'])
          //get and set the plan_number required for the picker component.
          this.setState({ plan_number: this.currentPlan, plan_name: currentPlanName })
        }
        else{
          this.setState({plan_name: currentPlanName})
        }

        //get objects in current plan
        objsInPlan = (xmlResult['response']['success']['data']['inspect_plan_info']['plan']['plan_object'])
        var num_of_objects = 0;
        //if no objects in plan, stop refreshing and return
        if(objsInPlan === undefined){
          this.setState({refreshing: false})
          return;
        }
        //if multiple objects are in the plan...
        else if(Array.isArray(objsInPlan)){ 
          for(var key in objsInPlan){
            num_of_objects += 1;
            let planName = objsInPlan[key]['Object Name:']
            SECTIONS.push(
              {title: planName,
                content:{
              }});
              //append an animated value for each accordion icon
              var joined = this.state.animValue.concat(new Animated.Value(250));
              this.setState({animValue: joined, refreshing: false})
          }
        }
        //if only one object in the plan..
        else{
          num_of_objects = 1;
          SECTIONS.push({
            title: objsInPlan['Object Name:'],
              content:{

              }
          });
          //append an animated value for each accordion icon
          var joined = this.state.animValue.concat(new Animated.Value(250));
          this.setState({animValue: joined, refreshing: false})
        }
        this.setState({num_of_objects: num_of_objects})
      }

      //load plans into plan picker
      if(data.includes('inspect_plan_list')){
        var xmlResult = this._xmlParse(data)
        plans = (xmlResult['response']['success']['data']['plans']['plan'])
        //if no plans, return, stop refreshing.
        if(plans === undefined){
          this.setState({refreshing: false})
          return;
        }
        //if multiple plans...
        else if(Array.isArray(plans)){
          this.setState({totalPlans: plans.length})
          for(var key in plans){
            this.state.all_plans.push(
              <Picker.Item label={plans[key]['Object Name:']} value={plans[key]['attr']['id']} key={plans[key]['attr']['id']} />
            )
          }
      }
        //if only one plan...
        else{
          this.setState({totalPlans: 1})
          this.state.all_plans.push(
            <Picker.Item label={plans['Object Name:']} value={plans['attr']['id']} key={plans['attr']['id']} />
          )
        }
      }
      
    }

    //pushes an alert when the websocket connection drops.
    this.ws.onerror = () => {
      this.setState({refreshing: false})
      this.props.change_value_only('red', 'statusColor')
      Alert.alert(
        'Verisurf Connection Lost.',
        'Click retry to attempt to reconnect the app, or click sign out to return to the main screen.',
        [
          {text:'Sign Out', onPress: () =>{
            AsyncStorage.clear();
            this.props.navigation.navigate("Auth");
          }},
          {text: 'retry', onPress: () => {
            this.CLEAR_DATA();
            this._GetData();
          }}
        ]
      )
    }

  }


  //1 of two handlers for icon animation 
  //decides which direction the icon should point
  handleSelect = (i) => {
    this.state.animValue[i]._value > 250
      ? Animated.timing(this.state.animValue[i], {
          toValue: 250,
          duration: 150,
          useNativeDriver: true,
        }).start()       
      :   
      Animated.timing(this.state.animValue[i], {
          toValue: 450,
          duration: 150,
          useNativeDriver: true,
        }).start();

  };

  //2 of 2 handlers for icon animation - > handles the rotation of drop-down-triangles
  rotateAnimation = (i) => {
    return (
      this.state.animValue[2].interpolate({
        inputRange: [250, 450],
        outputRange: ['0deg', '180deg']
      })
    );
  }

  //renders the header
  _renderHeader = section => {

    let i = SECTIONS.indexOf(section)
    //we need this index to properly assign a rotation value.
    //If we completely left that out, clicking on a header would rotate 
    //every single icon. they NEED individual animation values in state.
    //see -> transform:[{rotate: this.state.animValue[i]}] <-- important thing
   
    if(i === 0){
      var headerstyle = styles.headerFirst
    }
    else{
      var headerstyle = styles.header
    }
    
    return (
        <View style={headerstyle}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{section['title']}</Text>
              <Animated.View style={[{marginLeft: 10}, {transform:[{rotate: this.state.animValue[i].interpolate({
                              inputRange: [250, 450],
                              outputRange: ['0deg', '180deg']})}]}]}>
                <Ionicons name="arrow-down-circle" size={20} color={EStyleSheet.value('$textColor')} />
              </Animated.View>
          </View>
        </View>
    );
  };


  //renders the data inside each header 
  _renderContent = section => {

    //array to hold all the view data
    let views = []
    
    //the actual object data ie x values, y values, etc etc..
    properties = section['content']

    //if the object has properites...
    if(Object.keys(properties).length !== 0){
      for(var key in properties){

        let name = key
        let nom = properties[key]['nom']
        let meas = properties[key]['measured']
        let dev = properties[key]['deviation']

        views.push(
          
          <React.Fragment key={name}>
          
            <View style={[styles.data, {width: this.state.device_width/4.5}]}>
              <Text numberOfLines={1} style={styles.category}> {name} </Text> 
            </View>

            <View style={[styles.data, {width: this.state.device_width/4.5}]}>
              <Text numberOfLines={1} style={styles.category}> {parseFloat(nom).toFixed(this.props.decimal_places)} </Text> 
            </View>

            <View style={[styles.data, {width: this.state.device_width/4.5}]}>
              <Text numberOfLines={1} style={styles.category}> {parseFloat(meas).toFixed(this.props.decimal_places)} </Text> 
            </View>

            <View style={[styles.data, {width: this.state.device_width/4.5}]}>
              <Text numberOfLines={1} style={styles.category}> {parseFloat(dev).toFixed(this.props.decimal_places)} </Text> 
            </View>


          </React.Fragment>

        )
      }
    }
  
  
    return (
      <View style={styles.dataContainer}>

        {/* NAME/ID Header */}
        <View style={[styles.data, {width: this.state.device_width/4.5}]}>
          <Text style={styles.category}></Text>
        </View>

        {/* NOMINAL Header */}
        <View style={[styles.data, {width: this.state.device_width/4.5}]}>
          <Text style={styles.category}>Nom.</Text>
        </View>

        {/* MEASURED Header */}
        <View style={[styles.data, {width: this.state.device_width/4.5}]}>
          <Text style={styles.category}>Act.</Text>
        </View>

        {/* DEVIATION Header */}
        <View style={[styles.data, {width: this.state.device_width/4.5}]}>
          <Text style={styles.category}>Dev.</Text>
        </View> 

        {/* Actual Nom/Meas/Dev Data values */}

        { views }

      </View>
    );
  };

  //handles what happens when you click a header.
  _updateSections = activeSections => {

    //this logic handles if a section was opened or not. activeSections is most recent,
    //and this.state.activeSections was the previously recent. 
    if(activeSections.length > this.state.activeSections.length){
      
      //this index variable will be the most RECENTLY clicked header.
      let objectIndex = activeSections[activeSections.length -1]

      //call the handleSelect method to handle animations 
      
      


      //If it already has data, don't query verisurf. Just display.
      if(Object.keys(SECTIONS[objectIndex]['content']).length > 0){
        this.handleSelect(objectIndex)
        this.setState({ activeSections });
        return;
      }
  
      //Ask verisurf for object data.
      this.ws.send('<inspect_object_info id=\"' + objectIndex + '\" />')    
      this.ws.onmessage = ({data}) => {

      if(data.includes('acknowledgement')){
        return
        }
      else if(data.includes('inspect_object_info')){
        var xmlResult = this._xmlParse(data)
        var objVals = (xmlResult['response']['success']['data']['inspect_object_info']['object']['property'])
        // Check if ObjVals is undefined 
        // (Some items return only a name, so grab the name attr)
        if (objVals === undefined){
          objVals = (xmlResult['response']['success']['data']['inspect_object_info']['object']['Object Name:'])
        }
        let section_to_update = SECTIONS[objectIndex]['content']
        

      if(Array.isArray(objVals)){
        for(var item in objVals){
          let attributes = objVals[item]['attr']
          let categories = [attributes['nominal'], attributes['tolmin'], attributes['tolmax'], attributes['measured'], attributes['deviation']]
          //loop to format data.
          for(item in categories){
            if(categories[item] === undefined){
              categories[item] = parseFloat(0).toFixed(this.props.decimal_places);
            }
            else{
              categories[item] = parseFloat(categories[item]).toFixed(this.props.decimal_places);
            }
          }
          
          //Load up mock section with data
          section_to_update[attributes['name']] = 
          {
            'nom': categories[0],
            'tolmin': categories[1],
            'tolmax': categories[2],
            'measured': categories[3],
            'deviation': categories[4],
          }
        }
      }
      else{
        if(objVals != undefined){
          let attributes = objVals['attr']
          let categories = [attributes['nominal'], attributes['tolmin'], attributes['tolmax'], attributes['measured'], attributes['deviation']]
          for(item in categories){
            if(categories[item] === undefined){
              categories[item] = parseFloat(0).toFixed(this.props.decimal_places);
            }
            else{
              categories[item] = parseFloat(categories[item]).toFixed(this.props.decimal_places);
            }
          }

          section_to_update[objVals['attr']['name']] = 
          {
            'nom': categories[0],
            'tolmin': categories[1],
            'tolmax': categories[2],
            'measured': categories[3],
            'deviation': categories[4],
          }

        }
      }

        this.handleSelect(objectIndex)
        //append mock section to global section
        SECTIONS[objectIndex]['content'] = section_to_update
        this.setState({ activeSections });
      }
      }
      this.ws.onerror = () => {
        Alert.alert(
          'Verisurf Connection Lost.',
          'Click retry to attempt to reconnect the app, or click sign out to return to the main screen.',
          [
            {text:'Sign Out', onPress: () =>{
              AsyncStorage.clear();
              this.props.navigation.navigate("Auth");
            }},
            {text: 'retry', onPress: () => {
              this.CLEAR_DATA();
              this._GetData();
            }}
          ]
        )
      }
      return;
    
    }
    let closeIndex = this.state.activeSections[this.state.activeSections.length -1]
    //This finds the difference between the two arrays to decide which icon needs to be flipped
    //in the animation. activeSections = current, this.state.activeSections = previous. 
    for(i =0; i < activeSections.length; ++i){
      if(activeSections[i] != this.state.activeSections[i]){
          closeIndex = this.state.activeSections[i]
          break;
      }
    }

    this.handleSelect(closeIndex)
    this.setState({ activeSections });
  };

  componentWillUnmount(){
      deleted = []
      SECTIONS=[]
  }

  _xmlParse(data) {
    var options = {
      attributeNamePrefix: "",
      attrNodeName: "attr", //default is 'false'
      textNodeName: "Object Name:",
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: false,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      cdataTagName: "__cdata", //default is 'false'
      cdataPositionChar: "\\c",
      localeRange: "", //To support non english character in tag/attribute values.
      parseTrueNumberOnly: true,
      attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),//default is a=>a
      tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
      stopNodes: ["parse-me-as-string"]
    }
    var parser = require('fast-xml-parser');
    var he = require('he');
    var res = parser.parse(data, options);
    return res;
  }

  //handles the drag-down refresh event.
  //clears all data, and prepares a clean screen.
  onRefresh = (q) => {
    this.setState({refreshing: true})
    this.CLEAR_DATA();
    if(this.state.search.length > 0){
      Keyboard.dismiss()
      const node = this.searchForm.current;
      node.clear();
    }
 
      this._GetData(q);

  }

  //Search bar function
  searchSection = (text) => {
    text = text.toLowerCase()
    if(text.length > this.state.search.length){
      for(var i in SECTIONS){
        if(!SECTIONS[i]['title'].toLowerCase().startsWith(text)){
          deleted.push(SECTIONS[i])
          deleted[deleted.length-1]['index'] = i;
          delete SECTIONS[i]
        }
      }
    }
    else{
      if(text === ''){
        for(var i in deleted){
          //put the deleted data back into its proper index.
          SECTIONS.splice(deleted[i]['index'], 0, deleted[i])
        }
        //clear data, as the search bar is empty.
        deleted = []
      }
      for(var i in deleted){
        if(deleted[i]['title'].toLowerCase().startsWith(text)){
          //put the deleted data back into its proper index
          SECTIONS.splice(deleted[i]['index'], 0, deleted[i])
          //delete the entry we spliced.
          delete deleted[i]
        }
      }
      
    }
    //handle nullities 
    var filtered = SECTIONS.filter(function (el) {
      return el != null;
    });
    SECTIONS = filtered;
    //set state twice because it doesn't work otherwise.
    this.setState(this.activeSections)
    this.setState(this.activeSections)
  }

  scrollToEnd = () => {
    this.scrollView.scrollToEnd();
  }

  render(){

   return(
    <View style={{backgroundColor: EStyleSheet.value('$bgColor'), flex: 1}}>

      <View style={{backgroundColor: EStyleSheet.value('$bgColor'), paddingBottom: RFValue(10)}}>

      <Input
        ref={this.searchForm}
        inputStyle={styles.searchForm}
        containerStyle={{paddingTop: RFPercentage(5)}}
        inputContainerStyle={styles.searchContainer}
        clearButtonMode="while-editing"
        underlineColorAndroid="transparent"
        placeholder={'Search...'}
        placeholderTextColor={EStyleSheet.value('$textColor')}
        onChangeText={ (text) => {
          this.searchSection(text);
          this.setState({ search: text });
        }}
        value={this.state.search}
        borderBottomWidth={1} />
    </View>
    <View key={ this.props.dark_mode } style={{margin: 0, backgroundColor: EStyleSheet.value('$cardColor'), borderWidth: 1, borderRadius:5, borderBottomWidth: 1, alignItems: 'stretch', borderColor: '$bgColor'}}>
        <Picker
          selectedValue={this.state.plan_number}
          itemStyle={styles.pickerItem2}
          style={{ color: EStyleSheet.value('$textColor'), borderWidth: 0, height: RFValue(50), backgroundColor: '$bgColor' }}
          onValueChange={(itemValue) => {

            console.log(itemValue)
            console.log(did_load)

            if(did_load == 0 && this.state.plan_number == 0){
              did_load += 1;
              return;
            }
            this.setState({plan_number: itemValue, activeSections: [], animValue: []})
            this._GetData(itemValue);
          }
          }>
            {this.state.all_plans}
        </Picker>
      </View>
     <ScrollView style={styles.scrollContainer}  refreshControl={
      <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} progressViewOffset={100} />}
      ref={(scrollView) => { this.scrollView = scrollView }}>
        <Accordion
          expandMultiple={true}
          sections={SECTIONS}
          activeSections={this.state.activeSections}
          renderHeader={this._renderHeader}
          renderContent={this._renderContent}
          onChange={this._updateSections}
          containerStyle={styles.accordionContainer}
          sectionContainerStyle={styles.accordionSection}
          underlayColor={EStyleSheet.value('$bgColor')}
        />
      </ScrollView>
      <View
            style={{
              flexDirection: "column",
              height: 75,
              alignItems: "center",
              justifyContent: "space-around",
              paddingBottom: 2,
              paddingTop: 6,
              backgroundColor: EStyleSheet.value('$cardColor'),
              opacity: 0.8,
              borderTopWidth: 0,
              // borderTopRightRadius: 10,
              // borderTopLeftRadius: 10,
              borderRadius: 8,
              //borderTopColor: "darkgray"
            }}
          >
            <View style={{ borderRadius: 5, width: 10, height: 10, backgroundColor: this.props.statusColor}}></View>
              <Text style={styles.footerText}>
                Active Plan: {this.state.plan_name}
              </Text>
              <Text style={styles.footerText}>
                Objects in Plan: {this.state.num_of_objects}  |  Total Plans: {this.state.totalPlans}
              </Text>
          </View>
    </View>
    
    
    );
  };
}

//redux state
function mapStateToProps(state){
  return{
    dark_mode: state.dark_mode,
    decimal_places: state.decimal_places,
    plan_number: state.plan_number,
    IPAddress: state.IPAddress,
    port: state.port,
    statusColor: state.statusColor,
    new_plan_loaded: state.new_plan_loaded
  }
}

function mapDispatchToProps(dispatch){
  return{
    change_value_only: (value, name) => dispatch({type: 'CHANGE_VALUE', value, name})
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(DroScreen));


const styles = EStyleSheet.create({
  scrollContainer:{
    backgroundColor: '$bgColor',
  },
  accordionContainer: {
    backgroundColor: '$bgColor',
  },
  dataContainer: {
    flex:1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  data:{
    fontVariant: ["tabular-nums"],
    color: '$textColor',
    margin: RFValue(3),
    height: RFPercentage(5),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  category:{
    color: '$textColor',
    fontSize: RFValue(15),
  },
  headerText:{
    color: '$textColor',
    fontSize: RFValue(24),
    textAlign: 'center',
 },
  header: { 
    flex: 1,
    flexDirection: 'row',
    marginTop: RFValue(25),
    borderTopWidth: .3,
    borderColor: '$textColor',
  },
  headerFirst: { 
    flex: 1,
    flexDirection: 'row',
    marginTop: RFValue(25),
  },

  headerTextContainer: { 
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: RFValue(20),

  },

  searchForm: {
    borderWidth: 1,
    borderColor: '$textColor',
    fontSize: 20,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 3,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 1,
    color: '$textColor',
    borderRadius: 20,

  },
  searchContainer: {
    color: '$bgColor',
    borderWidth: 0,
    borderColor: '$bgColor',
    borderBottomWidth: 0
  },
  searchContainerColor: {
    color: '$bgColor',

  },
  pickerItem2: {
    color: '$textColor',
    height: RFValue(55),
    fontSize: 22,
    alignContent: "center",
    flexDirection: "column"
  },
  footerText: {
    fontSize: RFValue(12),
    color: "$textColor"
  },
  footerTitle: {
    fontSize: RFValue(16),
    color: "$textColor",
    paddingBottom: RFValue(7)
  },
});