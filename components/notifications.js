import * as Notifications from 'expo-notifications';

const PUSH_ENDPOINT = 'http://165.22.42.177:3800/tasks';

export default async function registerForPushNotificationsAsync() {
  let token;
  let permissionStatus = await Notifications.getPermissionsAsync();
  if (permissionStatus.granted) {
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    let requestStatus = await Notifications.requestPermissionsAsync();
    if (requestStatus.granted) {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    }
  }

  if (!token) {
    return;
  }

  console.log(token);

  fetch(PUSH_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 1,
      task: token,
    }),
  });

  return true;
}
