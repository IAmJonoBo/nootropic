import { jwtVerify } from 'jose';
import { z } from 'zod';
import { trace } from '@opentelemetry/api';
// Zod schema for required claims
export const JwtClaimsSchema = z.object({
    iss: z.string(),
    aud: z.string(),
    exp: z.number(),
    sub: z.string(),
    typ: z.string().optional(),
    org: z.string().optional(),
});
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
export async function validateJwt(token, options) {
    const span = trace.getTracer('jwtValidation').startSpan('validateJwt');
    try {
        const { payload, protectedHeader } = await jwtVerify(token, options.jwks, {
            issuer: options.issuer,
            audience: options.audience,
            algorithms: options.allowedAlgs,
        });
        if (options.requiredTyp && protectedHeader.typ !== options.requiredTyp) {
            throw new Error('Invalid typ');
        }
        const claims = JwtClaimsSchema.parse(payload);
        span.end();
        return claims;
    }
    catch (err) {
        if (err instanceof Error) {
            span.recordException(err);
        }
        else {
            span.recordException({ message: String(err) });
        }
        span.end();
        throw err;
    }
}
/**
 * Example:
 *   const claims = await validateJwt(token, { jwks, issuer, audience, allowedAlgs: ['RS256'], requiredTyp: 'at+jwt' });
 *
 * Security notes:
 * - Always use a static list of allowed algorithms.
 * - Always check 'iss', 'aud', 'exp', and 'typ' claims.
 * - Never trust tokens without validation.
 */ 
