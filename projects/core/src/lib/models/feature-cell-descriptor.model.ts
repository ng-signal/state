import { VaultInsightDefinition } from '@ngvault/shared';

export interface FeatureCellDescriptorModel<T> {
  key: string;
  initial: T;
  insights?: VaultInsightDefinition;
}
