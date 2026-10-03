/**
 * Draft export presets and artifact assembly for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.6.2). The preset list is static data;
 * `exportDraft` resolves the draft from local storage and renders it through
 * the shared export builders, falling back to the JSON preset for unknown
 * preset names. Behavior is pinned by `api.export.test.ts` through the facade.
 */

import { buildDraftExportArtifact, type ExportPresetSummary, type ExportRequest } from '@char-gen/shared';
import { APIError } from '../api-error.js';
import { createDownload, slugifyFileName, type DownloadResponse } from '../download-response.js';
import { DraftStorage } from '../storage/draft-db.js';

const EXPORT_PRESETS: ExportPresetSummary[] = [
  {
    name: 'Official PNG Character Card',
    path: 'png',
    format: 'png',
    description: 'Export a standard PNG character card with embedded V2/V3 card data.',
  },
  {
    name: 'Official V2/V3 Card JSON',
    path: 'json',
    format: 'json',
    description: 'Export a Chub-compatible V2/V3 character card JSON with Eidolon round-trip extensions.',
  },
  {
    name: 'text',
    path: 'text',
    format: 'text',
    description: 'Export draft assets as plain text sections.',
  },
  {
    name: 'combined',
    path: 'combined',
    format: 'combined',
    description: 'Export a markdown bundle with metadata and assets.',
  },
  {
    name: 'Printable PDF',
    path: 'pdf',
    format: 'pdf',
    description: 'Export a printable single-column PDF with metadata and every asset.',
  },
];

export async function getExportPresets(): Promise<ExportPresetSummary[]> {
  return EXPORT_PRESETS;
}

export async function exportDraft(request: ExportRequest): Promise<DownloadResponse> {
  const draft = await DraftStorage.getDraft(request.draft_id);
  if (!draft) {
    throw new APIError(404, `Draft ${request.draft_id} not found`);
  }
  const preset =
    request.preset === 'text' || request.preset === 'combined' || request.preset === 'png' || request.preset === 'pdf'
      ? request.preset
      : 'json';
  const includeMetadata = request.include_metadata !== false;
  const fileBase = slugifyFileName(draft.metadata.character_name || draft.metadata.seed || draft.metadata.review_id);
  const artifact = buildDraftExportArtifact(draft, preset, includeMetadata);

  return createDownload(artifact.content, `${fileBase}.${artifact.extension}`, artifact.contentType);
}
