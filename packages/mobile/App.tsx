import 'react-native-gesture-handler';

import { useEffect, useRef } from 'react';
import { Linking, StatusBar, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cog6ToothIcon, DocumentTextIcon, FolderIcon, HomeIcon, SparklesIcon } from './src/components/Icons';
import BlueprintsScreen from './src/screens/BlueprintsScreen';
import BlueprintEditorScreen from './src/screens/BlueprintEditorScreen';
import BatchGenerateScreen from './src/screens/BatchGenerateScreen';
import DraftDetailScreen from './src/screens/DraftDetailScreen';
import DraftsScreen from './src/screens/DraftsScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import HomeScreen from './src/screens/HomeScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import AboutScreen from './src/screens/AboutScreen';
import DownloadScreen from './src/screens/DownloadScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import {
  CodeOfConductScreen,
  LicenseScreen,
  PrivacyScreen,
  SecurityScreen,
  TermsScreen,
} from './src/screens/InfoDocumentScreen';
import LineageScreen from './src/screens/LineageScreen';
import LorebookGeneratorScreen from './src/screens/LorebookGeneratorScreen';
import WhatsNewScreen from './src/screens/WhatsNewScreen';
import ThemePickerScreen from './src/screens/ThemePickerScreen';
import OffspringScreen from './src/screens/OffspringScreen';
import SeedGeneratorScreen from './src/screens/SeedGeneratorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SimilarityScreen from './src/screens/SimilarityScreen';
import TemplatesScreen from './src/screens/TemplatesScreen';
import TokenOptimizationScreen from './src/screens/TokenOptimizationScreen';
import ValidationScreen from './src/screens/ValidationScreen';
import { parseDesktopCompanionPairingLink } from '@char-gen/shared';
import type { ThemeColors } from '@char-gen/shared';
import type { DraftsStackParamList, HomeStackParamList, RootTabParamList } from './src/types/navigation';
import { buildNavigationThemeColors, resolveNavigationDarkFlag } from './src/theme/theme';
import { MobileThemeProvider, useTheme } from './src/theme/ThemeProvider';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DraftsStack = createNativeStackNavigator<DraftsStackParamList>();
const navigationRef = createNavigationContainerRef<RootTabParamList>();

function buildStackScreenOptions(colors: ThemeColors) {
  return {
    headerStyle: {
      backgroundColor: colors.surface,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '600' as const,
    },
    contentStyle: {
      backgroundColor: colors.background,
    },
  };
}

function HomeStackNavigator() {
  const { colors } = useTheme();

  return (
    <HomeStack.Navigator screenOptions={buildStackScreenOptions(colors)}>
      <HomeStack.Screen name="HomeRoot" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
      <HomeStack.Screen
        name="SeedGenerator"
        component={SeedGeneratorScreen}
        options={{ title: 'Seed Generator', headerShown: false }}
      />
      <HomeStack.Screen
        name="LorebookGenerator"
        component={LorebookGeneratorScreen}
        options={{ title: 'Lorebook Generator', headerShown: false }}
      />
      <HomeStack.Screen
        name="WhatsNew"
        component={WhatsNewScreen}
        options={{ title: "What's New", headerShown: false }}
      />
      <HomeStack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ title: 'Help Center', headerShown: false }}
      />
      <HomeStack.Screen name="About" component={AboutScreen} options={{ title: 'About', headerShown: false }} />
      <HomeStack.Screen
        name="Download"
        component={DownloadScreen}
        options={{ title: 'Download', headerShown: false }}
      />
      <HomeStack.Screen
        name="Community"
        component={CommunityScreen}
        options={{ title: 'Community', headerShown: false }}
      />
      <HomeStack.Screen name="License" component={LicenseScreen} options={{ title: 'License', headerShown: false }} />
      <HomeStack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms of Use', headerShown: false }} />
      <HomeStack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'Privacy', headerShown: false }} />
      <HomeStack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ title: 'Security', headerShown: false }}
      />
      <HomeStack.Screen
        name="CodeOfConduct"
        component={CodeOfConductScreen}
        options={{ title: 'Code of Conduct', headerShown: false }}
      />
      <HomeStack.Screen
        name="ThemePicker"
        component={ThemePickerScreen}
        options={{ title: 'Themes', headerShown: false }}
      />
      <HomeStack.Screen
        name="Validation"
        component={ValidationScreen}
        options={{ title: 'Validation', headerShown: false }}
      />
      <HomeStack.Screen
        name="TokenOptimization"
        component={TokenOptimizationScreen}
        options={{ title: 'Token Optimization', headerShown: false }}
      />
      <HomeStack.Screen name="Lineage" component={LineageScreen} options={{ title: 'Lineage', headerShown: false }} />
      <HomeStack.Screen
        name="Blueprints"
        component={BlueprintsScreen}
        options={{ title: 'Blueprints', headerShown: false }}
      />
      <HomeStack.Screen
        name="BlueprintEditor"
        component={BlueprintEditorScreen}
        options={{ title: 'Blueprint Editor' }}
      />
      <HomeStack.Screen
        name="BatchGenerate"
        component={BatchGenerateScreen}
        options={{ title: 'Batch Generate', headerShown: false }}
      />
      <HomeStack.Screen
        name="Compare"
        component={SimilarityScreen}
        options={{ title: 'Compare Characters', headerShown: false }}
      />
      <HomeStack.Screen
        name="Offspring"
        component={OffspringScreen}
        options={{ title: 'Generate Offspring', headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

function DraftsStackNavigator() {
  const { colors } = useTheme();

  return (
    <DraftsStack.Navigator screenOptions={buildStackScreenOptions(colors)}>
      <DraftsStack.Screen
        name="DraftsList"
        component={DraftsScreen}
        options={{ title: 'Drafts', headerShown: false }}
      />
      <DraftsStack.Screen
        name="DraftDetail"
        component={DraftDetailScreen}
        options={{ title: 'Character Details', headerShown: false }}
      />
    </DraftsStack.Navigator>
  );
}

function renderTabIcon(routeName: keyof RootTabParamList, color: string, size: number) {
  switch (routeName) {
    case 'Home':
      return <HomeIcon color={color} size={size} />;
    case 'Generate':
      return <SparklesIcon color={color} size={size} />;
    case 'Drafts':
      return <FolderIcon color={color} size={size} />;
    case 'Templates':
      return <DocumentTextIcon color={color} size={size} />;
    case 'Settings':
      return <Cog6ToothIcon color={color} size={size} />;
  }
}

function RootNavigation() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const pendingSettingsLinkRef = useRef<{ pairingLink: string; pairingNonce: string } | null>(null);
  const lastHandledUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const focusSettingsTab = (pairingLink?: string) => {
      const params = pairingLink ? { pairingLink, pairingNonce: `${Date.now()}` } : undefined;

      if (navigationRef.isReady()) {
        navigationRef.navigate('Settings', params);
        pendingSettingsLinkRef.current = null;
        return;
      }

      pendingSettingsLinkRef.current = params ?? null;
    };

    const handlePairingUrl = (url: string) => {
      if (!url || lastHandledUrlRef.current === url) {
        return;
      }

      try {
        if (!parseDesktopCompanionPairingLink(url)) {
          return;
        }

        lastHandledUrlRef.current = url;
        focusSettingsTab(url);
      } catch (error) {
        console.error('Failed to apply desktop companion pairing URL', error);
        return;
      }
    };

    void Linking.getInitialURL()
      .then((url) => {
        if (url) {
          handlePairingUrl(url);
        }
      })
      .catch((error) => {
        console.error('Failed to read initial URL', error);
      });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      handlePairingUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        ...DarkTheme,
        dark: resolveNavigationDarkFlag(colors),
        colors: { ...DarkTheme.colors, ...buildNavigationThemeColors(colors) },
      }}
      onReady={() => {
        if (pendingSettingsLinkRef.current) {
          navigationRef.navigate('Settings', pendingSettingsLinkRef.current);
          pendingSettingsLinkRef.current = null;
        }
      }}
    >
      <StatusBar
        barStyle={resolveNavigationDarkFlag(colors) ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
        translucent={false}
      />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Tab.Navigator
          initialRouteName="Home"
          safeAreaInsets={{
            top: 0,
            right: insets.right,
            bottom: insets.bottom,
            left: insets.left,
          }}
          screenOptions={({ route }) => ({
            headerShown: false,
            sceneStyle: {
              backgroundColor: colors.background,
              paddingTop: insets.top,
            },
            tabBarActiveTintColor: colors.accent,
            tabBarInactiveTintColor: colors.muted_text,
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.border,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            tabBarIcon: ({ color, size }) => renderTabIcon(route.name, color, size),
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeStackNavigator}
            options={{
              popToTopOnBlur: true,
            }}
          />
          <Tab.Screen name="Generate" component={GenerateScreen} />
          <Tab.Screen
            name="Drafts"
            component={DraftsStackNavigator}
            options={{
              popToTopOnBlur: true,
            }}
          />
          <Tab.Screen name="Templates" component={TemplatesScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <MobileThemeProvider>
          <RootNavigation />
        </MobileThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
