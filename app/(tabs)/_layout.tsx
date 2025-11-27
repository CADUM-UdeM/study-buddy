import { Tabs } from "expo-router";
import React from "react";

import IonIcons from "@expo/vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#AB8BFF",
        tabBarInactiveTintColor: "#ffffff",
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#221F3D",
          shadowColor: "#000",
        },
        animation: "fade",
      }}
    >
      <Tabs.Screen
        name="parametres"
        options={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <IonIcons name="settings" size={28} color={color} />
          ),
        })}
      />
      <Tabs.Screen
        name="donnees"
        options={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <IonIcons name="stats-chart" size={25} color={color} />
          ),
        })}
      />
      <Tabs.Screen
        name="index"
        options={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <IonIcons size={28} name="home" color={color} />
          ),
        })}
      />
      <Tabs.Screen
        name="pomodoro"
        options={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <IonIcons name="alarm" size={28} color={color} />
          ),
        })}
      />
      <Tabs.Screen
        name="profil"
        options={({ route }) => ({
          tabBarIcon: ({ color, focused }) => (
            <IonIcons name="person" size={28} color={color} />
          ),
        })}
      />
      <Tabs.Screen
        name="detailscours"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
