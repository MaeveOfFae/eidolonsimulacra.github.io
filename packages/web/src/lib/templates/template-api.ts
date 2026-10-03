/**
 * Template CRUD, validation, and import/export for the browser API facade.
 *
 * Extracted from `EidolonBrowserAPI` (4.7.0). Templates resolve through the
 * browser template store (`templates/browser.ts`), which merges the built-in
 * `blueprints/templates/` definitions with browser-persisted custom records.
 * Deleting never removes a built-in, and `updateTemplate` on a built-in
 * redirects to a uniquely named custom copy. Behavior is pinned by
 * `api.templates.test.ts` through the facade.
 */

import {
  buildMissingTemplateBlueprintWarnings,
  buildStoredTemplateRecord,
  validateTemplate as validateTemplateDefinition,
  type CreateTemplateRequest,
  type DuplicateTemplateRequest,
  type Template,
  type TemplateBlueprintContentsResponse,
  type TemplateValidationResult,
  type UpdateTemplateRequest,
} from '@char-gen/shared';
import { APIError } from '../api-error.js';
import { createDownload, slugifyFileName, type DownloadResponse } from '../download-response.js';
import {
  type StoredTemplateRecord,
  getAllTemplateRecords,
  getStoredTemplateRecord,
  getStoredTemplates,
  getTemplateRecord,
  resolveTemplateBlueprintContent,
  saveStoredTemplates,
} from './browser.js';

function getUniqueTemplateName(requestedName: string, excludeName?: string): string {
  const existingNames = new Set(
    getAllTemplateRecords()
      .map((record) => record.template.name)
      .filter((name) => name !== excludeName),
  );

  if (!existingNames.has(requestedName)) {
    return requestedName;
  }

  const copyBase = requestedName.endsWith(' Copy') ? requestedName : `${requestedName} Copy`;
  if (!existingNames.has(copyBase)) {
    return copyBase;
  }

  let suffix = 2;
  let candidate = `${copyBase} ${suffix}`;
  while (existingNames.has(candidate)) {
    suffix += 1;
    candidate = `${copyBase} ${suffix}`;
  }

  return candidate;
}

export async function getTemplates(): Promise<Template[]> {
  return getAllTemplateRecords().map((record) => record.template);
}

export async function listTemplates(): Promise<Template[]> {
  return getTemplates();
}

export async function getTemplate(name: string): Promise<Template> {
  const record = getTemplateRecord(name);
  if (!record) {
    throw new APIError(404, `Template ${name} not found`);
  }
  return record.template;
}

export async function getTemplateBlueprintContents(name: string): Promise<TemplateBlueprintContentsResponse> {
  const record = getTemplateRecord(name);
  if (!record) {
    throw new APIError(404, `Template ${name} not found`);
  }
  return { blueprint_contents: record.blueprint_contents };
}

export async function createTemplate(template: CreateTemplateRequest): Promise<Template> {
  const records = getStoredTemplates();
  if (records.some((record) => record.template.name === template.name)) {
    throw new APIError(409, `Template ${template.name} already exists`);
  }
  const record = buildStoredTemplateRecord<StoredTemplateRecord>(template);
  records.push(record);
  saveStoredTemplates(records);

  return record.template;
}

export async function updateTemplate(name: string, template: UpdateTemplateRequest): Promise<Template> {
  const records = getStoredTemplates();
  const index = records.findIndex((record) => record.template.name === name);
  if (index < 0) {
    const sourceRecord = getTemplateRecord(name);
    if (!sourceRecord) {
      throw new APIError(404, `Template ${name} not found`);
    }

    const nextName = getUniqueTemplateName(template.name, name);
    return createTemplate({
      ...template,
      name: nextName,
    });
  }

  if (template.name !== name) {
    const conflictingRecord = getTemplateRecord(template.name);
    if (conflictingRecord && conflictingRecord.template.name !== name) {
      throw new APIError(409, `Template ${template.name} already exists`);
    }
  }

  records[index] = buildStoredTemplateRecord<StoredTemplateRecord>(template, {
    templateRoot: records[index].template_root,
  });
  saveStoredTemplates(records);

  return records[index].template;
}

export async function deleteTemplate(name: string): Promise<{ status: string; name: string }> {
  const records = getStoredTemplates().filter((record) => record.template.name !== name);
  saveStoredTemplates(records);

  return { status: 'deleted', name };
}

export async function duplicateTemplate(name: string, request: DuplicateTemplateRequest): Promise<Template> {
  const source = getTemplateRecord(name);
  if (!source) {
    throw new APIError(404, `Template ${name} not found`);
  }
  return createTemplate({
    name: request.name,
    version: request.version || source.template.version,
    description: source.template.description,
    assets: source.template.assets,
    blueprint_contents: source.blueprint_contents,
  });
}

export async function validateTemplate(name: string): Promise<TemplateValidationResult> {
  const record = getTemplateRecord(name);
  if (!record) {
    throw new APIError(404, `Template ${name} not found`);
  }
  const validation = validateTemplateDefinition(record.template);
  const warnings = buildMissingTemplateBlueprintWarnings(
    record.template,
    (assetName) => resolveTemplateBlueprintContent(record.template.name, assetName) ?? null,
  );
  return { errors: validation.errors, warnings };
}

export async function exportTemplate(name: string): Promise<DownloadResponse> {
  const record = getStoredTemplateRecord(name) ?? getTemplateRecord(name);
  if (!record) {
    throw new APIError(404, `Template ${name} not found`);
  }
  return createDownload(JSON.stringify(record, null, 2), `${slugifyFileName(name)}.json`, 'application/json');
}

export async function importTemplate(file: File): Promise<Template> {
  const parsed = JSON.parse(await file.text()) as Partial<StoredTemplateRecord & CreateTemplateRequest>;
  if ('template' in parsed && parsed.template) {
    const record = parsed as StoredTemplateRecord;
    return createTemplate({
      name: record.template.name,
      version: record.template.version,
      description: record.template.description,
      assets: record.template.assets,
      blueprint_contents: record.blueprint_contents,
    });
  }
  return createTemplate({
    name: parsed.name || file.name.replace(/\.[^.]+$/, ''),
    version: parsed.version || '1.0',
    description: parsed.description || '',
    assets: parsed.assets || [],
    blueprint_contents: parsed.blueprint_contents || {},
  } as CreateTemplateRequest);
}
