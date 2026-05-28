import { Tabs } from "expo-router";
import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Book, Camera, Dumbbell, Profile, Star } from "@/components/icons";
import { ScanQueueBar } from "@/components/scan/ScanQueueBar";
import { colors } from "@/theme/colors";
import { glass, glassTint } from "@/theme/glass";
import { spacing } from "@/theme/spacing";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: glass.overlayModal,
          borderTopColor: glass.border,
          height: 72 + insets.bottom,
          paddingTop: spacing.xs,
          paddingBottom: insets.bottom + spacing.sm + 2,
          ...(Platform.OS === "web" ? glassTint("modal") : null),
        },
        tabBarItemStyle: { paddingVertical: spacing.xs / 2, alignItems: "center" },
        tabBarActiveTintColor: colors.star,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          marginTop: -2,
          textAlign: "center",
          width: "100%",
        },
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
      {/* App-wide stack of unsaved scans — floats above every tab so multi-photo
          scans pile up here instead of blocking the camera (transient queue;
          owner-approved app-wide for this feature). */}
      <ScanQueueBar />
    </View>
  );
}
