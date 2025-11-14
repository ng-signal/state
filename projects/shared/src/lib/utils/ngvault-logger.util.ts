import { getNgVaultConfig } from '../../../../core/src/lib/providers/vault/provide-vault';
import { NgVaultLogLevel } from '../../../../core/src/lib/types/ngvault-log-level.type';

const LOG_LIMIT = 200;
const LOG_PREFIX = '[NgVault]';

// eslint-disable-next-line
const logQueue: { level: NgVaultLogLevel; args: any[] }[] = [];
let flushScheduled = false;
let droppedCount = 0;

/** Flush batched logs to the console asynchronously */
function scheduleFlush(): void {
  if (flushScheduled) return;
  flushScheduled = true;

  queueMicrotask(() => {
    flushScheduled = false;
    const batch = logQueue.splice(0, LOG_LIMIT);

    for (const { level, args } of batch) {
      // @ts-expect-error no console
      // eslint-disable-next-line
      console[level](LOG_PREFIX, ...args);
    }

    if (droppedCount > 0) {
      // eslint-disable-next-line no-console
      console.warn(`${LOG_PREFIX} ${droppedCount} messages dropped (log limit reached).`);
      droppedCount = 0;
    }
  });
}

/** Push a new message into the queue, respecting config and log level */
// eslint-disable-next-line
function push(level: NgVaultLogLevel, ...args: any[]): void {
  const { logLevel } = getNgVaultConfig();

  const levels: NgVaultLogLevel[] = ['error', 'warn', 'log', 'debug'];

  const allowed = levels.indexOf(level) <= levels.indexOf(logLevel!);

  if (!allowed) return;

  if (logQueue.length < LOG_LIMIT) {
    logQueue.push({ level, args });
    scheduleFlush();
  } else {
    droppedCount++;
  }
}

/** Public API (framework-facing) */
// eslint-disable-next-line
export const ngVaultError = (...args: any[]) => push('error', ...args);
// eslint-disable-next-line
export const ngVaultWarn = (...args: any[]) => push('warn', ...args);
// eslint-disable-next-line
export const ngVaultLog = (...args: any[]) => push('log', ...args);
// eslint-disable-next-line
export const ngVaultDebug = (...args: any[]) => push('debug', ...args);
