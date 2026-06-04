import EventEmitter from '../../folio/javascript/Utils/EventEmitter.js';

describe('EventEmitter', () => {
  let emitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  // ── on() ──────────────────────────────────────────────────────────────────

  describe('on()', () => {
    it('registers a callback for an event', () => {
      const cb = jest.fn();
      emitter.on('test', cb);
      emitter.trigger('test');
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('registers multiple callbacks for the same event', () => {
      const cb1 = jest.fn();
      const cb2 = jest.fn();
      emitter.on('test', cb1);
      emitter.on('test', cb2);
      emitter.trigger('test');
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });

    it('registers a namespaced callback', () => {
      const cb = jest.fn();
      emitter.on('test.myns', cb);
      emitter.trigger('test');
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('registers callbacks for multiple events via comma separation', () => {
      const cb = jest.fn();
      emitter.on('foo,bar', cb);
      emitter.trigger('foo');
      emitter.trigger('bar');
      expect(cb).toHaveBeenCalledTimes(2);
    });

    it('returns false when called with an empty name', () => {
      const result = emitter.on('', jest.fn());
      expect(result).toBe(false);
    });

    it('returns false when called without a callback', () => {
      const result = emitter.on('test', undefined);
      expect(result).toBe(false);
    });

    it('returns the emitter for chaining', () => {
      const result = emitter.on('test', jest.fn());
      expect(result).toBe(emitter);
    });
  });

  // ── off() ─────────────────────────────────────────────────────────────────

  describe('off()', () => {
    it('removes a registered callback', () => {
      const cb = jest.fn();
      emitter.on('test', cb);
      emitter.off('test');
      emitter.trigger('test');
      expect(cb).not.toHaveBeenCalled();
    });

    it('removes only the specified namespace', () => {
      const cbA = jest.fn();
      const cbB = jest.fn();
      emitter.on('test.nsA', cbA);
      emitter.on('test.nsB', cbB);
      emitter.off('test.nsA');
      emitter.trigger('test');
      expect(cbA).not.toHaveBeenCalled();
      expect(cbB).toHaveBeenCalledTimes(1);
    });

    it('removes the entire namespace when value is empty', () => {
      const cb = jest.fn();
      emitter.on('test.myns', cb);
      emitter.off('.myns');
      emitter.trigger('test');
      expect(cb).not.toHaveBeenCalled();
    });

    it('returns false when called with an empty name', () => {
      const result = emitter.off('');
      expect(result).toBe(false);
    });

    it('returns the emitter for chaining', () => {
      emitter.on('test', jest.fn());
      const result = emitter.off('test');
      expect(result).toBe(emitter);
    });
  });

  // ── trigger() ─────────────────────────────────────────────────────────────

  describe('trigger()', () => {
    it('fires a registered callback', () => {
      const cb = jest.fn();
      emitter.on('action', cb);
      emitter.trigger('action');
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('passes arguments to the callback', () => {
      const cb = jest.fn();
      emitter.on('action', cb);
      emitter.trigger('action', [42, 'hello']);
      expect(cb).toHaveBeenCalledWith(42, 'hello');
    });

    it('returns null (finalResult is initialised to null, not undefined)', () => {
      // The EventEmitter initialises `finalResult = null` so the
      // `typeof finalResult === 'undefined'` guard never fires.
      // trigger() therefore always returns null — this test documents
      // that known behaviour.
      emitter.on('compute', () => 99);
      const result = emitter.trigger('compute');
      expect(result).toBeNull();
    });

    it('does nothing when no callbacks are registered', () => {
      expect(() => emitter.trigger('unknown')).not.toThrow();
    });

    it('returns false when called with an empty name', () => {
      const result = emitter.trigger('');
      expect(result).toBe(false);
    });

    it('fires namespaced callbacks when triggered by base name', () => {
      const cb = jest.fn();
      emitter.on('tick.physics', cb);
      emitter.trigger('tick');
      expect(cb).toHaveBeenCalledTimes(1);
    });

    it('fires namespaced trigger against the correct namespace', () => {
      const cbA = jest.fn();
      const cbB = jest.fn();
      emitter.on('tick.physics', cbA);
      emitter.on('tick.render', cbB);
      emitter.trigger('tick.physics');
      expect(cbA).toHaveBeenCalledTimes(1);
      expect(cbB).not.toHaveBeenCalled();
    });
  });

  // ── resolveNames / resolveName ────────────────────────────────────────────

  describe('resolveNames()', () => {
    it('splits comma-separated names', () => {
      const names = emitter.resolveNames('foo,bar');
      expect(names).toEqual(['foo', 'bar']);
    });

    it('splits slash-separated names', () => {
      const names = emitter.resolveNames('foo/bar');
      expect(names).toEqual(['foo', 'bar']);
    });

    it('strips special characters', () => {
      const names = emitter.resolveNames('foo!@bar');
      expect(names).toEqual(['foobar']);
    });
  });

  describe('resolveName()', () => {
    it('parses a plain name with base namespace', () => {
      const name = emitter.resolveName('tick');
      expect(name.value).toBe('tick');
      expect(name.namespace).toBe('base');
    });

    it('parses a namespaced name', () => {
      const name = emitter.resolveName('tick.physics');
      expect(name.value).toBe('tick');
      expect(name.namespace).toBe('physics');
    });
  });
});
