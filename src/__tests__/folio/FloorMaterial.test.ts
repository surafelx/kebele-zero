// Mock GLSL shader imports (handled by jest.config.js moduleNameMapper,
// but also guard here to be safe)
jest.mock('../../folio/shaders/floor/fragment.glsl', () => 'mock-fragment', { virtual: true });
jest.mock('../../folio/shaders/floor/vertex.glsl', () => 'mock-vertex', { virtual: true });

import { FloorMaterial } from '../../folio/javascript/Materials/FloorMaterial';
import { DataTexture } from 'three';

describe('FloorMaterial', () => {
  let material: FloorMaterial;

  beforeEach(() => {
    material = new FloorMaterial();
  });

  // ── Constructor ────────────────────────────────────────────────────────────

  it('creates a material with a tBackground uniform set to null', () => {
    expect(material.uniforms.tBackground).toBeDefined();
    expect(material.uniforms.tBackground.value).toBeNull();
  });

  it('assigns string values to both vertex and fragment shaders', () => {
    // Exact values depend on jest moduleNameMapper; we just confirm they are strings
    expect(typeof material.vertexShader).toBe('string');
    expect(typeof material.fragmentShader).toBe('string');
  });

  // ── Color setters ──────────────────────────────────────────────────────────

  it('setting topLeftColor updates tBackground uniform to a DataTexture', () => {
    material.topLeftColor = '#ff0000';
    expect(material.uniforms.tBackground.value).toBeInstanceOf(DataTexture);
  });

  it('setting topRightColor updates tBackground uniform', () => {
    material.topRightColor = '#00ff00';
    expect(material.uniforms.tBackground.value).toBeInstanceOf(DataTexture);
  });

  it('setting bottomLeftColor updates tBackground uniform', () => {
    material.bottomLeftColor = '#0000ff';
    expect(material.uniforms.tBackground.value).toBeInstanceOf(DataTexture);
  });

  it('setting bottomRightColor updates tBackground uniform', () => {
    material.bottomRightColor = '#ffffff';
    expect(material.uniforms.tBackground.value).toBeInstanceOf(DataTexture);
  });

  // ── DataTexture dimensions ─────────────────────────────────────────────────

  it('creates a 2×2 DataTexture (4 pixels)', () => {
    material.topLeftColor = '#ff0000';
    const tex = material.uniforms.tBackground.value as DataTexture;
    expect(tex.image.width).toBe(2);
    expect(tex.image.height).toBe(2);
  });

  it('DataTexture has 16 bytes of data (4 pixels × 4 channels)', () => {
    material.topLeftColor = '#ff0000';
    const tex = material.uniforms.tBackground.value as DataTexture;
    expect(tex.image.data.length).toBe(16);
  });

  it('DataTexture is assigned to the uniform after color change', () => {
    // Three.js 0.139 does not expose needsUpdate as a readable getter;
    // we verify the texture instance is correctly assigned instead.
    material.topLeftColor = '#abcdef';
    const tex = material.uniforms.tBackground.value;
    expect(tex).not.toBeNull();
    expect(tex).toBeInstanceOf(DataTexture);
  });

  // ── Pixel values ──────────────────────────────────────────────────────────

  it('encodes white (#ffffff) as max channel values', () => {
    // Set all four corners to white
    material.topLeftColor = '#ffffff';
    material.topRightColor = '#ffffff';
    material.bottomLeftColor = '#ffffff';
    material.bottomRightColor = '#ffffff';
    const tex = material.uniforms.tBackground.value as DataTexture;
    const data = tex.image.data as Uint8Array;
    // All R/G/B channels should be ~250 (the material uses 250 as max)
    for (let i = 0; i < 16; i++) {
      if ((i + 1) % 4 !== 0) { // skip alpha channel
        expect(data[i]).toBeGreaterThan(200);
      }
    }
  });

  it('encodes black (#000000) as zero channel values', () => {
    material.topLeftColor = '#000000';
    material.topRightColor = '#000000';
    material.bottomLeftColor = '#000000';
    material.bottomRightColor = '#000000';
    const tex = material.uniforms.tBackground.value as DataTexture;
    const data = tex.image.data as Uint8Array;
    for (let i = 0; i < 16; i++) {
      if ((i + 1) % 4 !== 0) { // skip alpha channel
        expect(data[i]).toBe(0);
      }
    }
  });

  it('alpha channel is always 255', () => {
    material.topLeftColor = '#ff0000';
    const tex = material.uniforms.tBackground.value as DataTexture;
    const data = tex.image.data as Uint8Array;
    // Alpha is every 4th byte starting at index 3
    expect(data[3]).toBe(255);
    expect(data[7]).toBe(255);
    expect(data[11]).toBe(255);
    expect(data[15]).toBe(255);
  });
});
