import { defineNgVaultBehaviorKey } from '@ngvault/shared';
declare const jasmine: any;

class TestBehavior {
  #events: any = [];
  counter = 0;

  get key(): string {
    return defineNgVaultBehaviorKey('testing', `id-${this.counter++}`);
  }

  constructor(
    public behaviorId: string,
    public type: string,
    public critial: boolean
  ) {
    this.resetEvents();
  }

  resetEvents(): void {
    this.counter = 0;
    this.#events.length = 0;
  }

  getEvents(): [] {
    return this.#events;
  }

  onInit(key: string) {
    this.#events.push(`onInit:${key}`);
  }

  onError(key: string) {
    this.#events.push(`onError:${key}`);
  }

  onReset(key: string) {
    this.#events.push(`onReset:${key}`);
  }

  onDestroy(key: string) {
    this.#events.push(`onDestroy:${key}`);
  }

  onDispose(key: string) {
    this.#events.push(`onDispose:${key}`);
  }

  onLoad(key: string) {
    this.#events.push(`onLoad:${key}`);
  }

  onPatch(key: string, ctx: any) {
    this.#events.push(`onPatch:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  onSet(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  startReplace(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  endReplace(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  startMerge(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  endMerge(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  startState(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  endState(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  error(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }

  insight = {
    onCellRegistered: () => {
      this.#events.push(`cell registered`);
    },

    // ✔ allow all events
    filterEventType: () => true,

    // ✔ request full state, payloads, and errors
    wantsState: true,
    wantsPayload: true,
    wantsErrors: true
  };
}
let testInstance: any;

export const withTestBehavior: any = (context: any): any => {
  testInstance = new TestBehavior(context.behaviorId, context.type || 'dev-tools', context.critial || false);
  return testInstance;
};
(withTestBehavior as any).type = 'dev-tools';
(withTestBehavior as any).critical = true;

export const getTestBehavior = () => {
  return testInstance;
};

export const withTestBehaviorV2: any = (context: any): any => {
  testInstance = new TestBehavior(context.behaviorId, context.type || 'insights', context.critial || false);
  return testInstance;
};
(withTestBehaviorV2 as any).type = 'insights';
(withTestBehaviorV2 as any).critical = true;

export const createTestEventListener = (eventBus: any, emitted: any[]) => {
  emitted.length = 0;
  const subscription = eventBus.asObservable().subscribe((event: any) => {
    // Normalize / sanitize fields
    event.id = jasmine.any(String);
    event.timestamp = jasmine.any(Number);

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.cell)) {
      event.cell = jasmine.any(String);
    }

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.behaviorId)) {
      event.behaviorId = jasmine.any(String);
    }

    emitted.push(event);
  });

  return () => subscription.unsubscribe();
};
