import { describe, expect, it } from 'vitest';
import { describeComfyBindingIssues, resolveComfyWorkflowBindings } from './binding';
import { buildComfyPositivePrompt, buildComfyPromptPayload } from './payload';
import { BUILTIN_COMFY_WORKFLOW_DEFAULT, BUILTIN_COMFY_WORKFLOW_DUAL_ENCODER_IPADAPTER } from './workflows';
import type { ComfyWorkflowGraph } from './types';

describe('built-in presets', () => {
  it('bind cleanly and carry the expected pipeline', () => {
    for (const graph of [BUILTIN_COMFY_WORKFLOW_DEFAULT, BUILTIN_COMFY_WORKFLOW_DUAL_ENCODER_IPADAPTER]) {
      expect(describeComfyBindingIssues(graph)).toEqual([]);
    }

    const bindings = resolveComfyWorkflowBindings(BUILTIN_COMFY_WORKFLOW_DEFAULT);
    expect(bindings.positive).toEqual(['3']);
    expect(bindings.negative).toEqual(['4']);
    expect(bindings.samplers).toEqual(['6']);
    expect(BUILTIN_COMFY_WORKFLOW_DEFAULT['2']!.inputs.stop_at_clip_layer).toBe(-2);
  });

  it('dual-encoder preset: skip 2 on both encoders, refiner + IPAdapter, one shared seed', () => {
    const graph = BUILTIN_COMFY_WORKFLOW_DUAL_ENCODER_IPADAPTER;
    expect(graph['2']!.inputs.stop_at_clip_layer).toBe(-2);
    expect(graph['11']!.inputs.stop_at_clip_layer).toBe(-2);
    expect(graph['6']!.class_type).toBe('IPAdapterUnifiedLoader');
    expect(graph['7']!.class_type).toBe('IPAdapterAdvanced');

    const bindings = resolveComfyWorkflowBindings(graph);
    expect(bindings.positive).toEqual(['3', '12']);
    expect(bindings.negative).toEqual(['4', '13']);
    expect(bindings.samplers).toEqual(['9', '14']);
    expect(bindings.imageLoaders[0]).toBe('8');
  });
});

describe('resolveComfyWorkflowBindings', () => {
  it('falls back to inferring encoders from sampler links when nothing is titled', () => {
    const graph: ComfyWorkflowGraph = {
      a: { class_type: 'CLIPTextEncode', inputs: { text: '' } },
      b: { class_type: 'CLIPTextEncode', inputs: { text: '' } },
      c: {
        class_type: 'KSampler',
        inputs: { positive: ['a', 0], negative: ['b', 0] },
      },
    };
    const bindings = resolveComfyWorkflowBindings(graph);
    expect(bindings.positive).toEqual(['a']);
    expect(bindings.negative).toEqual(['b']);
  });

  it('reports missing bindings readably', () => {
    const issues = describeComfyBindingIssues({ x: { class_type: 'VAEDecode', inputs: {} } });
    expect(issues.some((issue) => issue.includes('positive prompt node'))).toBe(true);
    expect(issues.some((issue) => issue.includes('No KSampler'))).toBe(true);
  });
});

describe('buildComfyPositivePrompt', () => {
  it('folds the five a1111 lines into one prompt string', () => {
    expect(buildComfyPositivePrompt('1girl, solo\n\r\nschool uniform\n\nindoors\nstanding\nportrait')).toBe(
      '1girl, solo,\nschool uniform,\nindoors,\nstanding,\nportrait',
    );
  });
});

describe('buildComfyPromptPayload', () => {
  it('injects prompts, seed, checkpoint, size, reference and strength without mutating the template', () => {
    const template = BUILTIN_COMFY_WORKFLOW_DUAL_ENCODER_IPADAPTER;
    const result = buildComfyPromptPayload({
      workflow: template,
      positivePrompt: '1girl, solo',
      negativePrompt: 'lowres',
      seed: 1234,
      checkpointName: 'my_base.safetensors',
      refinerCheckpointName: 'my_refiner.safetensors',
      width: 1024,
      height: 1024,
      referenceImageName: 'eidolon_ref_0.png',
      ipadapterStrength: 0.6,
    });

    expect(result.seed).toBe(1234);
    expect(result.graph['3']!.inputs.text).toBe('1girl, solo');
    expect(result.graph['12']!.inputs.text).toBe('1girl, solo');
    expect(result.graph['4']!.inputs.text).toBe('lowres');
    expect(result.graph['13']!.inputs.text).toBe('lowres');
    // KSamplerAdvanced uses noise_seed; both samplers share the seed.
    expect(result.graph['9']!.inputs.noise_seed).toBe(1234);
    expect(result.graph['14']!.inputs.noise_seed).toBe(1234);
    expect(result.graph['1']!.inputs.ckpt_name).toBe('my_base.safetensors');
    expect(result.graph['10']!.inputs.ckpt_name).toBe('my_refiner.safetensors');
    expect(result.graph['5']!.inputs.width).toBe(1024);
    expect(result.graph['5']!.inputs.height).toBe(1024);
    expect(result.graph['8']!.inputs.image).toBe('eidolon_ref_0.png');
    expect(result.graph['7']!.inputs.strength).toBe(0.6);

    // The preset object itself is untouched.
    expect(template['3']!.inputs.text).toBe('');
    expect(template['9']!.inputs.noise_seed).toBe(0);
    expect(template['5']!.inputs.width).toBe(832);
  });

  it('uses `seed` for plain KSampler nodes and generates a seed when none is given', () => {
    const result = buildComfyPromptPayload({
      workflow: BUILTIN_COMFY_WORKFLOW_DEFAULT,
      positivePrompt: '1girl',
      negativePrompt: 'lowres',
    });
    expect(typeof result.graph['6']!.inputs.seed).toBe('number');
    expect(result.graph['6']!.inputs.seed).toBe(result.seed);
  });
});
