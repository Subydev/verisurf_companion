// ES6 module syntax
import LocalizedStrings from 'react-native-localization';
 
// CommonJS syntax
// let LocalizedStrings  = require ('react-native-localization');
 
let strings = new LocalizedStrings({
 "en-US":{
   hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
   hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
   connect:"Connected To: ", //shows what Device is connected to (Name)
   probe:"Probe Radius: ", //active radius of the proe
   temp:"| Temperature: ", //Current Device Temperature
   label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
   label2:"Circle", //Circle Selection
   label3:"Line", //Line Selection
   label4:"Point", //Point Selection
   label5:"Sphere", //Sphere Selection
   label6:"Plane", //Plane Selection
   label7:"Cylinder", //Cylinder Selection
   label8:"Cone", //Cone Selection
   label9:"Ellipse", //Ellipse Selection
   sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
   sett2:"Dark-Mode", //Everything is dark
   sett3:"Light-Mode", //Everything is light
   sett4:"Measure", //This is the "Measure" category for Settings.
   sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
   sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
   sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
   sett8:"Device", //This is the "Device" category for Settings.
   sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
   sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
   sett11:"Sign Out: ", //Signs out of the app
   sett12:"Port #: ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
   sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
   sett14:"Information", //This is a small footer that shows the App version.
   sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
   sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
   sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
   sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
   sett19:"Single Point", //Set Default Single Point Mode.
   sett20:"Stationary Point", //Set Default Stationary Point Mode.
   login1:"Login", //This is a simple login button.
   login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
   login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
   login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
   login5:"Connection Lost...", //Simple connection lost message.
   login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
   login7:"Welcome!", //Welcome to the APP!!
   login8:"Change IP Address?", //Would you like to return and change the IP Address?
   alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
   alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
   rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
   auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
   auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
   auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
   auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
   auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
   auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
   auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
   auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
   plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
   dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
   dev2:"Home Device", //This will Home a device.
   dev3:"Start Device", //This will Start a device.
   dev4:"Stop Device", //This will Stop a device.
 },
 en:{
    hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
    hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
    connect:"Connected To: ", //shows what Device is connected to (Name)
    probe:"Probe Radius: ", //active radius of the proe
    temp:"| Temperature: ", //Current Device Temperature
    label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
    label2:"Circle", //Circle Selection
    label3:"Line", //Line Selection
    label4:"Point", //Point Selection
    label5:"Sphere", //Sphere Selection
    label6:"Plane", //Plane Selection
    label7:"Cylinder", //Cylinder Selection
    label8:"Cone", //Cone Selection
    label9:"Ellipse", //Ellipse Selection
    sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
    sett2:"Dark-Mode", //Everything is dark
    sett3:"Light-Mode", //Everything is liht
    sett4:"Measure", //This is the "Measure" category for Settings.
    sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
    sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
    sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
    sett8:"Device", //This is the "Device" category for Settings.
    sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
    sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
    sett11:"Sign Out: ", //Signs out of the app
    sett12:"Port # ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
    sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
    sett14:"Information", //This is a small footer that shows the App version.
    sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
    sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
    sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
    sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
    sett19:"Single Point", //Set Default Single Point Mode.
    sett20:"Stationary Point", //Set Default Stationary Point Mode.
    login1:"Login", //This is a simple login button.
    login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
    login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
    login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
    login5:"Connection Lost...", //Simple connection lost message.
    login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
    login7:"Welcome!", //Welcome to the APP!!
    login8:"Change IP Address?", //Would you like to return and change the IP Address?
    alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
    alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
    rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
    auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
    auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
    auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
    auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
    auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
    auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
    auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
    auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
    plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
    dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
    dev2:"Home Device", //This will Home a device.
    dev3:"Start Device", //This will Start a device.
    dev4:"Stop Device", //This will Stop a device.
 },
 it: {
    hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
    hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
    connect:"Connected To: ", //shows what Device is connected to (Name)
    probe:"Probe Radius: ", //active radius of the proe
    temp:"| Temperature: ", //Current Device Temperature
    label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
    label2:"Circle", //Circle Selection
    label3:"Line", //Line Selection
    label4:"Point", //Point Selection
    label5:"Sphere", //Sphere Selection
    label6:"Plane", //Plane Selection
    label7:"Cylinder", //Cylinder Selection
    label8:"Cone", //Cone Selection
    label9:"Ellipse", //Ellipse Selection
    sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
    sett2:"Dark-Mode", //Everything is dark
    sett3:"Light-Mode", //Everything is liht
    sett4:"Measure", //This is the "Measure" category for Settings.
    sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
    sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
    sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
    sett8:"Device", //This is the "Device" category for Settings.
    sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
    sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
    sett11:"Sign Out: ", //Signs out of the app
    sett12:"Port # ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
    sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
    sett14:"Information", //This is a small footer that shows the App version.
    sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
    sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
    sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
    sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
    sett19:"Single Point", //Set Default Single Point Mode.
    sett20:"Stationary Point", //Set Default Stationary Point Mode.
    login1:"Login", //This is a simple login button.
    login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
    login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
    login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
    login5:"Connection Lost...", //Simple connection lost message.
    login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
    login7:"Welcome!", //Welcome to the APP!!
    login8:"Change IP Address?", //Would you like to return and change the IP Address?
    alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
    alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
    rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
    auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
    auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
    auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
    auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
    auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
    auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
    auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
    auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
    plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
    dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
    dev2:"Home Device", //This will Home a device.
    dev3:"Start Device", //This will Start a device.
    dev4:"Stop Device", //This will Stop a device.
 },
 de: {
    hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
    hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
    connect:"Connected To: ", //shows what Device is connected to (Name)
    probe:"Probe Radius: ", //active radius of the proe
    temp:"| Temperature: ", //Current Device Temperature
    label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
    label2:"Circle", //Circle Selection
    label3:"Line", //Line Selection
    label4:"Point", //Point Selection
    label5:"Sphere", //Sphere Selection
    label6:"Plane", //Plane Selection
    label7:"Cylinder", //Cylinder Selection
    label8:"Cone", //Cone Selection
    label9:"Ellipse", //Ellipse Selection
    sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
    sett2:"Dark-Mode", //Everything is dark
    sett3:"Light-Mode", //Everything is liht
    sett4:"Measure", //This is the "Measure" category for Settings.
    sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
    sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
    sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
    sett8:"Device", //This is the "Device" category for Settings.
    sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
    sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
    sett11:"Sign Out: ", //Signs out of the app
    sett12:"Port # ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
    sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
    sett14:"Information", //This is a small footer that shows the App version.
    sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
    sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
    sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
    sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
    sett19:"Single Point", //Set Default Single Point Mode.
    sett20:"Stationary Point", //Set Default Stationary Point Mode.
    login1:"Login", //This is a simple login button.
    login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
    login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
    login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
    login5:"Connection Lost...", //Simple connection lost message.
    login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
    login7:"Welcome!", //Welcome to the APP!!
    login8:"Change IP Address?", //Would you like to return and change the IP Address?
    alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
    alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
    rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
    auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
    auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
    auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
    auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
    auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
    auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
    auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
    auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
    plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
    dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
    dev2:"Home Device", //This will Home a device.
    dev3:"Start Device", //This will Start a device.
    dev4:"Stop Device", //This will Stop a device.
 },
 cn: {
    hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
    hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
    connect:"Connected To: ", //shows what Device is connected to (Name)
    probe:"Probe Radius: ", //active radius of the proe
    temp:"| Temperature: ", //Current Device Temperature
    label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
    label2:"Circle", //Circle Selection
    label3:"Line", //Line Selection
    label4:"Point", //Point Selection
    label5:"Sphere", //Sphere Selection
    label6:"Plane", //Plane Selection
    label7:"Cylinder", //Cylinder Selection
    label8:"Cone", //Cone Selection
    label9:"Ellipse", //Ellipse Selection
    sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
    sett2:"Dark-Mode", //Everything is dark
    sett3:"Light-Mode", //Everything is liht
    sett4:"Measure", //This is the "Measure" category for Settings.
    sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
    sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
    sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
    sett8:"Device", //This is the "Device" category for Settings.
    sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
    sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
    sett11:"Sign Out: ", //Signs out of the app
    sett12:"Port # ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
    sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
    sett14:"Information", //This is a small footer that shows the App version.
    sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
    sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
    sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
    sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
    sett19:"Single Point", //Set Default Single Point Mode.
    sett20:"Stationary Point", //Set Default Stationary Point Mode.
    login1:"Login", //This is a simple login button.
    login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
    login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
    login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
    login5:"Connection Lost...", //Simple connection lost message.
    login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
    login7:"Welcome!", //Welcome to the APP!!
    login8:"Change IP Address?", //Would you like to return and change the IP Address?
    alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
    alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
    rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
    auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
    auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
    auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
    auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
    auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
    auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
    auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
    auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
    plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
    dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
    dev2:"Home Device", //This will Home a device.
    dev3:"Start Device", //This will Start a device.
    dev4:"Stop Device", //This will Stop a device.
 },
 cz: {
    hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
    hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
    connect:"Connected To: ", //shows what Device is connected to (Name)
    probe:"Probe Radius: ", //active radius of the proe
    temp:"| Temperature: ", //Current Device Temperature
    label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
    label2:"Circle", //Circle Selection
    label3:"Line", //Line Selection
    label4:"Point", //Point Selection
    label5:"Sphere", //Sphere Selection
    label6:"Plane", //Plane Selection
    label7:"Cylinder", //Cylinder Selection
    label8:"Cone", //Cone Selection
    label9:"Ellipse", //Ellipse Selection
    sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
    sett2:"Dark-Mode", //Everything is dark
    sett3:"Light-Mode", //Everything is liht
    sett4:"Measure", //This is the "Measure" category for Settings.
    sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
    sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
    sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
    sett8:"Device", //This is the "Device" category for Settings.
    sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
    sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
    sett11:"Sign Out: ", //Signs out of the app
    sett12:"Port # ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
    sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
    sett14:"Information", //This is a small footer that shows the App version.
    sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
    sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
    sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
    sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
    sett19:"Single Point", //Set Default Single Point Mode.
    sett20:"Stationary Point", //Set Default Stationary Point Mode.
    login1:"Login", //This is a simple login button.
    login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
    login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
    login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
    login5:"Connection Lost...", //Simple connection lost message.
    login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
    login7:"Welcome!", //Welcome to the APP!!
    login8:"Change IP Address?", //Would you like to return and change the IP Address?
    alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
    alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
    rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
    auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
    auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
    auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
    auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
    auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
    auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
    auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
    auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
    plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
    dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
    dev2:"Home Device", //This will Home a device.
    dev3:"Start Device", //This will Start a device.
    dev4:"Stop Device", //This will Stop a device.
 },
 ja: {
    hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
    hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
    connect:"Connected To: ", //shows what Device is connected to (Name)
    probe:"Probe Radius: ", //active radius of the proe
    temp:"| Temperature: ", //Current Device Temperature
    label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
    label2:"Circle", //Circle Selection
    label3:"Line", //Line Selection
    label4:"Point", //Point Selection
    label5:"Sphere", //Sphere Selection
    label6:"Plane", //Plane Selection
    label7:"Cylinder", //Cylinder Selection
    label8:"Cone", //Cone Selection
    label9:"Ellipse", //Ellipse Selection
    sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
    sett2:"Dark-Mode", //Everything is dark
    sett3:"Light-Mode", //Everything is liht
    sett4:"Measure", //This is the "Measure" category for Settings.
    sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
    sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
    sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
    sett8:"Device", //This is the "Device" category for Settings.
    sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
    sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
    sett11:"Sign Out: ", //Signs out of the app
    sett12:"Port # ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
    sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
    sett14:"Information", //This is a small footer that shows the App version.
    sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
    sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
    sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
    sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
    sett19:"Single Point", //Set Default Single Point Mode.
    sett20:"Stationary Point", //Set Default Stationary Point Mode.
    login1:"Login", //This is a simple login button.
    login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
    login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
    login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
    login5:"Connection Lost...", //Simple connection lost message.
    login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
    login7:"Welcome!", //Welcome to the APP!!
    login8:"Change IP Address?", //Would you like to return and change the IP Address?
    alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
    alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
    rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
    auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
    auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
    auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
    auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
    auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
    auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
    auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
    auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
    plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
    dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
    dev2:"Home Device", //This will Home a device.
    dev3:"Start Device", //This will Start a device.
    dev4:"Stop Device", //This will Stop a device.
 },
 es: {
    hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
    hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
    connect:"Connected To: ", //shows what Device is connected to (Name)
    probe:"Probe Radius: ", //active radius of the proe
    temp:"| Temperature: ", //Current Device Temperature
    label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
    label2:"Circle", //Circle Selection
    label3:"Line", //Line Selection
    label4:"Point", //Point Selection
    label5:"Sphere", //Sphere Selection
    label6:"Plane", //Plane Selection
    label7:"Cylinder", //Cylinder Selection
    label8:"Cone", //Cone Selection
    label9:"Ellipse", //Ellipse Selection
    sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
    sett2:"Dark-Mode", //Everything is dark
    sett3:"Light-Mode", //Everything is liht
    sett4:"Measure", //This is the "Measure" category for Settings.
    sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
    sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
    sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
    sett8:"Device", //This is the "Device" category for Settings.
    sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
    sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
    sett11:"Sign Out: ", //Signs out of the app
    sett12:"Port # ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
    sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
    sett14:"Information", //This is a small footer that shows the App version.
    sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
    sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
    sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
    sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
    sett19:"Single Point", //Set Default Single Point Mode.
    sett20:"Stationary Point", //Set Default Stationary Point Mode.
    login1:"Login", //This is a simple login button.
    login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
    login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
    login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
    login5:"Connection Lost...", //Simple connection lost message.
    login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
    login7:"Welcome!", //Welcome to the APP!!
    login8:"Change IP Address?", //Would you like to return and change the IP Address?
    alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
    alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
    rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
    auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
    auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
    auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
    auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
    auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
    auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
    auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
    auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
    plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
    dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
    dev2:"Home Device", //This will Home a device.
    dev3:"Start Device", //This will Start a device.
    dev4:"Stop Device", //This will Stop a device.
 },
 fr: {
    hold:"Tap - Single | Hold - Continuous", //These are gestures controls for measuring. Tapping takes a single point, holding will start a continuous measurement.
    hold2:"Tap - Measure Point | Hold - Start Plan", //Same as taking Measurements, but holding Starts the active Auto-Inspect Plan
    connect:"Connected To: ", //shows what Device is connected to (Name)
    probe:"Probe Radius: ", //active radius of the proe
    temp:"| Temperature: ", //Current Device Temperature
    label1:"Select Feature Type...", //This is a Dropdown(android) wheel picker(iOS) that allows the user to select which Feature type to measure.
    label2:"Circle", //Circle Selection
    label3:"Line", //Line Selection
    label4:"Point", //Point Selection
    label5:"Sphere", //Sphere Selection
    label6:"Plane", //Plane Selection
    label7:"Cylinder", //Cylinder Selection
    label8:"Cone", //Cone Selection
    label9:"Ellipse", //Ellipse Selection
    sett1:"Appearance", //Toggles between a Dark and Light Theme for the App. (Defaults to native theme)
    sett2:"Dark-Mode", //Everything is dark
    sett3:"Light-Mode", //Everything is liht
    sett4:"Measure", //This is the "Measure" category for Settings.
    sett5:"Decimal Places", //How many decimal places to display for Report Objects and DRO/Build
    sett6:"Re-measure Prompt: ", //If a Feature is Out of Tolerance during AutoInspect, this is a prompt to re-measure.
    sett7:"Build Tolerance", //Tolerance for Build (does not inherhit Verisurf Build tolerance)
    sett8:"Device", //This is the "Device" category for Settings.
    sett9:"Response Time (ms): ", //This is how fast Data is coming across from Verisurf to the Mobile App. Defaults to value of function used to detect ping/bandwidth
    sett10:"Device Number: ", //Selection for which device to use. (defaults to first device)
    sett11:"Sign Out: ", //Signs out of the app
    sett12:"Port # ", //Changed port number to Verisurf connection. Defaults to Websocket 3764. Can be changed in VS Preferences in API/SDK Settings.
    sett13:"Contact Us", //Underneath here will be a few hyperlinks to email us, call us, etc.
    sett14:"Information", //This is a small footer that shows the App version.
    sett15:"Visit us at", //Some Hyperlinks to route to Verisurf Website. If you would like to display your website please email me.
    sett16:"Send Log File as Attatchment", //This will open up the default Mail app and attach a log file for troubleshooting.
    sett17:"Text Scale: ",// The Verisurf APP scales automatically to all Device Width/Height, however there is room to make smaller or larger, this is what this settings does.
    sett18:"Tap Mode: ", //By default, tapping triggers a single point. But you can switch between  Single/Stationary
    sett19:"Single Point", //Set Default Single Point Mode.
    sett20:"Stationary Point", //Set Default Stationary Point Mode.
    login1:"Login", //This is a simple login button.
    login2:"IP Address", //This is placeholder text for where the user enters the API address of the Verisurf PC. H
    login3:"Unable to connect with Verisurf", //Unable to make a connection using the IP address.
    login4:"Please make sure your device is on the same Network as Verisurf", //This is a prompt making sure the Device and Verisurf are on the same network.
    login5:"Connection Lost...", //Simple connection lost message.
    login6:"Reconnect?", //Would you like to try and reconnect to Verisurf?
    login7:"Welcome!", //Welcome to the APP!!
    login8:"Change IP Address?", //Would you like to return and change the IP Address?
    alert1:"Currently on SDK version ", //This will show the current SDK version, which is stored on the Verisurf Side.
    alert2:"You must be using Verisurf 2019 Update 1 or Verisurf 2020", //We had to add some things, so the Verisurf Companion App will not be backwards compatible with versions under 2019 Update 1 or 2020.
    rep1:"Search", //This is a placeholder for a searchbar that allows you to search Report results. (By name, tolerance, X value, etc.)
    auto1:"Active Plan: ", //This shows which plan is currently loaded in Verrisurf
    auto2:"Objects in Plan: ", //This shows how many objects are in a Plan.
    auto3:"| Run State: ", //Run state means if the plan is currently being measured or not.
    auto4:"Up Next: ", //Right after this string, it will show which measurement will be up next.
    auto5:" Database...", // This is a string that comes after the plan name retrieved from Verisurf.It's essentially where Verisurf stores report information. (database)
    auto6:"Nothing Measured yet in ", //This is indicating that there is nothing measured yet in the Active Plan.
    auto7:" please hold to begin inspection ...", //When nothing is measured it will wait for you to start the Plan to begin measurements.
    auto8:"Syncing ", //Syncing means the App is loading all of the objects in a plan and finding if anything is measured or not. We're determining if the plan is empty or not.
    plan1:"Show Trends Graph", //This will show a responsive graph when there are a minimum of 2 plans with matching object indexes and names.
    dev1:"Send I++ CMMM Command: ", //This is an option to send the CMM device a commmand.
    dev2:"Home Device", //This will Home a device.
    dev3:"Start Device", //This will Start a device.
    dev4:"Stop Device", //This will Stop a device.
 },
 
});