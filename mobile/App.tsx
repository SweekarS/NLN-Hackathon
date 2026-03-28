import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const colors = {
  background: '#F6FBF7',
  surface: '#FFFFFF',
  surfaceSoft: '#F0F5F1',
  primary: '#096444',
  primaryContainer: '#2E7D5B',
  secondary: '#3E674D',
  mint: '#BFEECC',
  text: '#171D1B',
  textMuted: '#3F4943',
  outline: '#BEC9C1',
  warning: '#D4B64C',
}

type RootStackParamList = {
  HomeDashboard: undefined
  WelcomeOnboarding: undefined
  AccountPrivacy: undefined
  DailyTasks: undefined
  TaskCustomize: undefined
  StreakConsistency: undefined
  LevelsXP: undefined
  Achievements: undefined
  ReportsInsights: undefined
  Notifications: undefined
  StressModePrefs: undefined
  ProfileSettings: undefined
  SafetyResources: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

type ScreenShortcut = {
  route: keyof RootStackParamList
  title: string
  icon: keyof typeof MaterialCommunityIcons.glyphMap
}

const shortcuts: ScreenShortcut[] = [
  { route: 'WelcomeOnboarding', title: 'Welcome Onboarding', icon: 'sprout' },
  { route: 'AccountPrivacy', title: 'Account & Privacy', icon: 'shield-lock' },
  { route: 'DailyTasks', title: 'Daily Tasks', icon: 'check-circle' },
  { route: 'TaskCustomize', title: 'Task Customize', icon: 'tune' },
  { route: 'StreakConsistency', title: 'Streak Consistency', icon: 'fire' },
  { route: 'LevelsXP', title: 'Levels & XP', icon: 'trending-up' },
  { route: 'Achievements', title: 'Achievements', icon: 'trophy' },
  { route: 'ReportsInsights', title: 'Reports & Insights', icon: 'chart-line' },
  { route: 'Notifications', title: 'Notifications', icon: 'bell' },
  { route: 'StressModePrefs', title: 'Stress Mode Prefs', icon: 'leaf' },
  { route: 'ProfileSettings', title: 'Profile Settings', icon: 'account' },
  { route: 'SafetyResources', title: 'Safety Resources', icon: 'lifebuoy' },
]

function PageContainer({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerBlock}>
          <Text style={styles.pageTitle}>{title}</Text>
          <Text style={styles.pageSubtitle}>{subtitle}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  )
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricChip}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  )
}

function SettingRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch value={enabled} trackColor={{ true: colors.primaryContainer }} />
    </View>
  )
}

function TaskRow({
  title,
  detail,
  done,
}: {
  title: string
  detail: string
  done?: boolean
}) {
  return (
    <View style={[styles.taskRow, done && styles.taskRowDone]}>
      <View style={styles.rowTextBlock}>
        <Text style={[styles.rowTitle, done && styles.doneText]}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
      <MaterialCommunityIcons
        name={done ? 'check-circle' : 'circle-outline'}
        size={22}
        color={done ? colors.primary : colors.textMuted}
      />
    </View>
  )
}

function HomeDashboardScreen({
  navigation,
}: {
  navigation: any
}) {
  return (
    <PageContainer
      title="StreakSync"
      subtitle="Your mobile wellness home. All Stitch pages are integrated below."
    >
      <SectionCard title="Quick Stats">
        <View style={styles.metricRow}>
          <MetricChip label="Current Streak" value="12 days" />
          <MetricChip label="Weekly Completion" value="5/7" />
        </View>
        <View style={styles.metricRow}>
          <MetricChip label="Level" value="15/100" />
          <MetricChip label="XP" value="2,450/5,000" />
        </View>
      </SectionCard>

      <SectionCard title="All Mobile Pages">
        {shortcuts.map((item) => (
          <Pressable
            key={item.route}
            style={styles.linkRow}
            onPress={() => navigation.navigate(item.route)}
          >
            <View style={styles.linkLeft}>
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={colors.primary}
              />
              <Text style={styles.linkText}>{item.title}</Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ))}
      </SectionCard>
    </PageContainer>
  )
}

function WelcomeOnboardingScreen() {
  return (
    <PageContainer
      title="Welcome Onboarding"
      subtitle="Private by default, gentle progress, no pressure."
    >
      <SectionCard title="Mode Selection">
        <TaskRow title="Solo Journey" detail="Private self-tracking with no social requirement." />
        <TaskRow title="Friend Mode" detail="Optional sharing with trusted people only." />
        <TaskRow title="Anonymous Mode" detail="Minimal identity and discreet support." />
      </SectionCard>
      <SectionCard title="Consent Explainer">
        <Text style={styles.bodyText}>Data stays private unless you explicitly share. You can export and delete anytime.</Text>
      </SectionCard>
    </PageContainer>
  )
}

function AccountPrivacyScreen() {
  return (
    <PageContainer
      title="Account & Privacy"
      subtitle="Set your default visibility and data controls."
    >
      <SectionCard title="Visibility">
        <SettingRow label="Only me (default)" enabled />
        <SettingRow label="Close friends" enabled={false} />
        <SettingRow label="Public profile" enabled={false} />
      </SectionCard>
      <SectionCard title="Data Controls">
        <TaskRow title="Export my data" detail="Download task and progress history." />
        <TaskRow title="Delete all data" detail="Permanent removal from app storage." />
      </SectionCard>
    </PageContainer>
  )
}

function DailyTasksScreen() {
  return (
    <PageContainer title="Daily Tasks" subtitle="4 core wellness tasks (5-10 mins each).">
      <SectionCard title="Today">
        <TaskRow title="Morning Routine" detail="Meditation, stretch, breakfast." done />
        <TaskRow title="Social Check-In" detail="Text friend or call family." />
        <TaskRow title="Phone-Free Hour" detail="Walk, read, or hobby time." />
        <TaskRow title="Evening Wind-Down" detail="Breathing, no screens, journaling." />
      </SectionCard>
    </PageContainer>
  )
}

function TaskCustomizeScreen() {
  return (
    <PageContainer
      title="Task Customize"
      subtitle="Enable default tasks and add up to 6 total."
    >
      <SectionCard title="Enabled Tasks">
        <SettingRow label="Morning Routine" enabled />
        <SettingRow label="Social Check-In" enabled />
        <SettingRow label="Phone-Free Hour" enabled />
        <SettingRow label="Evening Wind-Down" enabled />
      </SectionCard>
      <SectionCard title="Custom Tasks">
        <TaskRow title="Gym" detail="Added custom task slot 5." />
        <TaskRow title="Hobby Time" detail="Added custom task slot 6." />
      </SectionCard>
    </PageContainer>
  )
}

function StreakConsistencyScreen() {
  return (
    <PageContainer
      title="Streak & Consistency"
      subtitle="Gentle continuity without shame for missed days."
    >
      <SectionCard title="Streak Cards">
        <MetricChip label="Current streak" value="12 days" />
        <View style={{ height: 10 }} />
        <MetricChip label="Longest streak" value="27 days" />
      </SectionCard>
      <SectionCard title="Supportive Messaging">
        <Text style={styles.bodyText}>
          You’re taking a break. That’s okay. Ready to continue whenever you want.
        </Text>
      </SectionCard>
    </PageContainer>
  )
}

function LevelsXPScreen() {
  return (
    <PageContainer
      title="Levels & XP"
      subtitle="Long-term growth system from level 1 to level 100."
    >
      <SectionCard title="Progress">
        <MetricChip label="Current Level" value="15 / 100" />
        <View style={{ height: 10 }} />
        <Text style={styles.bodyText}>XP sources: +50 task, +150 all tasks, +100 7-day, +200 weekly goal.</Text>
      </SectionCard>
      <SectionCard title="Tier Map">
        <TaskRow title="Rookie" detail="Levels 1-10" done />
        <TaskRow title="Regular" detail="Levels 11-30" done />
        <TaskRow title="Master" detail="Levels 31-60" />
        <TaskRow title="Legend" detail="Levels 61-100" />
      </SectionCard>
    </PageContainer>
  )
}

function AchievementsScreen() {
  return (
    <PageContainer
      title="Achievements"
      subtitle="Consistency, wellness, and milestone badges."
    >
      <SectionCard title="Unlocked">
        <TaskRow title="7-Day Streak" detail="Consistency badge" done />
        <TaskRow title="Night Owl Reset" detail="5 wind-downs completed" done />
      </SectionCard>
      <SectionCard title="In Progress">
        <TaskRow title="Social Butterfly" detail="10 check-ins target (6/10)" />
        <TaskRow title="First 1,000 XP" detail="Current: 2,450 XP" done />
      </SectionCard>
    </PageContainer>
  )
}

function ReportsInsightsScreen() {
  return (
    <PageContainer
      title="Reports & Insights"
      subtitle="Weekly/monthly trends visible only to you."
    >
      <SectionCard title="Weekly Report">
        <TaskRow title="Completion rate" detail="5 of 7 days completed." />
        <TaskRow title="Mood trend" detail="Stable with improved evening routine." />
        <TaskRow title="Suggestion" detail="Keep phone-free hour before 7 PM." />
      </SectionCard>
      <SectionCard title="Monthly Report">
        <TaskRow title="Consistency score" detail="78/100" />
        <TaskRow title="Badges unlocked" detail="4 this month" />
      </SectionCard>
    </PageContainer>
  )
}

function NotificationsScreen() {
  return (
    <PageContainer
      title="Notifications"
      subtitle="Reminder and nudge controls with calm defaults."
    >
      <SectionCard title="Enabled Notifications">
        <SettingRow label="Daily reminders" enabled />
        <SettingRow label="Gentle nudges" enabled />
        <SettingRow label="Encouragement updates" enabled />
        <SettingRow label="System alerts (private)" enabled />
      </SectionCard>
    </PageContainer>
  )
}

function StressModePrefsScreen() {
  return (
    <PageContainer
      title="Stress Mode Preferences"
      subtitle="Adjust intensity based on stress levels."
    >
      <SectionCard title="Mode Presets">
        <TaskRow title="High stress" detail="Fewer reminders, lower expectations." done />
        <TaskRow title="Medium stress" detail="Balanced pace and prompts." />
        <TaskRow title="Low stress" detail="More engaging progress prompts." />
      </SectionCard>
      <SectionCard title="Additional Preferences">
        <TaskRow title="Language" detail="English, Spanish, Hindi, Tagalog." />
        <TaskRow title="Theme" detail="Light, dark, custom green." />
      </SectionCard>
    </PageContainer>
  )
}

function ProfileSettingsScreen() {
  return (
    <PageContainer
      title="Profile Settings"
      subtitle="Accessibility, visibility, and account controls."
    >
      <SectionCard title="Accessibility">
        <SettingRow label="Large text" enabled={false} />
        <SettingRow label="High contrast" enabled={false} />
        <SettingRow label="Screen reader support hints" enabled />
      </SectionCard>
      <SectionCard title="Account">
        <TaskRow title="Export data" detail="Download personal wellness report." />
        <TaskRow title="Delete account" detail="Erase profile and all logs." />
      </SectionCard>
    </PageContainer>
  )
}

function SafetyResourcesScreen() {
  return (
    <PageContainer
      title="Safety Resources"
      subtitle="Optional support pathways and quick calm tools."
    >
      <SectionCard title="Immediate Support">
        <TaskRow title="Crisis hotline" detail="Region-based hotline numbers." />
        <TaskRow title="Text support services" detail="Private text-based support options." />
        <TaskRow title="Talk to someone" detail="Gentle suggestions, never forced." />
      </SectionCard>
      <SectionCard title="Wellness Tools">
        <TaskRow title="5-10 min meditation" detail="Stress and sleep sessions." />
        <TaskRow title="Private journaling" detail="Optional reflections with mood context." />
      </SectionCard>
    </PageContainer>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="HomeDashboard"
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTitleStyle: { color: colors.primary, fontWeight: '700' },
            headerTintColor: colors.primary,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen
            name="HomeDashboard"
            component={HomeDashboardScreen}
            options={{ title: 'StreakSync Mobile' }}
          />
          <Stack.Screen name="WelcomeOnboarding" component={WelcomeOnboardingScreen} options={{ title: 'Welcome' }} />
          <Stack.Screen name="AccountPrivacy" component={AccountPrivacyScreen} options={{ title: 'Account & Privacy' }} />
          <Stack.Screen name="DailyTasks" component={DailyTasksScreen} options={{ title: 'Daily Tasks' }} />
          <Stack.Screen name="TaskCustomize" component={TaskCustomizeScreen} options={{ title: 'Task Customize' }} />
          <Stack.Screen name="StreakConsistency" component={StreakConsistencyScreen} options={{ title: 'Streak Consistency' }} />
          <Stack.Screen name="LevelsXP" component={LevelsXPScreen} options={{ title: 'Levels & XP' }} />
          <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Achievements' }} />
          <Stack.Screen name="ReportsInsights" component={ReportsInsightsScreen} options={{ title: 'Reports & Insights' }} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
          <Stack.Screen name="StressModePrefs" component={StressModePrefsScreen} options={{ title: 'Stress Mode' }} />
          <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} options={{ title: 'Profile Settings' }} />
          <Stack.Screen name="SafetyResources" component={SafetyResourcesScreen} options={{ title: 'Safety Resources' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 24,
  },
  headerBlock: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderColor: colors.outline,
    borderWidth: 1,
  },
  pageTitle: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 24,
  },
  pageSubtitle: {
    color: colors.textMuted,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.outline,
    gap: 10,
  },
  cardTitle: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: '700',
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricChip: {
    flex: 1,
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  metricValue: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 18,
  },
  metricLabel: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomColor: colors.outline,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  taskRowDone: {
    backgroundColor: colors.mint,
  },
  rowTextBlock: {
    flex: 1,
    paddingRight: 8,
  },
  rowTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
  doneText: {
    color: colors.primary,
  },
  rowDetail: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  bodyText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSoft,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  linkText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
})
