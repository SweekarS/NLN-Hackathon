import { Redirect, Tabs } from 'expo-router';
import { Easing } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { NavBar } from '../../components/ui/NavBar';

export default function TabLayout() {
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  const remoteProfileReady = useAppStore((s) => s._remoteProfileReady);

  if (!hasHydrated) return null;
  if (!remoteProfileReady) return null;
  /* Incomplete onboarding → welcome (Sign Up / Sign In). Quiz is only opened after signup or explicit phase=quiz. */
  if (!hasCompletedOnboarding) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      tabBar={(props) => <NavBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        animation: 'fade',
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: 260,
            easing: Easing.bezier(0.33, 0, 0.2, 1),
          },
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <Tabs.Screen name="insights" options={{ title: 'Insights' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
