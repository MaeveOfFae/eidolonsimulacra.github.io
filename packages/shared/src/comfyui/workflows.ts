/**
 * Built-in ComfyUI workflow presets (API format), matching the pipeline the a1111
 * asset was designed for: SDXL dual text encoders, CLIP skip 2, and — in the second
 * preset — a base+refiner two-stage sampler with IPAdapter reference images
 * (ComfyUI_IPAdapter_plus custom nodes).
 *
 * Node titles are the binding contract: `buildComfyPromptPayload` looks for the nodes
 * titled `Positive` / `Negative` / `Refiner Positive` / `Refiner Negative` first, and
 * falls back to inferring them from the sampler's positive/negative links — so the
 * same injection works on graphs users import via "Save (API Format)".
 *
 * Checkpoint filenames are environment-specific; they default to placeholders the
 * user replaces in Settings → Image Pipeline (or via an imported workflow).
 */
import type { ComfyWorkflowGraph, ComfyWorkflowPresetId } from './types';

const DEFAULT_NEGATIVE =
  'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, signature, watermark, username, blurry';

export const DEFAULT_COMFY_NEGATIVE_PROMPT = DEFAULT_NEGATIVE;

/** Core ComfyUI nodes only — runs on any install once the checkpoint name is set. */
export const BUILTIN_COMFY_WORKFLOW_DEFAULT: ComfyWorkflowGraph = {
  '1': {
    class_type: 'CheckpointLoaderSimple',
    _meta: { title: 'Load Checkpoint' },
    inputs: { ckpt_name: 'illustriousXL_v01.safetensors' },
  },
  '2': {
    class_type: 'CLIPSetLastLayer',
    _meta: { title: 'CLIP Skip 2' },
    inputs: { stop_at_clip_layer: -2, clip: ['1', 1] },
  },
  '3': {
    class_type: 'CLIPTextEncode',
    _meta: { title: 'Positive' },
    inputs: { text: '', clip: ['2', 1] },
  },
  '4': {
    class_type: 'CLIPTextEncode',
    _meta: { title: 'Negative' },
    inputs: { text: '', clip: ['2', 1] },
  },
  '5': {
    class_type: 'EmptyLatentImage',
    _meta: { title: 'Latent' },
    inputs: { width: 832, height: 1216, batch_size: 1 },
  },
  '6': {
    class_type: 'KSampler',
    _meta: { title: 'Sampler' },
    inputs: {
      seed: 0,
      steps: 24,
      cfg: 5.0,
      sampler_name: 'dpmpp_2m',
      scheduler: 'karras',
      denoise: 1.0,
      model: ['1', 0],
      positive: ['3', 0],
      negative: ['4', 0],
      latent_image: ['5', 0],
    },
  },
  '7': {
    class_type: 'VAEDecode',
    _meta: { title: 'Decode' },
    inputs: { samples: ['6', 0], vae: ['1', 2] },
  },
  '8': {
    class_type: 'SaveImage',
    _meta: { title: 'Save Image' },
    inputs: { filename_prefix: 'eidolon', images: ['7', 0] },
  },
};

/**
 * The full pipeline the image assets are tuned for: SDXL base + refiner dual-encoder,
 * CLIP skip 2 on both encoders, IPAdapter reference steering, two-stage sampling
 * (base steps 0–20, refiner 20–28). Requires ComfyUI_IPAdapter_plus for the
 * IPAdapterUnifiedLoader / IPAdapterAdvanced nodes; the reference `LoadImage` node is
 * titled `Reference` and gets the uploaded card image at submit time.
 */
export const BUILTIN_COMFY_WORKFLOW_DUAL_ENCODER_IPADAPTER: ComfyWorkflowGraph = {
  '1': {
    class_type: 'CheckpointLoaderSimple',
    _meta: { title: 'Base Checkpoint' },
    inputs: { ckpt_name: 'illustriousXL_v01.safetensors' },
  },
  '2': {
    class_type: 'CLIPSetLastLayer',
    _meta: { title: 'CLIP Skip 2' },
    inputs: { stop_at_clip_layer: -2, clip: ['1', 1] },
  },
  '3': {
    class_type: 'CLIPTextEncode',
    _meta: { title: 'Positive' },
    inputs: { text: '', clip: ['2', 1] },
  },
  '4': {
    class_type: 'CLIPTextEncode',
    _meta: { title: 'Negative' },
    inputs: { text: '', clip: ['2', 1] },
  },
  '5': {
    class_type: 'EmptyLatentImage',
    _meta: { title: 'Latent' },
    inputs: { width: 832, height: 1216, batch_size: 1 },
  },
  '6': {
    class_type: 'IPAdapterUnifiedLoader',
    _meta: { title: 'IPAdapter Loader' },
    inputs: { model: ['1', 0], ipadapter: 'PLUS (high strength)' },
  },
  '7': {
    class_type: 'IPAdapterAdvanced',
    _meta: { title: 'IPAdapter Apply' },
    inputs: {
      model: ['6', 0],
      ipadapter: ['6', 1],
      image: ['8', 0],
      weight_type: 'style and composition',
      combine_embeds: 'concat',
      start_at: 0.0,
      end_at: 1.0,
      embeds_scaling: 'V only',
      strength: 0.75,
      strength_type: 'style and composition',
      noise: 0.0,
    },
  },
  '8': {
    class_type: 'LoadImage',
    _meta: { title: 'Reference' },
    inputs: { image: 'example.png', upload: 'image' },
  },
  '9': {
    class_type: 'KSamplerAdvanced',
    _meta: { title: 'Base Sampler' },
    inputs: {
      add_noise: 'enable',
      noise_seed: 0,
      steps: 20,
      cfg: 5.0,
      sampler_name: 'dpmpp_2m',
      scheduler: 'karras',
      start_at_step: 0,
      end_at_step: 20,
      return_with_leftover_noise: 'disable',
      denoise: 1.0,
      model: ['7', 0],
      positive: ['3', 0],
      negative: ['4', 0],
      latent_image: ['5', 0],
    },
  },
  '10': {
    class_type: 'CheckpointLoaderSimple',
    _meta: { title: 'Refiner Checkpoint' },
    inputs: { ckpt_name: 'sd_xl_refiner_1.0.safetensors' },
  },
  '11': {
    class_type: 'CLIPSetLastLayer',
    _meta: { title: 'Refiner CLIP Skip' },
    inputs: { stop_at_clip_layer: -2, clip: ['10', 1] },
  },
  '12': {
    class_type: 'CLIPTextEncode',
    _meta: { title: 'Refiner Positive' },
    inputs: { text: '', clip: ['11', 1] },
  },
  '13': {
    class_type: 'CLIPTextEncode',
    _meta: { title: 'Refiner Negative' },
    inputs: { text: '', clip: ['11', 1] },
  },
  '14': {
    class_type: 'KSamplerAdvanced',
    _meta: { title: 'Refiner Sampler' },
    inputs: {
      add_noise: 'disable',
      noise_seed: 0,
      steps: 28,
      cfg: 4.5,
      sampler_name: 'dpmpp_2m',
      scheduler: 'karras',
      start_at_step: 20,
      end_at_step: 28,
      return_with_leftover_noise: 'disable',
      denoise: 1.0,
      model: ['10', 0],
      positive: ['12', 0],
      negative: ['13', 0],
      latent_image: ['9', 0],
    },
  },
  '15': {
    class_type: 'VAEDecode',
    _meta: { title: 'Decode' },
    inputs: { samples: ['14', 0], vae: ['1', 2] },
  },
  '16': {
    class_type: 'SaveImage',
    _meta: { title: 'Save Image' },
    inputs: { filename_prefix: 'eidolon', images: ['15', 0] },
  },
};

export function getBuiltinComfyWorkflow(preset: ComfyWorkflowPresetId): ComfyWorkflowGraph {
  if (preset === 'dual-encoder-ipadapter') {
    return BUILTIN_COMFY_WORKFLOW_DUAL_ENCODER_IPADAPTER;
  }
  return BUILTIN_COMFY_WORKFLOW_DEFAULT;
}
