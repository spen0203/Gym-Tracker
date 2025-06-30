import React, { useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { Pressable, View } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import CustomHeader from '@/components/CustomHeader';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function IoniconsTabBarIcon(props: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) {
  return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [currentTab, setCurrentTab] = useState('home');

  return (
    <View style={{ flex: 1 }}>
      <CustomHeader 
        leftIcon="menu"
        rightIcon="settings"
        onLeftPress={() => console.log('Left button pressed')}
        onRightPress={() => console.log('Right button pressed')}
        leftDisabled={true}
        rightDisabled={true}
        // leftDisabled={currentTab === 'home'}
        // rightDisabled={currentTab === 'home'}
      />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: false,
        }}
        screenListeners={{
          focus: (e) => {
            setCurrentTab(e.target?.split('-')[0] || 'home');
          },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IoniconsTabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color }) => <IoniconsTabBarIcon name="fitness" color={color} />,
          }}
        />
        <Tabs.Screen
          name="statistics"
          options={{
            title: 'Statistics',
            tabBarIcon: ({ color }) => <IoniconsTabBarIcon name="bar-chart" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IoniconsTabBarIcon name="settings" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
