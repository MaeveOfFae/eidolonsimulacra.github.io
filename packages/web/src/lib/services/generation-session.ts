import { MAX_CONNECTED_DRAFT_REFERENCES, type ContentMode, type ImportedCharacter } from '@char-gen/shared';
import type { SeedCoverageMode } from '../seed-generator.js';
import { readPersistedString, removePersistedValues, writePersistedString } from '../persistence/storage.js';

const ACTIVE_GENERATION_SESSION_KEY = 'eidolon.active-generation-session';
const ACTIVE_OFFSPRING_SESSION_KEY = 'eidolon.active-offspring-session';
const ACTIVE_SEED_GENERATOR_SESSION_KEY = 'eidolon.active-seed-generator-session';
const ACTIVE_BATCH_GENERATION_SESSION_KEY = 'eidolon.active-batch-generation-session';
const ACTIVE_DRAFT_REFINER_SESSION_KEY = 'eidolon.active-draft-refiner-session';
const ACTIVE_ASSET_REGENERATOR_SESSION_KEY = 'eidolon.active-asset-regenerator-session';

export type ActiveGenerationStatus = 'initializing' | 'generating' | 'paused' | 'reviewing' | 'saving';

export interface ActiveGenerationSession {
  version: 1;
  seed: string;
  mode: ContentMode;
  template?: string;
  selectedAssets?: string[];
  connectedDraftIds?: string[];
  importedCharacter?: ImportedCharacterSnapshot;
  assetDrafts: Record<string, string>;
  currentAsset: string | null;
  currentAssetContent: string;
  currentStatus: ActiveGenerationStatus;
  startedAt: number;
  updatedAt: number;
}

export interface ImportedCharacterSnapshot {
  name: string;
  sourceFormat: ImportedCharacter['sourceFormat'];
  sourcePreset?: string;
  templateName?: string;
  assets: Record<string, string>;
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
  selectedAssets?: string[];
  connectedDraftIds?: string[];
  parallel: boolean;
  maxConcurrent: number;
  inputText: string;
  jobs: ActiveBatchJob[];
  currentSeed: string;
  status: ActiveBatchGenerationStatus;
  updatedAt: number;
}

export type ActiveAssetRegeneratorStatus = 'configuring' | 'generating' | 'ready';

export interface ActiveAssetRegeneratorCandidate {
  id: string;
  content: string;
  timestamp: number;
}

export interface ActiveAssetRegeneratorSession {
  version: 1;
  draftId: string;
  assetName: string;
  generationCount: number;
  customInstructions: string;
  blueprintOverrideContent: string;
  generatedCandidates: ActiveAssetRegeneratorCandidate[];
  expandedCandidates: string[];
  generatingContent: string;
  status: ActiveAssetRegeneratorStatus;
  updatedAt: number;
}

export interface ActiveDraftRefinerAssetState {
  assetName: string;
  status: 'idle' | 'reviewing';
  content: string;
  originalContent: string;
  storedContent?: string | null;
}

export interface ActiveDraftRefinerSession {
  version: 1;
  selectedDraftId: string;
  transientInstructions?: string;
  assetStates: Record<string, ActiveDraftRefinerAssetState>;
  expandedAssets: string[];
  editingAsset: string | null;
  editContent: string;
  interrupted: boolean;
  updatedAt: number;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined';
}

function readStoredSession<T>(storageKey: string): T | null {
  const raw = readPersistedString(storageKey)?.value;
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStoredSession(storageKey: string, value: unknown): void {
  writePersistedString(storageKey, [], JSON.stringify(value));
}

function clearStoredSession(storageKey: string): void {
  removePersistedValues([storageKey]);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === 'string')
  );
}

function isImportedCharacterSnapshot(value: unknown): value is ImportedCharacterSnapshot {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const snapshot = value as Partial<ImportedCharacterSnapshot>;
  return (
    typeof snapshot.name === 'string' &&
    typeof snapshot.sourceFormat === 'string' &&
    (typeof snapshot.sourcePreset === 'string' || typeof snapshot.sourcePreset === 'undefined') &&
    (typeof snapshot.templateName === 'string' || typeof snapshot.templateName === 'undefined') &&
    isStringRecord(snapshot.assets)
  );
}

function normalizeImportedCharacterSnapshot(
  importedCharacter:
    | Pick<ImportedCharacterSnapshot, 'name' | 'sourceFormat' | 'sourcePreset' | 'templateName' | 'assets'>
    | undefined,
): ImportedCharacterSnapshot | undefined {
  if (!importedCharacter) {
    return undefined;
  }

  const assets = Object.fromEntries(
    Object.entries(importedCharacter.assets)
      .filter(
        (entry): entry is [string, string] =>
          typeof entry[0] === 'string' && entry[0].trim().length > 0 && typeof entry[1] === 'string',
      )
      .sort(([left], [right]) => left.localeCompare(right)),
  );

  return {
    name: importedCharacter.name,
    sourceFormat: importedCharacter.sourceFormat,
    ...(importedCharacter.sourcePreset ? { sourcePreset: importedCharacter.sourcePreset } : {}),
    ...(importedCharacter.templateName ? { templateName: importedCharacter.templateName } : {}),
    assets,
  };
}

function normalizeConnectedDraftIds(value: string[] | undefined): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const entry of value) {
    if (typeof entry !== 'string') {
      continue;
    }

    const draftId = entry.trim();
    if (!draftId || seen.has(draftId)) {
      continue;
    }

    seen.add(draftId);
    normalized.push(draftId);

    if (normalized.length >= MAX_CONNECTED_DRAFT_REFERENCES) {
      break;
    }
  }

  return normalized;
}

function isValidSession(value: unknown): value is ActiveGenerationSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveGenerationSession>;
  return (
    session.version === 1 &&
    typeof session.seed === 'string' &&
    typeof session.mode === 'string' &&
    (typeof session.template === 'string' || typeof session.template === 'undefined') &&
    (typeof session.selectedAssets === 'undefined' || isStringArray(session.selectedAssets)) &&
    (typeof session.connectedDraftIds === 'undefined' || isStringArray(session.connectedDraftIds)) &&
    (typeof session.importedCharacter === 'undefined' || isImportedCharacterSnapshot(session.importedCharacter)) &&
    !!session.assetDrafts &&
    typeof session.assetDrafts === 'object' &&
    (typeof session.currentAsset === 'string' || session.currentAsset === null) &&
    typeof session.currentAssetContent === 'string' &&
    typeof session.currentStatus === 'string' &&
    typeof session.startedAt === 'number' &&
    typeof session.updatedAt === 'number'
  );
}

function isValidOffspringSession(value: unknown): value is ActiveOffspringSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveOffspringSession>;
  return (
    session.version === 1 &&
    typeof session.parent1Id === 'string' &&
    typeof session.parent2Id === 'string' &&
    typeof session.mode === 'string' &&
    (typeof session.template === 'string' || typeof session.template === 'undefined') &&
    typeof session.templateManuallySelected === 'boolean' &&
    (typeof session.offspringSeed === 'string' || typeof session.offspringSeed === 'undefined') &&
    typeof session.output === 'string' &&
    (session.status === 'configuring' ||
      session.status === 'generating_seed' ||
      session.status === 'review_seed' ||
      session.status === 'generating_character') &&
    typeof session.updatedAt === 'number'
  );
}

function isValidSeedGeneratorSession(value: unknown): value is ActiveSeedGeneratorSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveSeedGeneratorSession>;
  const controls = session.controls as ActiveSeedGeneratorSession['controls'] | undefined;
  return (
    session.version === 1 &&
    typeof session.genreLines === 'string' &&
    (typeof session.activePreset === 'string' || session.activePreset === null) &&
    !!controls &&
    typeof controls.count === 'number' &&
    (controls.coverageMode === 'per-genre' || controls.coverageMode === 'blended') &&
    Array.isArray(session.seeds) &&
    session.seeds.every((seed) => typeof seed === 'string') &&
    (session.status === 'idle' || session.status === 'generating' || session.status === 'ready') &&
    typeof session.updatedAt === 'number'
  );
}

function isValidBatchGenerationSession(value: unknown): value is ActiveBatchGenerationSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveBatchGenerationSession>;
  return (
    session.version === 1 &&
    Array.isArray(session.seeds) &&
    session.seeds.every((seed) => typeof seed === 'string') &&
    typeof session.mode === 'string' &&
    (typeof session.template === 'string' || typeof session.template === 'undefined') &&
    (typeof session.selectedAssets === 'undefined' || isStringArray(session.selectedAssets)) &&
    (typeof session.connectedDraftIds === 'undefined' || isStringArray(session.connectedDraftIds)) &&
    typeof session.parallel === 'boolean' &&
    typeof session.maxConcurrent === 'number' &&
    typeof session.inputText === 'string' &&
    Array.isArray(session.jobs) &&
    session.jobs.every(
      (job) => job && typeof job === 'object' && typeof job.seed === 'string' && typeof job.status === 'string',
    ) &&
    typeof session.currentSeed === 'string' &&
    (session.status === 'configuring' || session.status === 'running' || session.status === 'ready') &&
    typeof session.updatedAt === 'number'
  );
}

function isValidDraftRefinerSession(value: unknown): value is ActiveDraftRefinerSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveDraftRefinerSession>;
  const assetStates = session.assetStates;
  return (
    session.version === 1 &&
    typeof session.selectedDraftId === 'string' &&
    (typeof session.transientInstructions === 'string' || typeof session.transientInstructions === 'undefined') &&
    !!assetStates &&
    typeof assetStates === 'object' &&
    Object.values(assetStates).every(
      (state) =>
        state &&
        typeof state === 'object' &&
        typeof state.assetName === 'string' &&
        (state.status === 'idle' || state.status === 'reviewing') &&
        typeof state.content === 'string' &&
        typeof state.originalContent === 'string' &&
        (typeof state.storedContent === 'undefined' ||
          typeof state.storedContent === 'string' ||
          state.storedContent === null),
    ) &&
    Array.isArray(session.expandedAssets) &&
    session.expandedAssets.every((asset) => typeof asset === 'string') &&
    (typeof session.editingAsset === 'string' || session.editingAsset === null) &&
    typeof session.editContent === 'string' &&
    typeof session.interrupted === 'boolean' &&
    typeof session.updatedAt === 'number'
  );
}

function isValidAssetRegeneratorSession(value: unknown): value is ActiveAssetRegeneratorSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as Partial<ActiveAssetRegeneratorSession>;
  return (
    session.version === 1 &&
    typeof session.draftId === 'string' &&
    typeof session.assetName === 'string' &&
    typeof session.generationCount === 'number' &&
    typeof session.customInstructions === 'string' &&
    (typeof session.blueprintOverrideContent === 'string' || typeof session.blueprintOverrideContent === 'undefined') &&
    Array.isArray(session.generatedCandidates) &&
    session.generatedCandidates.every(
      (candidate) =>
        candidate &&
        typeof candidate === 'object' &&
        typeof candidate.id === 'string' &&
        typeof candidate.content === 'string' &&
        typeof candidate.timestamp === 'number',
    ) &&
    Array.isArray(session.expandedCandidates) &&
    session.expandedCandidates.every((candidateId) => typeof candidateId === 'string') &&
    typeof session.generatingContent === 'string' &&
    (session.status === 'configuring' || session.status === 'generating' || session.status === 'ready') &&
    typeof session.updatedAt === 'number'
  );
}

export function loadActiveGenerationSession(): ActiveGenerationSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const parsed = readStoredSession<unknown>(ACTIVE_GENERATION_SESSION_KEY);
  return isValidSession(parsed) ? parsed : null;
}

export function saveActiveGenerationSession(session: ActiveGenerationSession): void {
  if (!canUseStorage()) {
    return;
  }

  writeStoredSession(ACTIVE_GENERATION_SESSION_KEY, session);
}

export function clearActiveGenerationSession(): void {
  if (!canUseStorage()) {
    return;
  }

  clearStoredSession(ACTIVE_GENERATION_SESSION_KEY);
}

export function loadActiveOffspringSession(): ActiveOffspringSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const parsed = readStoredSession<unknown>(ACTIVE_OFFSPRING_SESSION_KEY);
  return isValidOffspringSession(parsed) ? parsed : null;
}

export function saveActiveOffspringSession(session: ActiveOffspringSession): void {
  if (!canUseStorage()) {
    return;
  }

  writeStoredSession(ACTIVE_OFFSPRING_SESSION_KEY, session);
}

export function clearActiveOffspringSession(): void {
  if (!canUseStorage()) {
    return;
  }

  clearStoredSession(ACTIVE_OFFSPRING_SESSION_KEY);
}

export function loadActiveSeedGeneratorSession(): ActiveSeedGeneratorSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const parsed = readStoredSession<unknown>(ACTIVE_SEED_GENERATOR_SESSION_KEY);
  return isValidSeedGeneratorSession(parsed) ? parsed : null;
}

export function saveActiveSeedGeneratorSession(session: ActiveSeedGeneratorSession): void {
  if (!canUseStorage()) {
    return;
  }

  writeStoredSession(ACTIVE_SEED_GENERATOR_SESSION_KEY, session);
}

export function clearActiveSeedGeneratorSession(): void {
  if (!canUseStorage()) {
    return;
  }

  clearStoredSession(ACTIVE_SEED_GENERATOR_SESSION_KEY);
}

export function loadActiveBatchGenerationSession(): ActiveBatchGenerationSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const parsed = readStoredSession<unknown>(ACTIVE_BATCH_GENERATION_SESSION_KEY);
  return isValidBatchGenerationSession(parsed) ? parsed : null;
}

export function saveActiveBatchGenerationSession(session: ActiveBatchGenerationSession): void {
  if (!canUseStorage()) {
    return;
  }

  writeStoredSession(ACTIVE_BATCH_GENERATION_SESSION_KEY, session);
}

export function clearActiveBatchGenerationSession(): void {
  if (!canUseStorage()) {
    return;
  }

  clearStoredSession(ACTIVE_BATCH_GENERATION_SESSION_KEY);
}

export function loadActiveDraftRefinerSession(): ActiveDraftRefinerSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const parsed = readStoredSession<unknown>(ACTIVE_DRAFT_REFINER_SESSION_KEY);
  return isValidDraftRefinerSession(parsed) ? parsed : null;
}

export function saveActiveDraftRefinerSession(session: ActiveDraftRefinerSession): void {
  if (!canUseStorage()) {
    return;
  }

  writeStoredSession(ACTIVE_DRAFT_REFINER_SESSION_KEY, session);
}

export function clearActiveDraftRefinerSession(): void {
  if (!canUseStorage()) {
    return;
  }

  clearStoredSession(ACTIVE_DRAFT_REFINER_SESSION_KEY);
}

export function loadActiveAssetRegeneratorSession(): ActiveAssetRegeneratorSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const parsed = readStoredSession<unknown>(ACTIVE_ASSET_REGENERATOR_SESSION_KEY);
  return isValidAssetRegeneratorSession(parsed) ? parsed : null;
}

export function saveActiveAssetRegeneratorSession(session: ActiveAssetRegeneratorSession): void {
  if (!canUseStorage()) {
    return;
  }

  writeStoredSession(ACTIVE_ASSET_REGENERATOR_SESSION_KEY, session);
}

export function clearActiveAssetRegeneratorSession(): void {
  if (!canUseStorage()) {
    return;
  }

  clearStoredSession(ACTIVE_ASSET_REGENERATOR_SESSION_KEY);
}

export function matchesActiveGenerationSession(
  session: ActiveGenerationSession,
  params: {
    seed: string;
    mode: ContentMode;
    template?: string;
    selectedAssets?: string[];
    connectedDraftIds?: string[];
    importedCharacter?: Pick<
      ImportedCharacterSnapshot,
      'name' | 'sourceFormat' | 'sourcePreset' | 'templateName' | 'assets'
    >;
  },
): boolean {
  const currentSelectedAssets = normalizeConnectedDraftIds(session.selectedAssets);
  const nextSelectedAssets = normalizeConnectedDraftIds(params.selectedAssets);
  const currentConnectedDraftIds = normalizeConnectedDraftIds(session.connectedDraftIds);
  const nextConnectedDraftIds = normalizeConnectedDraftIds(params.connectedDraftIds);
  const currentImportedCharacter = normalizeImportedCharacterSnapshot(session.importedCharacter);
  const nextImportedCharacter = normalizeImportedCharacterSnapshot(params.importedCharacter);

  return (
    session.seed === params.seed &&
    session.mode === params.mode &&
    (session.template || '') === (params.template || '') &&
    currentSelectedAssets.length === nextSelectedAssets.length &&
    currentSelectedAssets.every((assetName, index) => assetName === nextSelectedAssets[index]) &&
    currentConnectedDraftIds.length === nextConnectedDraftIds.length &&
    currentConnectedDraftIds.every((draftId, index) => draftId === nextConnectedDraftIds[index]) &&
    JSON.stringify(currentImportedCharacter ?? null) === JSON.stringify(nextImportedCharacter ?? null)
  );
}
