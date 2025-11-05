// projects/dev-tools/src/lib/behaviors/with-devtools.behavior.ts
import { IS_DEV_MODE } from '@ngvault/dev-tools/constants/env.constants';
import { VaultEventType } from '../types/event-vault.type';
import { NgVaultEventBus } from '../utils/ngvault-event-bus';

/**
 * A simple devtools behavior that emits lifecycle events
 * when a feature cell or vault service is created or destroyed.
 */
export function withDevtoolsBehavior() {
  return {
    onInit: (key: string) => emitEvent(key, 'init'),
    onLoad: (key: string) => emitEvent(key, 'load'),
    onDestroy: (key: string) => emitEvent(key, 'dispose')
  };
}

function emitEvent(key: string, type: VaultEventType) {
  if (!IS_DEV_MODE) return;
  NgVaultEventBus.next({ key, type, timestamp: Date.now() });
}

/*
Example 1

import { withDevtoolsBehavior } from '@ngvault/dev-tools/behaviors/with-devtools.behavior';

export function provideFeatureCell<Svc, T>(
  service: Type<Svc>,
  featureCellDescriptor: FeatureCellDescriptorModel<T>
): Provider[] {
  const devtools = withDevtoolsBehavior();

  const featureCellProvider: Provider = {
    provide: token,
    useFactory: (): ResourceVaultModel<T> => {
      devtools.onInit(featureCellDescriptor.key);

      const vault = createVaultInstance(service, featureCellDescriptor);

      // Hook into destroy
      const destroyRef = inject(DestroyRef);
      destroyRef.onDestroy(() => devtools.onDestroy(featureCellDescriptor.key));

      return vault;
    }
  };

  return [featureCellProvider, service];
}
*/

/*
Example 2

import { Injectable, OnDestroy } from '@angular/core';
import { withDevtoolsBehavior } from '@ngvault/dev-tools/behaviors/with-devtools.behavior';

@Injectable({ providedIn: 'root' })
export class UserVaultService implements OnDestroy {
  private readonly devtools = withDevtoolsBehavior();
  private readonly key = 'user-vault';

  constructor() {
    this.devtools.onInit(this.key);
  }

  loadUsers() {
    this.devtools.onLoad(this.key);
    // ... load users logic
  }

  ngOnDestroy() {
    this.devtools.onDestroy(this.key);
  }
}
  */
