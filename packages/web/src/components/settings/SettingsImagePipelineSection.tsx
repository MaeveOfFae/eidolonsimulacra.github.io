import { useState } from 'react';
import { Image as ImageIcon, Loader2, PlugZap } from 'lucide-react';
import {
  COMFY_PRESET_LABELS,
  comfyListCheckpoints,
  createDefaultComfyUIConfig,
  type ComfyUIConfig,
  type ComfyWorkflowSelection,
} from '@char-gen/shared';
import { describeComfyTransportError, getComfyFetch } from '@/lib/comfyui/transport';
import { testComfyConnection, type ComfyConnectionTest } from '@/lib/comfyui/run';

/**
 * Settings → Image Pipeline: the ComfyUI handoff configuration. Connection testing and
 * the checkpoint picker talk to the live server through the runtime transport, so the
 * browser tab explains CORS requirements when they bite instead of failing opaquely.
 */
export interface SettingsImagePipelineSectionProps {
  comfyui: ComfyUIConfig | undefined;
  onChange: (updates: Partial<ComfyUIConfig>) => void;
}

const inputClass =
  'w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function SettingsImagePipelineSection({ comfyui, onChange }: SettingsImagePipelineSectionProps) {
  const config = comfyui ?? createDefaultComfyUIConfig();
  const [connection, setConnection] = useState<ComfyConnectionTest | null>(null);
  const [testing, setTesting] = useState(false);
  const [checkpoints, setCheckpoints] = useState<string[] | null>(null);
  const [checkpointsError, setCheckpointsError] = useState<string | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setConnection(await testComfyConnection(config));
    setTesting(false);
  };

  const handleFetchCheckpoints = async () => {
    setCheckpointsError(null);
    try {
      setCheckpoints(await comfyListCheckpoints({ baseUrl: config.base_url, fetchFn: getComfyFetch() }));
    } catch (error) {
      setCheckpoints(null);
      setCheckpointsError(describeComfyTransportError(error));
    }
  };

  const selection: ComfyWorkflowSelection = config.workflow_preset;

  return (
    <section className="app-panel p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-fuchsia-600 to-pink-600 p-2">
          <ImageIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Image Pipeline</h2>
          <p className="text-sm text-muted-foreground">
            Send approved a1111 prompts to a local ComfyUI and review the render in-app.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="comfy-base-url" className="mb-1 block text-sm font-medium">
            ComfyUI base URL
          </label>
          <div className="flex gap-2">
            <input
              id="comfy-base-url"
              className={inputClass}
              value={config.base_url}
              placeholder="http://127.0.0.1:8188"
              onChange={(event) => onChange({ base_url: event.target.value })}
            />
            <button
              type="button"
              onClick={() => void handleTest()}
              disabled={testing}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlugZap className="h-4 w-4" />}
              Test
            </button>
          </div>
          {connection && (
            <p className={`mt-1 text-xs ${connection.ok ? 'text-success' : 'text-destructive'}`}>
              {connection.message}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            In the browser, ComfyUI must be started with <code>--enable-cors-header</code>; the desktop app has no such
            restriction.
          </p>
        </div>

        <div>
          <label htmlFor="comfy-workflow" className="mb-1 block text-sm font-medium">
            Workflow
          </label>
          <select
            id="comfy-workflow"
            className={inputClass}
            value={selection}
            onChange={(event) => onChange({ workflow_preset: event.target.value as ComfyWorkflowSelection })}
          >
            <option value="default">{COMFY_PRESET_LABELS.default}</option>
            <option value="dual-encoder-ipadapter">{COMFY_PRESET_LABELS['dual-encoder-ipadapter']}</option>
            <option value="custom">Custom (imported API-format JSON)</option>
          </select>
        </div>

        {selection !== 'custom' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="comfy-checkpoint" className="mb-1 block text-sm font-medium">
                Base checkpoint
              </label>
              {checkpoints && checkpoints.length > 0 ? (
                <select
                  id="comfy-checkpoint"
                  className={inputClass}
                  value={config.checkpoint}
                  onChange={(event) => onChange({ checkpoint: event.target.value })}
                >
                  {checkpoints.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    id="comfy-checkpoint"
                    className={inputClass}
                    value={config.checkpoint}
                    onChange={(event) => onChange({ checkpoint: event.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => void handleFetchCheckpoints()}
                    className="inline-flex shrink-0 items-center rounded-lg border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                  >
                    Fetch
                  </button>
                </div>
              )}
              {checkpointsError && <p className="mt-1 text-xs text-destructive">{checkpointsError}</p>}
            </div>
            <div>
              <label htmlFor="comfy-refiner" className="mb-1 block text-sm font-medium">
                Refiner checkpoint <span className="text-muted-foreground">(dual-encoder preset)</span>
              </label>
              <input
                id="comfy-refiner"
                className={inputClass}
                value={config.refiner_checkpoint}
                onChange={(event) => onChange({ refiner_checkpoint: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <div>
                <label htmlFor="comfy-width" className="mb-1 block text-sm font-medium">
                  Width
                </label>
                <input
                  id="comfy-width"
                  type="number"
                  min={256}
                  max={2048}
                  step={64}
                  className={inputClass}
                  value={config.width}
                  onChange={(event) => onChange({ width: Number.parseInt(event.target.value, 10) || 832 })}
                />
              </div>
              <div>
                <label htmlFor="comfy-height" className="mb-1 block text-sm font-medium">
                  Height
                </label>
                <input
                  id="comfy-height"
                  type="number"
                  min={256}
                  max={2048}
                  step={64}
                  className={inputClass}
                  value={config.height}
                  onChange={(event) => onChange({ height: Number.parseInt(event.target.value, 10) || 1216 })}
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="comfy-ipadapter" className="mb-1 block text-sm font-medium">
                IPAdapter strength ({config.ipadapter_strength})
              </label>
              <input
                id="comfy-ipadapter"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={config.ipadapter_strength}
                onChange={(event) => onChange({ ipadapter_strength: Number.parseFloat(event.target.value) })}
                className="w-full"
              />
              <label className="mt-2 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.use_card_image_as_reference}
                  onChange={(event) => onChange({ use_card_image_as_reference: event.target.checked })}
                />
                Use the draft's card image as the IPAdapter reference
              </label>
            </div>
          </div>
        )}

        {selection === 'custom' && (
          <div>
            <label htmlFor="comfy-workflow-json" className="mb-1 block text-sm font-medium">
              Custom workflow (ComfyUI → Developer → Save (API Format))
            </label>
            <textarea
              id="comfy-workflow-json"
              className={`${inputClass} min-h-[220px] font-mono text-xs`}
              value={config.workflow_json}
              onChange={(event) => onChange({ workflow_json: event.target.value })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Title a text-encode node “Positive” (and “Negative”), or rely on the sampler links — both bind.
            </p>
          </div>
        )}

        <div>
          <label htmlFor="comfy-negative" className="mb-1 block text-sm font-medium">
            Negative prompt
          </label>
          <textarea
            id="comfy-negative"
            className={`${inputClass} min-h-[90px]`}
            value={config.negative_prompt}
            onChange={(event) => onChange({ negative_prompt: event.target.value })}
          />
        </div>
      </div>
    </section>
  );
}
