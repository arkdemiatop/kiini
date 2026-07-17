import { Tabs } from 'expo-router';
import { StyleSheet, Platform, Text } from 'react-native';
import { colors, navHeight } from '@/constants/theme';

const TAB_ICONS: Record<string, string> = {
  home: '🏠',
  units: '📚',
  rooms: '💬',
  events: '📅',
  hub: 'ℹ️',
};

function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
      {TAB_ICONS[routeName] || '•'}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.marigoldDark,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon routeName="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="units"
        options={{
          title: 'Units',
          tabBarIcon: ({ focused }) => <TabIcon routeName="units" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ focused }) => <TabIcon routeName="rooms" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ focused }) => <TabIcon routeName="events" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="hub"
        options={{
          title: 'Hub',
          tabBarIcon: ({ focused }) => <TabIcon routeName="hub" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: navHeight + (Platform.OS === 'ios' ? 20 : 0),
    backgroundColor: colors.white,
    borderTopColor: colors.paperLine,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: -2,
  },
});
