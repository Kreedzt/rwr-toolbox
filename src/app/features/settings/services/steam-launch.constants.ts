export const STEAM_RWR_APP_ID = 270150;
export const STEAM_RWR_GAME_NAME = 'Running with Rifles';

export type SteamLaunchBoolParamId =
    | 'skip_nat_server_usage'
    | 'debugmode'
    | 'no_simulation'
    | 'no_ai'
    | 'metagame_debugmode'
    | 'verbose'
    | 'opengl'
    | 'flip'
    | 'big_water';

export const STEAM_LAUNCH_BOOL_PARAMS: ReadonlyArray<{
    id: SteamLaunchBoolParamId;
    i18nKey: string;
}> = [
    {
        id: 'skip_nat_server_usage',
        i18nKey: 'settings.steamLaunch.bool.skip_nat_server_usage',
    },
    { id: 'debugmode', i18nKey: 'settings.steamLaunch.bool.debugmode' },
    {
        id: 'no_simulation',
        i18nKey: 'settings.steamLaunch.bool.no_simulation',
    },
    { id: 'no_ai', i18nKey: 'settings.steamLaunch.bool.no_ai' },
    {
        id: 'metagame_debugmode',
        i18nKey: 'settings.steamLaunch.bool.metagame_debugmode',
    },
    { id: 'verbose', i18nKey: 'settings.steamLaunch.bool.verbose' },
    { id: 'opengl', i18nKey: 'settings.steamLaunch.bool.opengl' },
    { id: 'flip', i18nKey: 'settings.steamLaunch.bool.flip' },
    { id: 'big_water', i18nKey: 'settings.steamLaunch.bool.big_water' },
];

function uniqueTokens(tokens: string[]): string[] {
    const out: string[] = [];
    const seen = new Set<string>();

    for (const raw of tokens) {
        const token = raw.trim();
        if (!token) continue;
        if (seen.has(token)) continue;
        seen.add(token);
        out.push(token);
    }

    return out;
}

export function buildSteamLaunchArgsText(options: {
    boolParams: Record<string, boolean>;
    keyValueParams: Record<string, string>;
    customTokens: string[];
}): string {
    const tokens: string[] = [];

    for (const [key, enabled] of Object.entries(options.boolParams)) {
        if (enabled) tokens.push(key);
    }

    // Stable output for key=value items: sort by key.
    for (const key of Object.keys(options.keyValueParams).sort()) {
        const value = options.keyValueParams[key] ?? '';
        const trimmedKey = key.trim();
        const trimmedValue = value.trim();
        if (!trimmedKey) continue;
        if (/\s/.test(trimmedKey)) continue;
        if (trimmedValue.includes('\n')) continue;
        if (trimmedValue === '') continue;
        tokens.push(`${trimmedKey}=${trimmedValue}`);
    }

    // Custom tokens (hidden params, etc.)
    tokens.push(...options.customTokens);

    return uniqueTokens(tokens).join(' ');
}
