//Default values for first time run.
const initialState = {
  IPAddress: "",
  port: "6734",
  decimal_places: 4,
  plan_number: 1,
  build_tol: (0.02).toFixed(4),
  dark_mode: true,
  response_time: 80,
  auto_response_time: 300,
  device_number: 1,
  statusColor: "red",
  buildTutorial: false,
  APICompatible: false,
  single_or_average: "single",
  is_registered: false,
  new_plan_loaded: false,
  in_tolerance_color: "#1FCC4D",
  oot_pos_color: "#2573FF",
  oot_neg_color: "#FF0000",
  exampleInput: "",
  exampleSlider: 50,
  count: 3,

};

//The reducer ..reduces.. your function calls to figure out what you want to do with state.
const reducer = (state = initialState, action) => {
    // console.log('Reducer - Current State:', state);
    // console.log('Reducer - Action:', action);
  switch (action.type) {
    case 'persist/REHYDRATE':
            console.log('Rehydrating state:', action.payload);
            return {
                ...state,
                ...action.payload,
                count: action.payload?.count ?? initialState.count // Use initial count if not in payload
            };
    case "UPDATING_VALUE":
      return {
        ...state,
        [action.name]: action.value,
      };
    case "FINALIZE_TOL":
      try {
        var y = action.text;
        y = y.replace(/,/g, "");
        y = y.replace(/-/g, "");
        y = y.replace(/ /g, "");
      } catch (e) {
        console.log("error in reducer. FINALIZE_TOL section.");
        console.log(e);
      }
      let x = new Number(parseFloat(y)).toFixed(4);
      if (isNaN(x)) {
        x = (0.02).toFixed(4);
      }
      return {
        ...state,
        build_tol: x,
      };
    case "THEME_SWITCH":
      return {
        ...state,
        [action.name]: !action.value,
      };
    case "CHANGE_THEME":
      return state;
    case "CHANGE_VALUE":
      console.log(`Updating ${action.name} to ${action.value}`);
      return {
        ...state,
        [action.name]: action.value,
      };
      case "SET_NOTIFICATION_COUNT":
        console.log('SET_NOTIFICATION_COUNT action received');
        console.log('Current count:', state.count);
        console.log('Action payload:', action.payload);
        const newCount = typeof action.payload === 'function'
          ? action.payload(state.count || 0)
          : action.payload;
        console.log('New count calculated:', newCount);
        console.log('Setting new notification count:', newCount);
        return {
          ...state,
          count: newCount
        };
    case "CLEAR_NOTIFICATIONS":
      return { ...state, count: 0 };
    case "THEME_CHANGED":
      return state;
    default:
      return state;
  }
};
export default reducer;
