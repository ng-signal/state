import { Injector, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { initializeBehaviors } from './initialize-behaviors.util';

describe('Behavior Factory Instantiation (no mocks)', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });

    injector = TestBed.inject(Injector);
    spyOn(console, 'warn');
  });

  it('handles no behaviors', () => {
    expect(initializeBehaviors(injector, [])).toEqual([]);
    expect(initializeBehaviors(injector, undefined as any)).toEqual([]);

    // eslint-disable-next-line
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('creates valid behaviors from factory functions', () => {
    const callOrder: string[] = [];

    // A real, minimal behavior implementation
    function simpleBehaviorFactory() {
      callOrder.push('factory-called');
      return {
        critical: true,
        onInit(key: string) {
          callOrder.push(`onInit:${key}`);
        },
        onSet(key: string) {
          callOrder.push(`onSet:${key}`);
        }
      };
    }

    const providers = initializeBehaviors(injector, [simpleBehaviorFactory]);
    const provider = providers.pop() as any;

    provider?.onInit?.('key');
    provider?.onSet?.('key');

    expect(callOrder).toEqual(['factory-called', 'onInit:key', 'onSet:key']);
  });

  it('handles factory returning non-object gracefully', () => {
    const badBehaviorFactory = () => undefined as any;

    initializeBehaviors(injector, [badBehaviorFactory]);

    // eslint-disable-next-line
    expect(console.warn).toHaveBeenCalledWith(
      '[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object'
    );
  });

  it('throws an error if a critical factory returns a non-object', () => {
    const badBehaviorFactory = () => undefined as any;
    (badBehaviorFactory as any).critical = true;

    expect(() => initializeBehaviors(injector, [badBehaviorFactory])).toThrowError(
      '[NgVault] Behavior did not return an object'
    );
  });

  it('continues execution when a factory throws', () => {
    const throwingFactory = () => {
      throw new Error('boom');
    };
    const workingFactory = () => ({
      onInit() {},
      onDestroy() {}
    });

    initializeBehaviors(injector, [throwingFactory, workingFactory]);

    // eslint-disable-next-line
    expect(console.warn).toHaveBeenCalledWith('[NgVault] Non-critical behavior initialization failed: boom');
  });

  it('ignores invalid non-function behaviors', () => {
    const invalidBehavior: any = 42;

    initializeBehaviors(injector, [invalidBehavior]);

    // eslint-disable-next-line
    expect(console.warn).toHaveBeenCalledWith(
      '[NgVault] Non-critical behavior initialization failed: factory is not a function'
    );
  });

  it('filters null and undefined factories but retains valid ones', () => {
    const nullFactory = () => null as any;
    const undefinedFactory = () => undefined as any;
    const validFactory = () => ({ onSet() {} });

    initializeBehaviors(injector, [nullFactory, undefinedFactory, validFactory]);

    // eslint-disable-next-line
    expect(console.warn).toHaveBeenCalledTimes(2);

    // eslint-disable-next-line
    const call1 = (console.warn as jasmine.Spy).calls.allArgs()[0];
    // eslint-disable-next-line
    const call2 = (console.warn as jasmine.Spy).calls.allArgs()[1];
    expect(call1).toEqual(['[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object']);
    expect(call2).toEqual(['[NgVault] Behavior initialization failed: [NgVault] Behavior did not return an object']);
  });

  it('throws an error if a critical factory returns a non-object', () => {
    const nullFactory = () => null as any;
    const undefinedFactory = () => undefined as any;
    (undefinedFactory as any).critical = true;
    const validFactory = () => ({
      onSet() {}
    });

    expect(() => initializeBehaviors(injector, [nullFactory, undefinedFactory, validFactory])).toThrowError(
      '[NgVault] Behavior did not return an object'
    );
  });
});
