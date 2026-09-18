import 'react-native-gesture-handler';

import { StatusBar, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Cog6ToothIcon,
  DocumentTextIcon,
  FolderIcon,
  HomeIcon,
  SparklesIcon,
} from './src/components/Icons';
import BlueprintsScreen from './src/screens/BlueprintsScreen';
import BlueprintEditorScreen from './src/screens/BlueprintEditorScreen';
import BatchGenerateScreen from './src/screens/BatchGenerateScreen';
import DraftDetailScreen from './src/screens/DraftDetailScreen';
import DraftsScreen from './src/screens/DraftsScreen';
import GenerateScreen from './src/screens/GenerateScreen';
import HomeScreen from './src/screens/HomeScreen';
import LineageScreen from './src/screens/LineageScreen';
import OffspringScreen from './src/screens/OffspringScreen';
import SeedGeneratorScreen from './src/screens/SeedGeneratorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SimilarityScreen from './src/screens/SimilarityScreen';
import TemplatesScreen from './src/screens/TemplatesScreen';
import TokenOptimizationScreen from './src/screens/TokenOptimizationScreen';
import ValidationScreen from './src/screens/ValidationScreen';
import type {
  DraftsStackParamList,
  HomeStackParamList,
  RootTabParamList,
} from './src/types/navigation';

const queryClient = new QueryClient();
const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DraftsStack = createNativeStackNavigator<DraftsStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#7c3aed',
    background: '#0f0f0f',
    card: '#171717',
    text: '#ffffff',
    border: '#27272a',
    notification: '#7c3aed',
  },
} satisfies Theme;

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: '#171717',
  },
  headerTintColor: '#ffffff',
  headerTitleStyle: {
    fontWeight: '600' as const,
  },
  contentStyle: {
    backgroundColor: '#0f0f0f',
  },
};

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={stackScreenOptions}>
      <HomeStack.Screen name="HomeRoot" component={HomeScreen} options={{ title: 'Home', headerShown: false }} />
      <HomeStack.Screen name="SeedGenerator" component={SeedGeneratorScreen} options={{ title: 'Seed Generator', headerShown: false }} />
      <HomeStack.Screen name="Validation" component={ValidationScreen} options={{ title: 'Validation', headerShown: false }} />
      <HomeStack.Screen name="TokenOptimization" component={TokenOptimizationScreen} options={{ title: 'Token Optimization', headerShown: false }} />
      <HomeStack.Screen name="Lineage" component={LineageScreen} options={{ title: 'Lineage', headerShown: false }} />
      <HomeStack.Screen name="Blueprints" component={BlueprintsScreen} options={{ title: 'Blueprints', headerShown: false }} />
      <HomeStack.Screen name="BlueprintEditor" component={BlueprintEditorScreen} options={{ title: 'Blueprint Editor' }} />
      <HomeStack.Screen name="BatchGenerate" component={BatchGenerateScreen} options={{ title: 'Batch Generate', headerShown: false }} />
      <HomeStack.Screen name="Compare" component={SimilarityScreen} options={{ title: 'Compare Characters', headerShown: false }} />
      <HomeStack.Screen name="Offspring" component={OffspringScreen} options={{ title: 'Generate Offspring', headerShown: false }} />
    </HomeStack.Navigator>
  );
}

function DraftsStackNavigator() {
  return (
    <DraftsStack.Navigator screenOptions={stackScreenOptions}>
      <DraftsStack.Screen name="DraftsList" component={DraftsScreen} options={{ title: 'Drafts', headerShown: false }} />
      <DraftsStack.Screen name="DraftDetail" component={DraftDetailScreen} options={{ title: 'Character Details', headerShown: false }} />
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

  return (
    <NavigationContainer theme={navigationTheme}>
      <View style={{ flex: 1, backgroundColor: '#0f0f0f' }}>
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
              backgroundColor: '#0f0f0f',
              paddingTop: insets.top,
            },
            tabBarActiveTintColor: '#7c3aed',
            tabBarInactiveTintColor: '#9ca3af',
            tabBarStyle: {
              backgroundColor: '#171717',
              borderTopColor: '#27272a',
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
        <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" translucent={false} />
        <RootNavigation />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}