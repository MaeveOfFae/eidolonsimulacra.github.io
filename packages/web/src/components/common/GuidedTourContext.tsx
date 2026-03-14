import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { HelpState } from '@char-gen/shared';
import {
  GETTING_STARTED_GUIDE_ID,
  GETTING_STARTED_TOUR_ID,
  getGuidedTour,
  guidedTours,
  isGuidedTourStepActive,
  type GuidedTourStep,
} from '@/lib/help';
import { CONFIG_MANAGER_CHANGED_EVENT, configManager } from '@/lib/config/manager';
import { api } from '@/lib/api';

const ACTIVE_TOUR_STORAGE_KEY = 'eidolon.web.activeTour';

interface PersistedTourState {
  activeTourId: string;
  activeStepIndex: number;
}

function readPersistedTourState(): PersistedTourState | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_TOUR_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedTourState;
    const tour = getGuidedTour(parsed.activeTourId);
    if (!tour || parsed.activeStepIndex < 0 || parsed.activeStepIndex >= tour.steps.length) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function clearPersistedTourState() {
  try {
    sessionStorage.removeItem(ACTIVE_TOUR_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

interface GuidedTourContextValue {
  tours: typeof guidedTours;
  activeTourId: string | null;
  activeStepIndex: number;
  helpState: HelpState;
  startTour: (tourId: string) => void;
  restartTour: (tourId: string) => void;
  closeTour: () => void;
  goToCurrentStep: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  finishTour: () => void;
  isTourCompleted: (tourId: string) => boolean;
  dismissTip: (tipId: string) => void;
}

const GuidedTourContext = createContext<GuidedTourContextValue | null>(null);

export function GuidedTourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const persistedState = readPersistedTourState();
  const [activeTourId, setActiveTourId] = useState<string | null>(persistedState?.activeTourId ?? null);
  const [activeStepIndex, setActiveStepIndex] = useState(persistedState?.activeStepIndex ?? 0);
  const [helpState, setHelpState] = useState(() => configManager.getHelpState());

  const activeTour = useMemo(
    () => (activeTourId ? getGuidedTour(activeTourId) : null),
    [activeTourId]
  );

  const syncHelpState = () => {
    setHelpState(configManager.getHelpState());
  };

  useEffect(() => {
    if (!activeTourId) {
      clearPersistedTourState();
      return;
    }

    try {
      sessionStorage.setItem(
        ACTIVE_TOUR_STORAGE_KEY,
        JSON.stringify({ activeTourId, activeStepIndex })
      );
    } catch {
      // Ignore storage errors.
    }
  }, [activeStepIndex, activeTourId]);

  useEffect(() => {
    const handleConfigChange = () => {
      syncHelpState();
    };

    window.addEventListener(CONFIG_MANAGER_CHANGED_EVENT, handleConfigChange);
    return () => {
      window.removeEventListener(CONFIG_MANAGER_CHANGED_EVENT, handleConfigChange);
    };
  }, []);

  const resolveStepNavigationPath = async (step: GuidedTourStep): Promise<string> => {
    if (step.to !== '/drafts/' || (step.matchMode ?? 'exact') !== 'prefix') {
      return step.to;
    }

    if (location.pathname.startsWith('/drafts/')) {
      return location.pathname;
    }

    try {
      const drafts = await api.getDrafts();
      const reviewId = drafts.drafts[0]?.review_id;
      return reviewId ? `/drafts/${encodeURIComponent(reviewId)}` : '/drafts';
    } catch {
      return '/drafts';
    }
  };

  const navigateToTourStep = async (tourId: string, stepIndex: number) => {
    const tour = getGuidedTour(tourId);
    const step = tour?.steps[stepIndex];

    if (!tour || !step) {
      return;
    }

    setActiveTourId(tourId);
    setActiveStepIndex(stepIndex);

    if (!isGuidedTourStepActive(location.pathname, step)) {
      navigate(await resolveStepNavigationPath(step));
    }
  };

  const startTour = (tourId: string) => {
    void navigateToTourStep(tourId, 0);
  };

  const restartTour = (tourId: string) => {
    const nextCompletedTours = helpState.completed_tours.filter((entry) => entry !== tourId);
    const updates: Partial<HelpState> = {
      completed_tours: nextCompletedTours,
    };

    if (tourId === GETTING_STARTED_TOUR_ID) {
      updates.first_run_completed = false;
      updates.completed_guides = helpState.completed_guides.filter((entry) => entry !== GETTING_STARTED_GUIDE_ID);
    }

    configManager.updateHelpState(updates);
    syncHelpState();
    void navigateToTourStep(tourId, 0);
  };

  const closeTour = () => {
    clearPersistedTourState();
    setActiveTourId(null);
    setActiveStepIndex(0);
  };

  const goToCurrentStep = () => {
    if (!activeTourId) {
      return;
    }

    void navigateToTourStep(activeTourId, activeStepIndex);
  };

  const goToPreviousStep = () => {
    if (!activeTourId || activeStepIndex === 0) {
      return;
    }

    void navigateToTourStep(activeTourId, activeStepIndex - 1);
  };

  const finishTour = () => {
    if (!activeTourId) {
      return;
    }

    const nextCompletedTours = Array.from(new Set([...helpState.completed_tours, activeTourId]));
    const updates: Partial<HelpState> = {
      completed_tours: nextCompletedTours,
    };

    if (activeTourId === GETTING_STARTED_TOUR_ID) {
      updates.first_run_completed = true;
      updates.completed_guides = Array.from(
        new Set([...helpState.completed_guides, GETTING_STARTED_GUIDE_ID])
      );
    }

    configManager.updateHelpState(updates);
    syncHelpState();
    closeTour();
  };

  const goToNextStep = () => {
    if (!activeTourId) {
      return;
    }

    const tour = getGuidedTour(activeTourId);
    if (!tour) {
      closeTour();
      return;
    }

    if (activeStepIndex >= tour.steps.length - 1) {
      finishTour();
      return;
    }

    void navigateToTourStep(activeTourId, activeStepIndex + 1);
  };

  const dismissTip = (tipId: string) => {
    const nextDismissed = Array.from(new Set([...helpState.dismissed_tips, tipId]));
    configManager.updateHelpState({ dismissed_tips: nextDismissed });
    syncHelpState();
  };

  const value = useMemo<GuidedTourContextValue>(
    () => ({
      tours: guidedTours,
      activeTourId,
      activeStepIndex,
      helpState,
      startTour,
      restartTour,
      closeTour,
      goToCurrentStep,
      goToNextStep,
      goToPreviousStep,
      finishTour,
      isTourCompleted: (tourId: string) => helpState.completed_tours.includes(tourId),
      dismissTip,
    }),
    [activeStepIndex, activeTourId, helpState]
  );

  return <GuidedTourContext.Provider value={value}>{children}</GuidedTourContext.Provider>;
}

export function useGuidedTour() {
  const context = useContext(GuidedTourContext);

  if (!context) {
    throw new Error('useGuidedTour must be used within GuidedTourProvider');
  }

  return context;
}