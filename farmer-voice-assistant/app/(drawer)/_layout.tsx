import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: '#43A047' },
        headerTintColor: '#fff',
        drawerActiveTintColor: '#43A047'
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Farmer Assistant',
          drawerIcon: ({ color, size }) => <Ionicons name="chatbubbles" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="explore"
        options={{
          title: 'Explore',
          drawerIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          title: 'History',
          drawerIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />
        }}
      />

    </Drawer>
  );
}
