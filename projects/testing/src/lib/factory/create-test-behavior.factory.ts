import { defineNgVaultBehaviorKey, NgVaultBehaviorTypes } from '@ngvault/shared';

/**
 * Creates a valid test behavior for a specific NgVault behavior type.
 * Each type gets only the methods the behavior pipeline expects.
 */
export function createTestBehavior(type: NgVaultBehaviorTypes, emitted: any[], returnValue: any = undefined) {
  const factory = (): any => {
    const key = defineNgVaultBehaviorKey('Test', type);

    switch (type) {
      case NgVaultBehaviorTypes.State:
        return {
          type,
          key,
          computeState: async () => {
            emitted.push('state');
            return returnValue;
          }
        };

      case NgVaultBehaviorTypes.Reduce:
        return {
          type,
          key,
          applyReducer: (current: any, fn: any) => {
            emitted.push('reduce');
            if (typeof fn === 'function') {
              return fn(current);
            }

            return 'noop';
          }
        };

      case NgVaultBehaviorTypes.Encrypt:
        return {
          type,
          key,
          encryptState: async () => {
            emitted.push('encrypt');
            return returnValue;
          },
          decryptState: async () => {
            emitted.push('decrypt');
            if (returnValue === 'throw-error') {
              throw new Error(returnValue);
            }
            return returnValue;
          }
        };

      case NgVaultBehaviorTypes.Persist:
        return {
          type,
          key,
          persistState: () => {
            emitted.push('persist');
          },
          clearState: () => {
            emitted.push('clear');
          },
          loadState: () => {
            emitted.push('load');
            return returnValue;
          }
        };

      default:
        throw new Error(`Unsupported test behavior type: ${type}`);
    }
  };

  factory.type = type;
  factory.critical = false;

  return factory as any;
}

export function createInitializedTestBehavior(
  type: NgVaultBehaviorTypes,
  emitted: any[],
  returnValue: any = undefined
): any {
  const behavior = createTestBehavior(type, emitted, returnValue);
  return behavior() as any;
}
