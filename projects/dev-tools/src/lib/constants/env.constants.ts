declare const ngDevMode: boolean | undefined;

export const IS_DEV_MODE = typeof ngDevMode !== 'undefined' && !!ngDevMode;
