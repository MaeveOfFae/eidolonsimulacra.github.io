import type { ContentMode } from '@char-gen/shared';
import type { SeedCoverageMode } from '../seed-generator.js';

const ACTIVE_GENERATION_SESSION_KEY = 'eidolon.active-generation-session';
const ACTIVE_OFFSPRING_SESSION_KEY = 'eidolon.active-offspring-session';
const ACTIVE_SEED_GENERATOR_SESSION_KEY = 'eidolon.active-seed-generator-session';
const ACTIVE_BATCH_GENERATION_SESSION_KEY = 'eidolon.active-batch-generation-session';
const ACTIVE_INTRO_GENERATOR_SESSION_KEY = 'eidolon.active-intro-generator-session';
const ACTIVE_DRAFT_REFINER_SESSION_KEY = 'eidolon.active-draft-refiner-session';

export type ActiveGenerationStatus = 'initializing' | 'generating' | 'reviewing' | 'saving';

export interface ActiveGenerationSession {
  version: 1;
  seed: string;
  mode: ContentMode;
  template?: string;
  assetDrafts: Record<string, string>;
  currentAsset: string | null;
  currentAssetContent: string;
  currentStatus: ActiveGenerationStatus;
  startedAt: number;
  updatedAt: number;
}

export type ActiveOffspringStatus = 'configuring' | 'generating_seed' | 'review_seed' | 'generating_character';

export interface ActiveOffspringSession {
  version: 1;
  parent1Id: string;
  parent2Id: string;
  mode: ContentMode;
  template?: string;
  templateManuallySelected: boolean;
  offspringSeed?: string;
  output: string;
  status: ActiveOffspringStatus;
  updatedAt: number;
}

export type ActiveSeedGeneratorStatus = 'idle' | 'generating' | 'ready';

export interface ActiveSeedGeneratorSession {
  version: 1;
  genreLines: string;
  activePreset: string | null;
  controls: {
    count: number;
    coverageMode: SeedCoverageMode;
  };
  seeds: string[];
  status: ActiveSeedGeneratorStatus;
  updatedAt: number;
}

export interface ActiveBatchJob {
  seed: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  draftPath?: string;
  error?: string;
}

export type ActiveBatchGenerationStatus = 'configuring' | 'running' | 'ready';

export interface ActiveBatchGenerationSession {
  version: 1;
  seeds: string[];
  mode: ContentMode;
  template?: string;
  parallel: boolean;
  maxConcurrent: number;
  inputText: string;
  jobs: ActiveBatchJob[];
  currentSeed: string;
  status: ActiveBatchGenerationStatus;
  updatedAt: number;
}

export type ActiveIntroGeneratorStatus = 'configuring' | 'generating' | 'ready';

export interface ActiveIntroGeneratorIntro {
  id: string;
  content: string;
  timestamp: number;
}

export interface ActiveIntroGeneratorSession {
  version: 1;
  selectedDraftId: string;
  generationCount: number;
  customInstructions: string;
  generatedIntros: ActiveIntroGeneratorIntro[];
  generatingContent: string;
  status: ActiveIntroGeneratorStatus;
  updatedAt: number;
}

export interface ActiveDraftRefinerAssetState {
  assetName: string;
  status: 'idle' | 'reviewing';
  content: string;
  originalContent: string;
}

export interface ActiveDraftRefinerSession {
  version: 1;
  selectedDraftId: string;
  assetStates: Record<string, ActiveDraftRefinerAssetState>;
  expandedAssets: string[];
  editingAsset: string | null;
  editContent: string;
  interrupted: boolean;
  updatedAt: number;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function isValidSession(value: unknown): value is ActiveGenerationSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveGenerationSession>;
  return session.version === 1
    && typeof session.seed === 'string'
    && typeof session.mode === 'string'
    && (typeof session.template === 'string' || typeof session.template === 'undefined')
    && !!session.assetDrafts
    && typeof session.assetDrafts === 'object'
    && (typeof session.currentAsset === 'string' || session.currentAsset === null)
    && typeof session.currentAssetContent === 'string'
    && typeof session.currentStatus === 'string'
    && typeof session.startedAt === 'number'
    && typeof session.updatedAt === 'number';
}

function isValidOffspringSession(value: unknown): value is ActiveOffspringSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveOffspringSession>;
  return session.version === 1
    && typeof session.parent1Id === 'string'
    && typeof session.parent2Id === 'string'
    && typeof session.mode === 'string'
    && (typeof session.template === 'string' || typeof session.template === 'undefined')
    && typeof session.templateManuallySelected === 'boolean'
    && (typeof session.offspringSeed === 'string' || typeof session.offspringSeed === 'undefined')
    && typeof session.output === 'string'
    && (
      session.status === 'configuring'
      || session.status === 'generating_seed'
      || session.status === 'review_seed'
      || session.status === 'generating_character'
    )
    && typeof session.updatedAt === 'number';
}

function isValidSeedGeneratorSession(value: unknown): value is ActiveSeedGeneratorSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveSeedGeneratorSession>;
  const controls = session.controls as ActiveSeedGeneratorSession['controls'] | undefined;
  return session.version === 1
    && typeof session.genreLines === 'string'
    && (typeof session.activePreset === 'string' || session.activePreset === null)
    && !!controls
    && typeof controls.count === 'number'
    && (controls.coverageMode === 'per-genre' || controls.coverageMode === 'blended')
    && Array.isArray(session.seeds)
    && session.seeds.every((seed) => typeof seed === 'string')
    && (session.status === 'idle' || session.status === 'generating' || session.status === 'ready')
    && typeof session.updatedAt === 'number';
}

function isValidBatchGenerationSession(value: unknown): value is ActiveBatchGenerationSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveBatchGenerationSession>;
  return session.version === 1
    && Array.isArray(session.seeds)
    && session.seeds.every((seed) => typeof seed === 'string')
    && typeof session.mode === 'string'
    && (typeof session.template === 'string' || typeof session.template === 'undefined')
    && typeof session.parallel === 'boolean'
    && typeof session.maxConcurrent === 'number'
    && typeof session.inputText === 'string'
    && Array.isArray(session.jobs)
    && session.jobs.every((job) => job && typeof job === 'object' && typeof job.seed === 'string' && typeof job.status === 'string')
    && typeof session.currentSeed === 'string'
    && (session.status === 'configuring' || session.status === 'running' || session.status === 'ready')
    && typeof session.updatedAt === 'number';
}

function isValidIntroGeneratorSession(value: unknown): value is ActiveIntroGeneratorSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveIntroGeneratorSession>;
  return session.version === 1
    && typeof session.selectedDraftId === 'string'
    && typeof session.generationCount === 'number'
    && typeof session.customInstructions === 'string'
    && Array.isArray(session.generatedIntros)
    && session.generatedIntros.every(
      (intro) => intro && typeof intro === 'object'
        && typeof intro.id === 'string'
        && typeof intro.content === 'string'
        && typeof intro.timestamp === 'number'
    )
    && typeof session.generatingContent === 'string'
    && (session.status === 'configuring' || session.status === 'generating' || session.status === 'ready')
    && typeof session.updatedAt === 'number';
}

function isValidDraftRefinerSession(value: unknown): value is ActiveDraftRefinerSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveDraftRefinerSession>;
  const assetStates = session.assetStates;
  return session.version === 1
    && typeof session.selectedDraftId === 'string'
    && !!assetStates
    && typeof assetStates === 'object'
    && Object.values(assetStates).every(
      (state) => state && typeof state === 'object'
        && typeof state.assetName === 'string'
        && (state.status === 'idle' || state.status === 'reviewing')
        && typeof state.content === 'string'
        && typeof state.originalContent === 'string'
    )
    && Array.isArray(session.expandedAssets)
    && session.expandedAssets.every((asset) => typeof asset === 'string')
    && (typeof session.editingAsset === 'string' || session.editingAsset === null)
    && typeof session.editContent === 'string'
    && typeof session.interrupted === 'boolean'
    && typeof session.updatedAt === 'number';
}

export function loadActiveGenerationSession(): ActiveGenerationSession | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_GENERATION_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isValidSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveGenerationSession(session: ActiveGenerationSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_GENERATION_SESSION_KEY, JSON.stringify(session));
}

export function clearActiveGenerationSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACTIVE_GENERATION_SESSION_KEY);
}

export function loadActiveOffspringSession(): ActiveOffspringSession | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_OFFSPRING_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isValidOffspringSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveOffspringSession(session: ActiveOffspringSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_OFFSPRING_SESSION_KEY, JSON.stringify(session));
}

export function clearActiveOffspringSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACTIVE_OFFSPRING_SESSION_KEY);
}

export function loadActiveSeedGeneratorSession(): ActiveSeedGeneratorSession | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_SEED_GENERATOR_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isValidSeedGeneratorSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveSeedGeneratorSession(session: ActiveSeedGeneratorSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_SEED_GENERATOR_SESSION_KEY, JSON.stringify(session));
}

export function clearActiveSeedGeneratorSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACTIVE_SEED_GENERATOR_SESSION_KEY);
}

export function loadActiveBatchGenerationSession(): ActiveBatchGenerationSession | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_BATCH_GENERATION_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isValidBatchGenerationSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveBatchGenerationSession(session: ActiveBatchGenerationSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_BATCH_GENERATION_SESSION_KEY, JSON.stringify(session));
}

export function clearActiveBatchGenerationSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACTIVE_BATCH_GENERATION_SESSION_KEY);
}

export function loadActiveIntroGeneratorSession(): ActiveIntroGeneratorSession | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_INTRO_GENERATOR_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isValidIntroGeneratorSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveIntroGeneratorSession(session: ActiveIntroGeneratorSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_INTRO_GENERATOR_SESSION_KEY, JSON.stringify(session));
}

export function clearActiveIntroGeneratorSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACTIVE_INTRO_GENERATOR_SESSION_KEY);
}

export function loadActiveDraftRefinerSession(): ActiveDraftRefinerSession | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_DRAFT_REFINER_SESSION_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    return isValidDraftRefinerSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveDraftRefinerSession(session: ActiveDraftRefinerSession): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ACTIVE_DRAFT_REFINER_SESSION_KEY, JSON.stringify(session));
}

export function clearActiveDraftRefinerSession(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(ACTIVE_DRAFT_REFINER_SESSION_KEY);
}

export function matchesActiveGenerationSession(
  session: ActiveGenerationSession,
  params: { seed: string; mode: ContentMode; template?: string }
): boolean {
  return session.seed === params.seed
    && session.mode === params.mode
    && (session.template || '') === (params.template || '');
}