import { FeatureCellDescriptorModel } from '../../../models/feature-cell-descriptor.model';

export function featureCellValidation<T>(descriptor: FeatureCellDescriptorModel<T>): void {
  // Prevent incorrect initialization (e.g., passing a resource object)
  if (
    typeof descriptor.initial === 'object' &&
    descriptor.initial !== null &&
    // eslint-disable-next-line
    'data' in (descriptor.initial as any)
  ) {
    throw new Error(
      `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "${descriptor.key}". ` +
        `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
        `Pass plain data to avoid double-wrapping.`
    );
  }

  /*
      const _defaultBehaviors: NgVaultBehaviorFactory<T>[] = [
        withCoreStateBehavior,
        withCoreHttpResourceStateBehavior,
        withCoreObservableBehavior,
        withCoreReducerBehavior
      ];

      // eslint-disable-next-line
      const encryptBehaviors = behaviors.filter((b) => (b as any).type === NgVaultBehaviorTypes.Encrypt);

      if (encryptBehaviors.length > 1) {
        throw new Error(`[NgVault] FeatureCell cannot register multiple encryption behaviors.`);
      }

      // eslint-disable-next-line
      const _userBehaviorsWithoutReducers = behaviors.filter((b) => (b as any).type !== NgVaultBehaviorTypes.Reduce);

      const _allBehaviors: NgVaultBehaviorFactory<T>[] = [..._defaultBehaviors, ..._userBehaviorsWithoutReducers];

      const _value = signal<NgVaultDataType<T>>(undefined);

      const _hasValue = computed(() => {
        const val = _value();
        return val !== null && val !== undefined;
      });

      const ctx = {
        isLoading: _isLoading,
        error: _error,
        value: _value,
        behaviorRunner: _behaviorRunner,
        destroyed$: _destroyed$.asObservable(),
        reset$: _reset$.asObservable(),

        get state(): Readonly<VaultStateSnapshot<T>> {
          return {
            isLoading: _isLoading(),
            value: _value(),
            error: _error(),
            hasValue: _hasValue()
          };
        }
      } as NgVaultBehaviorContext<T>;

      const _hardReset = () => {
        _isLoading.set(false);
        _error.set(null);
        _value.set(undefined);
      };

      const _reset = (): void => {
        _ngVaultMonitor.startReset(_cellKey, 'core', ctx);
        ngVaultWarn('feature cell: reset');
        _ensureInitialized();
        _reset$.next();
        _hardReset();

        _orchestrator.clearPersistedState(ctx);

        _ngVaultMonitor.endReset(_cellKey, 'core', ctx);
      };

      const _destroy = (): void => {
        _ngVaultMonitor.endDestroy(_cellKey, 'core', ctx);
        ngVaultWarn('feature cell: destroy');
        _destroyed$.next();
        _destroyed$.complete();

        _hardReset();

        _ngVaultMonitor.endDestroy(_cellKey, 'core', ctx);
      };

      // Angular DI teardown
      _destroyRef.onDestroy(() => _destroy());

      const _normalizeIncoming = <T>(
        incoming: NgVaultStateInputType<T>
      ): NgVaultStateType<T> | HttpResourceRef<T> | null => {
        if (!incoming) return null;

        return isHttpResourceRef(incoming) ? incoming : (incoming as NgVaultStateType<T>);
      };

      const _replaceState = (incoming: NgVaultStateInputType<T>): void => {
        _ensureInitialized();

        const hasValueKey = incoming != null && Object.prototype.hasOwnProperty.call(incoming, 'value');

        incoming = _normalizeIncoming(incoming) as NgVaultStateType<T>;

        if (!hasValueKey) {
          _ngVaultMonitor.startClearValue(_cellKey, 'core', ctx);
          _isLoading.set(incoming?.loading ?? false);
          _error.set(incoming?.error ?? null);
          _value.set(undefined);
          _ngVaultMonitor.endClearValue(_cellKey, 'core', ctx);
          return;
        }

        _isLoading.set(incoming.loading ?? false);
        _error.set(incoming.error ?? null);

        ctx.incoming = incoming;
        _orchestrator.dispatchSet(ctx);
      };

      const _mergeState = (incoming: NgVaultStateInputType<T>): void => {
        _ensureInitialized();
        ctx.incoming = _normalizeIncoming(incoming);
        _orchestrator.dispatchPatch(ctx);
      };

      const _ensureInitialized = () => {
        if (!_initialized) {
          throw new Error(
            `[NgVault] FeatureCell "${featureCellDescriptor.key}" has not been initialized. ` +
              `You must call cell.initialize() before using state methods.`
          );
        }
      };

      const _initialize = async (reducers: NgVaultReducerFunction<T>[] = []): Promise<void> => {
        _ngVaultMonitor.registerCell(_cellKey, featureCellDescriptor.insights);

        _ngVaultMonitor.startInitialized(_cellKey, 'core', ctx);

        if (_initialized) {
          const errorMessage = `[NgVault] FeatureCell "${featureCellDescriptor.key}" already initialized.`;
          _ngVaultMonitor.error(_cellKey, 'core', ctx, errorMessage);
          throw new Error(errorMessage);
        }

        _initialized = true;

        _orchestrator = new VaultOrchestrator(
          _cellKey,
          _behaviorRunner.initializeBehaviors(_injector, _allBehaviors)!,
          reducers,
          _injector,
          _ngVaultMonitor
        );

        _behaviorRunner.applyBehaviorExtensions(cell);

        const persisted = await _orchestrator.loadPersistedState(ctx);

        if (persisted !== undefined) {
          _value.set(persisted as T);
          _isLoading.set(false);
          _error.set(null);
          ngVaultLog('Persisted data loaded from storage');
        } else if (featureCellDescriptor.initial !== null && featureCellDescriptor.initial !== undefined) {
          ngVaultLog('Initialized data loaded from storage');
          _value.set(featureCellDescriptor.initial as T);
          _isLoading.set(false);
          _error.set(null);
        }

        _ngVaultMonitor.endInitialized(_cellKey, 'core', ctx);
      };

      // Create the base FeatureCell instance
      const cell: NgVaultFeatureCell<T> = {
        state: {
          isLoading: _isLoading.asReadonly(),
          value: _value.asReadonly(),
          error: _error.asReadonly(),
          hasValue: _hasValue
        },
        initialize: _initialize,
        replaceState: _replaceState,
        mergeState: _mergeState,
        reset: _reset,
        destroy: _destroy,
        destroyed$: _destroyed$.asObservable(),
        reset$: _reset$.asObservable()
      };

      // Attach internal metadata for behavior extensions
      Object.defineProperty(cell, 'ctx', {
        value: ctx,
        enumerable: false,
        writable: false
      });

      Object.defineProperty(cell, 'key', {
        value: featureCellDescriptor.key,
        enumerable: false,
        writable: false
      });

      return cell;
    }
  };

  const registryProvider: Provider = {
    provide: FEATURE_CELL_REGISTRY,
    multi: true,
    useValue: { key: featureCellDescriptor.key, token: service }
  };

  return [featureCellProvider, service, registryProvider];
  */
}
