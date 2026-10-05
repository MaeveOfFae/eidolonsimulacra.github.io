import { useRef, useState, useCallback } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import type { ImportedCharacter, Template } from '@char-gen/shared';
import { detectAndParseCharacter, formatSourceLabel } from '@char-gen/shared';
import { pickFile } from '../../utils/download';
import ModalOverlay from './ModalOverlay';

interface ImportCharacterModalProps {
  onClose: () => void;
  onImport: (character: ImportedCharacter) => void;
  template?: Pick<Template, 'name' | 'assets'>;
}

type ImportStep = 'upload' | 'preview' | 'done';

const ACCEPTED_EXTENSIONS = ['.json', '.png', '.txt', '.md'];

export default function ImportCharacterModal({ onClose, onImport, template }: ImportCharacterModalProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [parseError, setParseError] = useState<string | null>(null);
  const [importedCharacter, setImportedCharacter] = useState<ImportedCharacter | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setParseError(null);

      try {
        const filename = file.name.toLowerCase();

        if (filename.endsWith('.png')) {
          // Read as ArrayBuffer for PNG parsing
          const buffer = await file.arrayBuffer();
          const character = detectAndParseCharacter(buffer, file.name, { template });
          setImportedCharacter(character);
          setStep('preview');
        } else {
          // Read as text for JSON/text parsing
          const text = await file.text();
          const character = detectAndParseCharacter(text, file.name, { template });
          setImportedCharacter(character);
          setStep('preview');
        }
      } catch (err) {
        console.error('Import parse error:', err);
        setParseError(err instanceof Error ? err.message : 'Failed to parse character file');
        setStep('upload');
      }
    },
    [template],
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      void processFile(files[0]);
    },
    [processFile],
  );

  const handleBrowse = useCallback(async () => {
    const file = await pickFile({ accept: ACCEPTED_EXTENSIONS.join(',') }, fileInputRef.current);
    if (!file) {
      return;
    }

    await processFile(file);
  }, [processFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const toggleAsset = (assetName: string) => {
    setExpandedAssets((prev) => {
      const next = new Set(prev);
      if (next.has(assetName)) {
        next.delete(assetName);
      } else {
        next.add(assetName);
      }
      return next;
    });
  };

  const handleConfirmImport = () => {
    if (!importedCharacter) return;
    onImport(importedCharacter);
    setStep('done');
  };

  const assetNames = importedCharacter ? Object.keys(importedCharacter.assets) : [];
  const unmappedNames = importedCharacter?.unmappedFields ? Object.keys(importedCharacter.unmappedFields) : [];

  return (
    <ModalOverlay
      onClose={onClose}
      label="Import character"
      className="z-50 flex items-end justify-center p-3 sm:items-center sm:p-4"
      dismissible={step === 'done'}
    >
      <div className="relative flex h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-lg sm:h-auto sm:max-h-[min(85vh,52rem)]">
        {/* Header */}
        <div className="shrink-0 border-b border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Import Character</h2>
            <button onClick={onClose} title="Close" className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Import a character card to rehash it through the generation workflow.
          </p>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          <div className="space-y-4 pb-2">
            {/* Step: Upload */}
            {step === 'upload' && (
              <>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => void handleBrowse()}
                  className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                    isDragOver
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50 hover:bg-accent/30'
                  }`}
                >
                  <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium">Drop a character file here or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports TavernAI / SillyTavern JSON, PNG character cards, Chub AI, and plain text
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">({ACCEPTED_EXTENSIONS.join(', ')})</p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS.join(',')}
                  aria-label="Choose character file to import"
                  className="hidden"
                />

                {parseError && (
                  <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{parseError}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step: Preview */}
            {step === 'preview' && importedCharacter && (
              <>
                {/* Detected Format */}
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Detected Format</p>
                      <p className="text-sm font-semibold">{formatSourceLabel(importedCharacter.sourceFormat)}</p>
                    </div>
                    {importedCharacter.sourcePreset && (
                      <span className="app-pill app-pill-muted !px-2 !py-1 !text-[11px]">
                        {importedCharacter.sourcePreset}
                      </span>
                    )}
                  </div>
                </div>

                {/* Character Name */}
                <div>
                  <label className="text-sm font-medium">Character Name</label>
                  <p className="mt-0.5 text-lg font-semibold">{importedCharacter.name}</p>
                </div>

                {/* Mapped Assets */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mapped Assets ({assetNames.length})</label>
                  {assetNames.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No standard assets could be mapped from this file.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {assetNames.map((assetName) => {
                        const content = importedCharacter.assets[assetName];
                        const isExpanded = expandedAssets.has(assetName);
                        const preview = content.length > 120 ? content.slice(0, 120) + '…' : content;

                        return (
                          <div key={assetName} className="rounded-lg border border-border/60 bg-background/50">
                            <button
                              onClick={() => toggleAsset(assetName)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent/30 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                              )}
                              <FileText className="h-4 w-4 shrink-0 text-primary" />
                              <span className="font-medium">{assetName}</span>
                              <span className="ml-auto text-xs text-muted-foreground">{content.length} chars</span>
                            </button>
                            {isExpanded && (
                              <div className="border-t border-border/40 px-3 py-2">
                                <pre className="whitespace-pre-wrap break-words text-xs text-muted-foreground max-h-48 overflow-y-auto font-mono">
                                  {content}
                                </pre>
                              </div>
                            )}
                            {!isExpanded && (
                              <div className="border-t border-border/40 px-3 py-1.5">
                                <p className="text-xs text-muted-foreground truncate">{preview}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Unmapped Fields */}
                {unmappedNames.length > 0 && (
                  <details className="rounded-lg border border-border/40 bg-background/30">
                    <summary className="cursor-pointer px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                      Unmapped fields ({unmappedNames.length})
                    </summary>
                    <div className="px-3 pb-2 space-y-1">
                      {unmappedNames.map((field) => (
                        <div key={field} className="text-xs">
                          <span className="font-medium text-muted-foreground">{field}:</span>{' '}
                          <span className="text-muted-foreground truncate">
                            {(importedCharacter.unmappedFields?.[field] ?? '').slice(0, 80)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}

                {/* Info notice */}
                <div className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  The imported assets will be used as context for re-generating the character through the workflow. The
                  original seed cannot be recovered, but the imported content will guide the new generation.
                </div>
              </>
            )}

            {/* Step: Done */}
            {step === 'done' && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                <div>
                  <p className="text-lg font-semibold">Character Imported</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {importedCharacter?.name ?? 'Character'} has been loaded into the generation form. Adjust the seed
                    and settings, then generate to rehash.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-4">
          <div className="flex justify-end gap-2">
            {step === 'preview' && (
              <>
                <button
                  onClick={() => {
                    setStep('upload');
                    setImportedCharacter(null);
                    setParseError(null);
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-accent"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={assetNames.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  Import & Rehash
                </button>
              </>
            )}
            {(step === 'upload' || step === 'done') && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input hover:bg-accent"
              >
                {step === 'done' ? 'Close' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
