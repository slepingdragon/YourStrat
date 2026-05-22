import { Tabs } from "expo-router";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Book, Camera, Dumbbell, Profile, Star } from "@/components/icons";
import { colors } from "@/theme/colors";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72 + insets.bottom,
          paddingTop: 4,
          paddingBottom: insets.bottom + 10,
        },
        tabBarItemStyle: { paddingVertical: 2 },
        tabBarActiveTintColor: colors.star,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: -2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => (
            <View style={{ opacity: focused ? 1 : 0.72 }}>
              <Star size={20} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Workouts",
          tabBarIcon: ({ color }) => <Dumbbell color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "",
          tabBarIcon: () => (
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: colors.star,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
                marginTop: 0,
              }}
            >
              <Camera color={colors.bg} size={24} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color }) => <Book color={color} size={20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Profile color={color} size={20} />,
        }}
      />
    </Tabs>
  );
}
