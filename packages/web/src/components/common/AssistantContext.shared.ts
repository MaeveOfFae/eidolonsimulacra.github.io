import { createContext } from 'react';

export type AssistantScreenContext = Record<string, unknown>;

export interface AssistantContextValue {
  screenContext: AssistantScreenContext;
  setScreenContext: (ownerId: string, context: AssistantScreenContext, serializedContext: string) => void;
  clearScreenContext: (ownerId: string) => void;
}

export const AssistantContext = createContext<AssistantContextValue | null>(null);