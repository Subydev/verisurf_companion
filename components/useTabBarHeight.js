import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60; // Same value as in CustomTabBar
  return tabBarHeight + insets.bottom;
}