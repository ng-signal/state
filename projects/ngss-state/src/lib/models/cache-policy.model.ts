/**
 * Defines available caching strategies for NGSS stores.
 *
 * @example
 *   { strategy: 'none' }              // No caching (default)
 *   { strategy: 'memory' }            // In-memory reactive cache
 *   { strategy: 'timed', ttl: 60000 } // Time-elapse cache with TTL
 */
export type CacheStrategyType = 'none' | 'memory' | 'timed' | 'storage';

export interface CacheConfigModel {
  /** Which caching approach to use (default = 'none'). */
  strategy?: CacheStrategyType;

  /** Time-to-live (ms) when using 'timed' strategy. */
  ttl?: number;
}
