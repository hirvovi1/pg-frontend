// src/utils/asserts.ts

/**
 * Heittää virheen, jos arvo on null tai undefined.
 * Vastaa Javan Objects.requireNonNull() -metodia.
 */
export function assertNonNull<T>(
    value: T,
    message?: string
): T {
    if (value === null || value === undefined) {
        throw new Error(message || "Arvo ei saa olla null tai undefined!");
    }
    return value;
}

export function assertNumber(
    value: number|undefined,
    message?: string
): number {
    if (value === null || value === undefined) {
        throw new Error(message || "Arvo ei saa olla null tai undefined!");
    }
    return value;
}

export function assertNotBlank(
    value: string | null | undefined,
    message?: string
): string {
    if (!value || value.trim() === "") {
        throw new Error(message || "Merkkijono ei saa olla tyhjä!");
    }
    return value;
}
