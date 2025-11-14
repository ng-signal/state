import { NgVaultInsightDefinition } from '@ngvault/shared';

export interface FeatureCellDescriptorModel<T> {
  key: string;
  initial: T;
  insights?: NgVaultInsightDefinition;
}
