import { HttpResourceRef } from '@angular/common/http';
import { DestroyRef, Injector, Provider, Type, computed, inject, signal } from '@angular/core';
import { getOrCreateFeatureCellToken } from '@ngvault/core';
import { withCoreHttpResourceStateBehaviorV2 } from '@ngvault/core/behaviors/core-http-resource-state/with-core-http-resource-state.behavior.v2';
import { withCoreStateBehaviorV2 } from '@ngvault/core/behaviors/core-state/with-core-state.behavior.v2';
import { VaultOrchestrator } from '@ngvault/core/orchestrator/ngvault.orchestrator';
import {
  FeatureCell,
  NgVaultBehaviorLifecycleService,
  ResourceStateError,
  VaultBehaviorContext,
  VaultBehaviorFactory,
  VaultStateSnapshot
} from '@ngvault/shared';
import { VaultDataType } from '@ngvault/shared/types/vault-data.type';
import { VaultStateInputType } from '@ngvault/shared/types/vault-state-input.type';
import { VaultStateType } from '@ngvault/shared/types/vault-state.type';
import { Subject } from 'rxjs';
import { withCoreHttpResourceStateBehavior } from '../../behaviors/core-http-resource-state/with-core-http-resource-state.behavior';
import { withCoreObservableBehavior } from '../../behaviors/core-observable/with-core-observable.behavior';
import { withCoreStateBehavior } from '../../behaviors/core-state/with-core-state.behavior';
import { FeatureCellDescriptorModel } from '../../models/feature-cell-descriptor.model';
import { FEATURE_CELL_REGISTRY } from '../../tokens/feature-cell-registry.token';
import { isHttpResourceRef } from '../../utils/is-http-resource.util';
import { ngVaultDebug, ngVaultWarn } from '../../utils/ngvault-logger.util';

export function provideFeatureCell<Service, T>(
  service: Type<Service>,
  featureCellDescriptor: FeatureCellDescriptorModel<T>,
  behaviors: VaultBehaviorFactory<T>[] = []
): Provider[] {
  const token = getOrCreateFeatureCellToken<T>(featureCellDescriptor.key, false);

  const featureCellProvider: Provider = {
    provide: token,
    useFactory: (): FeatureCell<T> => {
      const _isLoading = signal(false);
      const _error = signal<ResourceStateError | null>(null);
      const _behaviorRunner = NgVaultBehaviorLifecycleService();
      const _injector = inject(Injector);
      const _destroyRef = inject(DestroyRef);
      const _destroyed$ = new Subject<void>();
      const _reset$ = new Subject<void>();

      // Prevent incorrect initialization (e.g., passing a resource object)
      if (
        typeof featureCellDescriptor.initial === 'object' &&
        featureCellDescriptor.initial !== null &&
        // eslint-disable-next-line
        'data' in (featureCellDescriptor.initial as any)
      ) {
        throw new Error(
          `[NgVault] Invalid FeatureCellDescriptorModel.initial for feature "${featureCellDescriptor.key}". ` +
            `Expected raw data (e.g., [] or {}), but received an object with resource fields { loading, data, error }. ` +
            `Pass plain data to avoid double-wrapping.`
        );
      }

      const _defaultBehaviors: VaultBehaviorFactory<T>[] = [
        withCoreStateBehavior,
        withCoreStateBehaviorV2,
        withCoreHttpResourceStateBehavior,
        withCoreHttpResourceStateBehaviorV2,
        withCoreObservableBehavior
      ];
      const _allBehaviors: VaultBehaviorFactory<T>[] = [..._defaultBehaviors, ...behaviors];
      const _coreId = _behaviorRunner.initializeBehaviors(_injector, _allBehaviors)!;
      const _orchestrator = new VaultOrchestrator(_behaviorRunner.behaviors);

      const _value = signal<VaultDataType<T>>(
        featureCellDescriptor.initial === null || featureCellDescriptor.initial === undefined
          ? undefined
          : (featureCellDescriptor.initial as T)
      );

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
      } as VaultBehaviorContext<T>;

      _behaviorRunner.onInit(_coreId, featureCellDescriptor.key, service.name, ctx);

      const _reset = (): void => {
        ngVaultWarn('feature cell _reset');
        _isLoading.set(false);
        _error.set(null);
        _value.set(undefined);
        _reset$.next();
        _behaviorRunner.onReset(_coreId, featureCellDescriptor.key, ctx);
      };

      const _destroy = (): void => {
        ngVaultWarn('feature cell _destroy');
        _destroyed$.next();
        _destroyed$.complete();

        _reset();
        _behaviorRunner.onDestroy(_coreId, featureCellDescriptor.key, ctx);
      };

      // Angular DI teardown
      _destroyRef.onDestroy(() => _destroy());

      const _set = (next: VaultStateInputType<T>): void => {
        ngVaultDebug('feature cell _set');
        ctx.patch = null;
        if (next == null) {
          _reset();
          return;
        }

        ctx.next = next as VaultStateType<T>;
        _behaviorRunner.onSet(_coreId, featureCellDescriptor.key, ctx);
      };

      const _patch = (patch: VaultStateInputType<T>): void => {
        ngVaultDebug('feature cell _patch');
        ctx.next = null;
        if (patch == null) {
          _reset();
          return;
        }

        ctx.patch = patch as VaultStateType<T>;
        _behaviorRunner.onPatch(_coreId, featureCellDescriptor.key, ctx);
      };

      function normalizeIncoming<T>(incoming: VaultStateInputType<T>): VaultStateType<T> | HttpResourceRef<T> | null {
        if (!incoming) return null;
        return isHttpResourceRef(incoming) ? incoming : (incoming as VaultStateType<T>);
      }

      const _replaceState = (incoming: VaultStateInputType<T>): void => {
        ctx.incoming = normalizeIncoming(incoming);
        _orchestrator.dispatchSet(ctx);
      };

      const _mergeState = (incoming: VaultStateInputType<T>): void => {
        ctx.incoming = normalizeIncoming(incoming);
        _orchestrator.dispatchPatch(ctx);
      };

      // Create the base FeatureCell instance
      const cell: FeatureCell<T> = {
        state: {
          isLoading: _isLoading.asReadonly(),
          value: _value.asReadonly(),
          error: _error.asReadonly(),
          hasValue: _hasValue
        },
        replaceState: _replaceState,
        mergeState: _mergeState,
        setState: _set,
        patchState: _patch,
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

      _behaviorRunner.applyBehaviorExtensions(cell);

      return cell;
    }
  };

  const registryProvider: Provider = {
    provide: FEATURE_CELL_REGISTRY,
    multi: true,
    useValue: { key: featureCellDescriptor.key, token: service }
  };

  return [featureCellProvider, service, registryProvider];
}
