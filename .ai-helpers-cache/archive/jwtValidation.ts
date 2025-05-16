import { jwtVerify, JWTVerifyOptions } from 'jose';
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

export interface JwtValidationOptions {
  jwks: Uint8Array | object; // JWKS or PEM
  issuer: string;
  audience: string;
  requiredTyp?: string;
  allowedAlgs?: string[];
}

/**
 * Validates a JWT and returns claims if valid, throws otherwise.
 * Adds OTel tracing for validation.
 */
// @ts-expect-error TS(6133): 'token' is declared but its value is never read.
export async function validateJwt(token: string, options: JwtValidationOptions): Promise<z.infer<typeof JwtClaimsSchema>> {
  // @ts-expect-error TS(2304): Cannot find name 'span'.
  const span = trace.getTracer('jwtValidation').startSpan('validateJwt');
  try {
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    const { payload, protectedHeader } = await jwtVerify(token, options.jwks, {
      // @ts-expect-error TS(2552): Cannot find name 'options'. Did you mean 'Option'?
      issuer: options.issuer,
      // @ts-expect-error TS(2552): Cannot find name 'options'. Did you mean 'Option'?
      audience: options.audience,
      // @ts-expect-error TS(2552): Cannot find name 'options'. Did you mean 'Option'?
      algorithms: options.allowedAlgs,
    } as JWTVerifyOptions);
    // @ts-expect-error TS(6133): 'options' is declared but its value is never read.
    if (options.requiredTyp && protectedHeader.typ !== options.requiredTyp) {
      throw new Error('Invalid typ');
    }
    // @ts-expect-error TS(6133): 'claims' is declared but its value is never read.
    const claims = JwtClaimsSchema.parse(payload);
    // @ts-expect-error TS(2304): Cannot find name 'span'.
    span.end();
    return claims;
  } catch (err) {
    if (err instanceof Error) {
      // @ts-expect-error TS(2304): Cannot find name 'span'.
      span.recordException(err);
    } else {
      // @ts-expect-error TS(2304): Cannot find name 'span'.
      span.recordException({ message: String(err) });
    }
    // @ts-expect-error TS(2304): Cannot find name 'span'.
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