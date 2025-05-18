import { z } from 'zod';
export declare const JwtClaimsSchema: z.ZodObject<{
    iss: z.ZodString;
    aud: z.ZodString;
    exp: z.ZodNumber;
    sub: z.ZodString;
    typ: z.ZodOptional<z.ZodString>;
    org: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sub: string;
    iss: string;
    aud: string;
    exp: number;
    org?: string | undefined;
    typ?: string | undefined;
}, {
    sub: string;
    iss: string;
    aud: string;
    exp: number;
    org?: string | undefined;
    typ?: string | undefined;
}>;
export interface JwtValidationOptions {
    jwks: Uint8Array | object;
    issuer: string;
    audience: string;
    requiredTyp?: string;
    allowedAlgs?: string[];
}
/**
 * Validates a JWT and returns the decoded payload.
 *
 * token: The JWT string to validate.
 * secret: The secret or public key to verify the JWT.
 *
 * Example usage:
 * ```ts
 * const payload = validateJwt(token, secret);
 * ```
 *
 * For more details, see: https://jwt.io/
 */
export declare function validateJwt(token: string, options: JwtValidationOptions): Promise<z.infer<typeof JwtClaimsSchema>>;
/**
 * Example:
 *   const claims = await validateJwt(token, { jwks, issuer, audience, allowedAlgs: ['RS256'], requiredTyp: 'at+jwt' });
 *
 * Security notes:
 * - Always use a static list of allowed algorithms.
 * - Always check 'iss', 'aud', 'exp', and 'typ' claims.
 * - Never trust tokens without validation.
 */ 
