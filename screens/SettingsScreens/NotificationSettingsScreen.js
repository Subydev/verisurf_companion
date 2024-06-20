import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import SettingsSubPage from '../../components/SettingsSubPage';
import { ListItem, Button } from 'react-native-elements';
import { RFValue } from 'react-native-responsive-fontsize';

const NotificationSettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([
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

  const handleDelete = (itemId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((item) => item.id !== itemId)
    );
  };

  return (
    <SettingsSubPage
      containercardColor="transparent"
      containerPadding={10}
      containerWidth="90%"
      title="NotificationSettingsScreen"
      navigation={navigation}
    >
      <ScrollView style={{ marginHorizontal: RFValue(-14) }}>
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
      </ScrollView>
    </SettingsSubPage>
  );
};

export default NotificationSettingsScreen;