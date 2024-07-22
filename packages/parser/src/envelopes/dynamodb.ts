import type { ZodSchema, z } from 'zod';
import { ParseError } from '../errors.js';
import { DynamoDBStreamSchema } from '../schemas/index.js';
import type { DynamoDBStreamEnvelopeResponse } from '../types/envelope.js';
import type { ParsedResult, ParsedResultError } from '../types/index.js';
import { Envelope } from './envelope.js';

/**
 * DynamoDB Stream Envelope to extract data within NewImage/OldImage
 *
 * Note: Values are the parsed models. Images' values can also be None, and
 * length of the list is the record's amount in the original event.
 */
export class DynamoDBStreamEnvelope extends Envelope {
  public name = 'DynamoDBStreamEnvelope';
  public static parse<T extends ZodSchema>(
    data: unknown,
    schema: T
  ): DynamoDBStreamEnvelopeResponse<z.infer<T>>[] {
    const parsedEnvelope = DynamoDBStreamSchema.parse(data);

    return parsedEnvelope.Records.map((record) => {
      return {
        NewImage: Envelope.parse(record.dynamodb.NewImage, schema),
        OldImage: Envelope.parse(record.dynamodb.OldImage, schema),
      };
    });
  }

  public static safeParse<T extends ZodSchema>(
    data: unknown,
    schema: T
  ): ParsedResult {
    const parsedEnvelope = DynamoDBStreamSchema.safeParse(data);

    if (!parsedEnvelope.success) {
      return {
        success: false,
        error: new ParseError('Failed to parse DynamoDB Stream envelope', {
          cause: parsedEnvelope.error,
        }),
        originalEvent: data,
      };
    }
    const parsedLogEvents: DynamoDBStreamEnvelopeResponse<z.infer<T>>[] = [];

    for (const record of parsedEnvelope.data.Records) {
      const parsedNewImage = Envelope.safeParse(
        record.dynamodb.NewImage,
        schema
      );
      const parsedOldImage = Envelope.safeParse(
        record.dynamodb.OldImage,
        schema
      );
      if (!parsedNewImage.success || !parsedOldImage.success) {
        return {
          success: false,
          error: !parsedNewImage.success
            ? new ParseError('Failed to parse NewImage', {
                cause: parsedNewImage.error,
              })
            : new ParseError('Failed to parse OldImage', {
                cause: (parsedOldImage as ParsedResultError<unknown>).error,
              }),
          originalEvent: data,
        };
      }
      parsedLogEvents.push({
        NewImage: parsedNewImage.data,
        OldImage: parsedOldImage.data,
      });
    }

    return {
      success: true,
      data: parsedLogEvents,
    };
  }
}
