import type { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';

export type HomeStackParamList = {
  HomeRoot: undefined;
  SeedGenerator: undefined;
  LorebookGenerator: undefined;
  Validation: undefined;
  TokenOptimization: { text?: string; draftId?: string; assetName?: string } | undefined;
  Lineage: undefined;
  Blueprints: undefined;
  BlueprintEditor: { path: string };
  BatchGenerate: undefined;
  Compare: { character1?: string; character2?: string } | undefined;
  Offspring: { parent1?: string; parent2?: string } | undefined;
};

export type DraftsStackParamList = {
  DraftsList: undefined;
  DraftDetail: { draftId: string; historySnapshotId?: string };
  Chat: { draftId: string; asset?: string };
};

export type RootTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Generate: { seed?: string } | undefined;
  Drafts: NavigatorScreenParams<DraftsStackParamList> | undefined;
  Templates: undefined;
  Settings: { pairingLink?: string; pairingNonce?: string; focusSection?: 'pc-link'; focusNonce?: string } | undefined;
};

export type HomeScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'HomeRoot'>,
  BottomTabNavigationProp<RootTabParamList>
>;

export type HomeStackNavigationProp<RouteName extends keyof HomeStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, RouteName>,
  BottomTabNavigationProp<RootTabParamList>
>;

export type DraftsStackNavigationProp<RouteName extends keyof DraftsStackParamList> = CompositeNavigationProp<
  NativeStackNavigationProp<DraftsStackParamList, RouteName>,
  BottomTabNavigationProp<RootTabParamList>
>;

export type RootTabNavigationProp<RouteName extends keyof RootTabParamList> = BottomTabNavigationProp<
  RootTabParamList,
  RouteName
>;

export type GenerateRouteProp = RouteProp<RootTabParamList, 'Generate'>;
export type SettingsRouteProp = RouteProp<RootTabParamList, 'Settings'>;
export type CompareRouteProp = RouteProp<HomeStackParamList, 'Compare'>;
export type OffspringRouteProp = RouteProp<HomeStackParamList, 'Offspring'>;
export type DraftDetailRouteProp = RouteProp<DraftsStackParamList, 'DraftDetail'>;
export type ChatRouteProp = RouteProp<DraftsStackParamList, 'Chat'>;
export type BlueprintEditorRouteProp = RouteProp<HomeStackParamList, 'BlueprintEditor'>;
