import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#43A047'
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'CROPWISE',
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
        name="my-crops"
        options={{
          title: 'My Crops',
          drawerIcon: ({ color, size }) => <Ionicons name="leaf" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="farmer-network"
        options={{
          title: 'Farmer Network',
          drawerIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />
        }}
      />
      <Drawer.Screen
        name="schemes"
        options={{
          title: 'Schemes & Subsidies',
          drawerIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />
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
