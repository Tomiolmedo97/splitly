type Env = Record<string, string | undefined>;
export function dbHost(url: string | undefined): string | null;
export function pointsToProduction(env: Env): boolean;
export function isLocalDatabase(env: Env): boolean;
export function canSeed(env: Env): boolean;
export function canMigratePreview(env: Env): boolean;
