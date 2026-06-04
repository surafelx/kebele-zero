import '@testing-library/jest-dom';

// Mock import.meta.env for Vite modules consumed in tests
(globalThis as any).importMeta = { env: { DEV: false, PROD: true } };

// Mock window.matchMedia (not implemented in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver (not implemented in jsdom)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Silence console noise during tests
const noop = () => {};
jest.spyOn(console, 'log').mockImplementation(noop);
jest.spyOn(console, 'warn').mockImplementation(noop);
jest.spyOn(console, 'error').mockImplementation(noop);
