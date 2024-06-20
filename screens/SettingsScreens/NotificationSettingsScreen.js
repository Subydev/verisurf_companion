import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import SettingsSubPage from '../../components/SettingsSubPage';
import { ListItem, Button } from 'react-native-elements';
import { RFValue } from 'react-native-responsive-fontsize';
import { NotificationContext } from '.././../App';  
import { useNavigation } from '@react-navigation/native';


async function sendPushNotification(expoPushToken) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Test Notification',
    body: 'This is a test notification!',
    data: { someData: 'goes here' },
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
}
const NotificationSettingsScreen = () => {
  const navigation = useNavigation();
  const { expoPushToken, notification, sendPushNotification } = useContext(NotificationContext);
  const [notifications, setNotifications] = useState([
  // ... rest of your component code
    {
      id: '1',
      title: 'Come see Verisurf at booth 223',
      subtitle: 'Visit our booth at the upcoming trade show.',
    },
    {
      id: '2',
      title: 'Verisurf 2025 released',
      subtitle: 'Check out the new features in Verisurf 2025.',
    },
    {
      id: '3',
      title: 'Verisurf Open House Tuesday, 17',
      subtitle: 'Join us for our open house event on Tuesday.',
    },
  ]);


  useEffect(() => {
    if (notification) {
      const newNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title,
        subtitle: notification.request.content.body,
      };
      setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
    }
  }, [notification]);


  return (
    <SettingsSubPage
      containercardColor="transparent"
      containerPadding={10}
      containerWidth="90%"
      title="Notification Settings"
      navigation={navigation}
    >
      <ScrollView>
        <Text>Your Expo push token: {expoPushToken}</Text>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
          <Text>Latest Notification:</Text>
          <Text>Title: {notification && notification.request.content.title} </Text>
          <Text>Body: {notification && notification.request.content.body}</Text>
          <Text>Data: {notification && JSON.stringify(notification.request.content.data)}</Text>
        </View>
        <Button
          title="Send Test Notification"
          onPress={async () => {
            await sendPushNotification(expoPushToken);
          }}
        />
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: RFValue(18), marginBottom: 10 }}>Notification History</Text>
          {notifications.map((item, index) => (
            <ListItem.Swipeable
              containerStyle={{
                borderBottomWidth: 1,
                borderBottomColor: 'white',
                backgroundColor: '#333333',
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
                  buttonStyle={{ minHeight: '100%', backgroundColor: '#BE1E2D' }}
                  titleStyle={{ color: 'white' }}
                />
              )}
              onSwipeBegin={() => console.log('Swipe begin')}
              bottomDivider={index !== notifications.length - 1}
            >
              <ListItem.Content>
                <ListItem.Title style={{ fontSize: RFValue(14), color: 'white' }}>
                  {item.title}
                </ListItem.Title>
                <ListItem.Subtitle style={{ fontSize: RFValue(12), color: 'lightgray' }}>
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

export default NotificationSettingsScreen;