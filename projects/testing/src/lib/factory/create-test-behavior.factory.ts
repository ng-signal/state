import { defineNgVaultBehaviorKey } from '@ngvault/shared-models';

let counter = 0;

export function createTestBehaviorFactory(
  factory: (...args: any[]) => any,
  type?: string,
  key?: string,
  critical: boolean = false,
  autoFix = true
): any {
  const wrappedFactory = (context: any) => {
    const behavior = factory(context);

    if (!behavior || typeof behavior !== 'object') {
      return behavior; // Let the runner handle the error path
    }
    const behaviorId = context.behaviorId;

    Object.defineProperty(behavior, 'behaviorId', {
      value: behaviorId,
      enumerable: false,

      writable: true
    });

    if (key !== 'no-gen') {
      let value = defineNgVaultBehaviorKey('testing', `id-${counter++}`);

      if (key === 'bad-gen') {
        value = key;
      } else if (key === 'duplicate') {
        value = defineNgVaultBehaviorKey('testing', key);
      }

      Object.defineProperty(behavior, 'key', {
        value,
        enumerable: false,
        writable: true
      });
    }

    if (type) {
      Object.defineProperty(behavior, 'type', {
        value: type,
        enumerable: true,
        writable: true
      });
    }

    if (typeof behavior.onInit !== 'function') {
      if (autoFix) {
        Object.defineProperty(behavior, 'onInit', {
          value: (key: string, service: string, ctx: any) => {
            // No-op for tests — ensures lifecycle consistency
            // console.debug(`[NgVault::Testing] Auto-added onInit() for ${behavior.key ?? '(no-key)'}`);
          },
          enumerable: false,
          writable: false
        });
      }
    }
    return behavior;
  };

  (wrappedFactory as any).type = type;
  (wrappedFactory as any).critical = critical;

  return wrappedFactory as any;
}

export const resetTestBehaviorFactoryId = () => {
  counter = 0;
};
