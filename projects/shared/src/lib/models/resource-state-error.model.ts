export interface ResourceStateError {
  message: string;
  status?: number;
  statusText?: string;
  details?: unknown;
}
