class TestBehavior {
  #events: any = [];

  key = Math.random().toString(36).slice(2, 6);

  constructor(
    public behaviorId: string,
    public type: string,
    public critial: boolean
  ) {
    this.resetEvents();
  }

  resetEvents(): void {
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

  onPatch(key: string) {
    this.#events.push(`onPatch:${key}`);
  }

  onSet(key: string, ctx: any): void {
    this.#events.push(`onSet:${key}`);
    this.#events.push(`onSetState:${key}:${JSON.stringify(ctx.state) || 'undefined'}`);
  }
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

/*
    fit('should emit a "dispose" event when vault.destroy() is called', () => {
      const providers = provideFeatureCell(class TestService {}, { key: 'devtools-test', initial: [] }, [
        withTestBehavior
      ]);

      const factory = (providers[0] as any).useFactory;

      /*
      const runner = NgVaultBehaviorLifecycleService();
      runner.initialize();

      const injector = TestBed.inject(Injector);
      const behaviors = runner.initializeBehaviors(injector, [withTestBehavior]);

      testBehavior = behaviors.find((b: any) => b.type === 'dev-tools') as any;
      * /

      let vault: ResourceVaultModel<any>;
      runInInjectionContext(TestBed.inject(Injector), () => {
        vault = factory();
        vault.destroy();
      });

      expect(testBehavior.getEvents()).toEqual(['onReset:devtools-test', 'onDestroy:devtools-test']);
    });
    */
