import { defineNgVaultBehaviorKey, NgVaultBehaviorTypes } from '@ngvault/shared';

let keySuffix = 1;
let hasUniqueKeys = false;
/**
 * Creates a valid test behavior for a specific NgVault behavior type.
 * Each type gets only the methods the behavior pipeline expects.
 */
export function resetTestBehaviorKeys() {
  keySuffix = 1;
}

export function setTestBehaviorUniqueKeys() {
  hasUniqueKeys = true;
}

export function resetTestBehaviorUniqueKeys() {
  hasUniqueKeys = false;
}

export function createTestBehavior(
  type: NgVaultBehaviorTypes,
  emitted: any[],
  returnValue: any = undefined,
  isError = false
) {
  const factory = (): any => {
    const key = defineNgVaultBehaviorKey('Test', hasUniqueKeys ? `${type}-${keySuffix++}` : type);

    switch (type) {
      case NgVaultBehaviorTypes.State:
        return {
          type,
          key,
          computeState: async () => {
            if (isError) {
              throw new Error(returnValue);
            }
            emitted.push('state');
            return returnValue;
          }
        };

      case NgVaultBehaviorTypes.Reduce:
        return {
          type,
          key,
          applyReducer: (current: any, fn: any) => {
            if (isError) {
              throw new Error(returnValue);
            }
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
            if (isError) {
              throw new Error(returnValue);
            }
            emitted.push('encrypt');
            return returnValue;
          },
          decryptState: async () => {
            if (isError) {
              throw new Error(returnValue);
            }
            emitted.push('decrypt');
            return returnValue;
          }
        };

      case NgVaultBehaviorTypes.Persist:
        return {
          type,
          key,
          persistState: () => {
            if (isError) {
              throw new Error(returnValue);
            }
            emitted.push('persist');
          },
          clearState: () => {
            if (isError) {
              throw new Error(returnValue);
            }
            emitted.push('clear');
          },
          loadState: () => {
            if (isError) {
              throw new Error(returnValue);
            }
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
