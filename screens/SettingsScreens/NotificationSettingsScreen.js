import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import SettingsSubPage from '../../components/SettingsSubPage';
import { ListItem, Button } from 'react-native-elements';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;
  
  console.log("Device type:", Constants.deviceName);
  console.log("Is device?", Constants.isDevice);

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({ 
      projectId: Constants.expoConfig.extra.eas.projectId 
    })).data;
    console.log("Expo Push Token:", token);
  } catch (error) {
    console.error("Error getting push token:", error);
    alert('Error getting push token: ' + error.message);
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

  const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(null);
  const notificationListener = useRef();
  const responseListener = useRef();
  const notificationCount = useSelector(state => state.count);
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Come see Verisurf at booth 223',
      subtitle: 'Visit our booth at the upcoming trade show.',
    },
    {
      id: '2',
      title: 'Verisurf 2025 released!',
      subtitle: 'Check out the new features in Verisurf 2025.',
    },
    {
      id: '3',
      title: 'Verisurf Open House Tuesday, 17',
      subtitle: 'Join us for our open house event on Tuesday.',
    },
  ]);

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        console.log("Token set:", token);
      } else {
        console.log("No token received");
      }
    }).catch(error => {
      console.error("Error in registerForPushNotificationsAsync:", error);
    });
  
    const notificationListener = Notifications.addNotificationReceivedListener(handleNewNotification);
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("Notification response received:", response);
    });
  
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const handleNewNotification = (receivedNotification) => {
    console.log("Handling new notification:", receivedNotification);
    const newNotification = {
      id: receivedNotification.request.identifier,
      title: receivedNotification.request.content.title,
      subtitle: receivedNotification.request.content.body,
    };
    setNotifications(prevNotifications => [newNotification, ...prevNotifications]);
    dispatch({ type: 'SET_NOTIFICATION_COUNT', payload: prevCount => {
      const newCount = prevCount + 1;
      console.log("Incrementing notification count from", prevCount, "to", newCount);
      return newCount;
    }});
  };
  const handleTestNotification = async () => {
    try {
      console.log("Sending notification...");
      await sendPushNotification(expoPushToken);
      console.log("Notification sent successfully");
    } catch (error) {
      console.error("Error sending notification:", error);
      alert('Error sending notification: ' + error.message);
    }
  };

  const handleDelete = (id) => {
    setNotifications(prevNotifications => prevNotifications.filter(item => item.id !== id));
    dispatch({ type: 'SET_NOTIFICATION_COUNT', payload: prevCount => Math.max(0, prevCount - 1) });
  };

  return (
    <SettingsSubPage
      containercardColor="transparent"
      containerPadding={10}
      containerWidth="95%"
      title="Notification Settings"
      navigation={navigation}
    >
      <ScrollView>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Button 
            title="Press to Send Notification" 
            onPress={handleTestNotification}
          />
        </View>
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: RFValue(16), marginBottom: 10, color: "lightgray"}}>
            Notification History 
                      </Text>
          {notifications.map((item, index) => (
            <ListItem.Swipeable
              containerStyle={{
                borderWidth: 1,
                borderColor: '#AAAAAA',
                backgroundColor: '#333333',
                borderTopLeftRadius: index === 0 ? 10 : 0,
                borderTopRightRadius: index === 0 ? 10 : 0,
                borderBottomLeftRadius: index === notifications.length - 1 ? 10 : 0,
                borderBottomRightRadius: index === notifications.length - 1 ? 10 : 0,
                paddingVertical: 15,
                overflow: 'hidden', // Add this line

              }}
              key={item.id}
              rightContent={(reset) => (
                <Button
                  title="Delete"
                  onPress={() => {
                    handleDelete(item.id);
                    reset();
                  }}
                  icon={{ name: 'delete', color: 'white' }}
                  buttonStyle={{ minHeight: '100%', backgroundColor: '#BE1E2D',
                  borderTopRightRadius: index === 0 ? 10 : 0, 
                  borderBottomRightRadius: index === notifications.length - 1 ? 10 : 0, 
                   }}
                  titleStyle={{ color: 'white' }}
                />
              )}
              onSwipeBegin={() => console.log('Swipe begin')}
              bottomDivider={index !== notifications.length - 1}
            >
              <ListItem.Content>
                <ListItem.Title style={{ fontSize: RFValue(12), color: 'white' }}>
                  {item.title}
                </ListItem.Title>
                <ListItem.Subtitle style={{ fontSize: RFValue(10), color: '#CCCCCC' }}>
                  {item.subtitle}
                </ListItem.Subtitle>
              </ListItem.Content>
              <ListItem.Chevron />
            </ListItem.Swipeable>
          ))}
        </View>
      </ScrollView>
    </SettingsSubPage>
  );
};


async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Test Notification',
    body: 'This is a test notification!',
    data: { someData: 'goes here' },
  };

  console.log("Sending notification to:", expoPushToken);

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    const result = await response.json();
    console.log("Push notification sent:", result);
  } catch (error) {
    console.error("Error sending push notification:", error);
    alert('Error sending push notification: ' + error.message);
  }
}

export default NotificationSettingsScreen;