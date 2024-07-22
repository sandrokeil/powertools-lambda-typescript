import type { ZodSchema, z } from 'zod';
import { ParseError } from '../errors.js';
import { VpcLatticeV2Schema } from '../schemas/index.js';
import type { ParsedResult } from '../types/index.js';
import { Envelope } from './envelope.js';

/**
 * Amazon VPC Lattice envelope to extract data within body key
 */
export class VpcLatticeV2Envelope extends Envelope {
  public name = 'VpcLatticeV2Envelope';
  public static parse<T extends ZodSchema>(
    data: unknown,
    schema: T
  ): z.infer<T> {
    const parsedEnvelope = VpcLatticeV2Schema.parse(data);

    return Envelope.parse(parsedEnvelope.body, schema);
  }

  public static safeParse<T extends ZodSchema>(
    data: unknown,
    schema: T
  ): ParsedResult {
    const parsedEnvelope = VpcLatticeV2Schema.safeParse(data);
    if (!parsedEnvelope.success) {
      return {
        success: false,
        error: new ParseError('Failed to parse VpcLatticeV2 envelope.', {
          cause: parsedEnvelope.error,
        }),
        originalEvent: data,
      };
    }

    const parsedBody = Envelope.safeParse(parsedEnvelope.data.body, schema);

    if (!parsedBody.success) {
      return {
        success: false,
        error: new ParseError('Failed to parse VpcLatticeV2 body.', {
          cause: parsedBody.error,
        }),
        originalEvent: data,
      };
    }

    return parsedBody;
  }
}
