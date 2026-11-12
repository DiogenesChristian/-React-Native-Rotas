import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AppProvider, useApp } from '../context/AppContext';
import { AboutScreen } from '../screens/AboutScreen';
import { DetailsScreen } from '../screens/DetailsScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { getTheme } from '../theme';
import type { DrawerParamList, RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function AppTabs() {
  const { isDarkMode } = useApp();
  const theme = getTheme(isDarkMode);

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Catalog' ? 'grid' : 'heart';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Catalog" component={HomeScreen} options={{ title: 'Pokédex' }} />
      <Tabs.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
    </Tabs.Navigator>
  );
}

function AppDrawer() {
  const { isDarkMode } = useApp();
  const theme = getTheme(isDarkMode);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        drawerStyle: { backgroundColor: theme.background },
        drawerActiveTintColor: theme.accent,
        headerTintColor: theme.text,
        headerStyle: { backgroundColor: theme.background },
        drawerLabelStyle: { color: theme.text },
      }}
    >
      <Drawer.Screen name="AppTabs" component={AppTabs} options={{ title: 'Poké Atlas' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Configurações' }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'Sobre' }} />
    </Drawer.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="AppDrawer">
      <Stack.Screen name="AppDrawer" component={AppDrawer} options={{ headerShown: false }} />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          title: 'Detalhes do Pokémon',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  );
}
