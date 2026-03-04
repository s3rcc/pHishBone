import axios from 'axios';

/**
 * Field‑path mapping from backend (PascalCase / nested) → frontend (camelCase / flat).
 *
 * The .NET validator returns paths like `"Environment.PhMin"` or `"Profile.AdultSize"`.
 * react-hook-form uses flat camelCase field names like `"phMin"`, `"adultSize"`.
 */
const FIELD_MAP: Record<string, string> = {
    // Top-level
    CommonName: 'commonName',
    ScientificName: 'scientificName',
    TypeId: 'typeId',
    ThumbnailUrl: 'thumbnailUrl',
    // Environment
    'Environment.PhMin': 'phMin',
    'Environment.PhMax': 'phMax',
    'Environment.TempMin': 'tempMin',
    'Environment.TempMax': 'tempMax',
    'Environment.MinTankVolume': 'minTankVolume',
    'Environment.WaterType': 'waterType',
    // Profile
    'Profile.AdultSize': 'adultSize',
    'Profile.BioLoadFactor': 'bioLoadFactor',
    'Profile.SwimLevel': 'swimLevel',
    'Profile.DietType': 'dietType',
    'Profile.PreferredFood': 'preferredFood',
    'Profile.IsSchooling': 'isSchooling',
    'Profile.MinGroupSize': 'minGroupSize',
    'Profile.Origin': 'origin',
    'Profile.Description': 'description',
};

/**
 * RFC 9110 validation error shape returned by .NET / FluentValidation.
 */
interface Rfc9110Error {
    type?: string;
    title?: string;
    status?: number;
    errors?: Record<string, string[]>;
    traceId?: string;
}

/**
 * Parse a backend validation error response into a flat map of
 * `{ frontendFieldName: firstErrorMessage }` suitable for
 * `react-hook-form`'s `setError`.
 *
 * If the error is not an Axios 400 validation response, returns `null`.
 */
export function parseValidationErrors(
    error: unknown,
): Record<string, string> | null {
    if (!axios.isAxiosError(error)) return null;

    const data = error.response?.data as Rfc9110Error | undefined;
    if (!data?.errors || error.response?.status !== 400) return null;

    const result: Record<string, string> = {};

    for (const [backendPath, messages] of Object.entries(data.errors)) {
        if (!messages || messages.length === 0) continue;

        // Handle array-indexed paths like "TagIds[0]" → "tagIds"
        const cleanPath = backendPath.replace(/\[\d+\]/, '');
        const frontendField = FIELD_MAP[cleanPath] ?? cleanPath;
        // Map known TagIds → tagIds
        const finalField = cleanPath === 'TagIds' ? 'tagIds' : frontendField;

        // Take the first error message for this field
        if (!result[finalField]) {
            result[finalField] = messages[0];
        }
    }

    return result;
}

/**
 * Extract a user-friendly top-level message from backend errors.
 * Falls back to a generic message.
 */
export function getValidationSummary(error: unknown, fallback: string): string {
    if (!axios.isAxiosError(error)) return fallback;

    const data = error.response?.data as Rfc9110Error | undefined;
    if (data?.title) return data.title;

    return fallback;
}

export default parseValidationErrors;
