// src/utils/asserts.ts

/**
 * Heittää virheen, jos arvo on null tai undefined.
 * Vastaa Javan Objects.requireNonNull() -metodia.
 */
export function assertNonNull<T>(
    value: T,
    message?: string
): asserts value is NonNullable<T> {
    if (value === null || value === undefined) {
        throw new Error(message || "Arvo ei saa olla null tai undefined!");
    }
}

export function assertNotBlank(
    value: string | null | undefined,
    message?: string
): asserts value is string {
    if (!value || value.trim() === "") {
        throw new Error(message || "Merkkijono ei saa olla tyhjä!");
    }
}
