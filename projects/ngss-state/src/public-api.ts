/*
 * Public API Surface of ngss-state
 */
export * from './lib/constants/metadata-keys.constant';
export * from './lib/decorators/feature-store.decorator';
export * from './lib/injectors/feature-vault.injector';
export * from './lib/models/feature-descriptor.model';
export * from './lib/models/feature-vault.model';
export * from './lib/models/resource-signal.model';
export * from './lib/models/resource-signal.normalized-error.model';
export * from './lib/provide-state';
export * from './lib/provide-store';
export * from './lib/tokens/feature-token-registry';
export * from './lib/utils/resource-signal.util';

/*
 * Testing utilities
 */
export * from './testing/public-api';
