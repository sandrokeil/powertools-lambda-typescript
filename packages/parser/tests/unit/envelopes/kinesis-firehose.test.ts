/**
 * Test built in schema envelopes for Kinesis Firehose
 *
 * @group unit/parser/envelopes
 */
import { generateMock } from '@anatine/zod-mock';
import type { z } from 'zod';
import { KinesisFirehoseEnvelope } from '../../../src/envelopes/index.js';
import type { KinesisFirehoseSchema } from '../../../src/schemas/';
import { TestEvents, TestSchema } from '../schema/utils.js';

describe('Kinesis Firehose Envelope', () => {
  describe('parse', () => {
    it('should parse records for PutEvent', () => {
      const mock = generateMock(TestSchema);
      const testEvent = TestEvents.kinesisFirehosePutEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = Buffer.from(JSON.stringify(mock)).toString('base64');
      });

      const resp = KinesisFirehoseEnvelope.parse(testEvent, TestSchema);
      expect(resp).toEqual([mock, mock]);
    });

    it('should parse a single record for SQS event', () => {
      const mock = generateMock(TestSchema);
      const testEvent = TestEvents.kinesisFirehoseSQSEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = Buffer.from(JSON.stringify(mock)).toString('base64');
      });

      const resp = KinesisFirehoseEnvelope.parse(testEvent, TestSchema);
      expect(resp).toEqual([mock]);
    });

    it('should parse records for kinesis event', () => {
      const mock = generateMock(TestSchema);
      const testEvent = TestEvents.kinesisFirehoseKinesisEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = Buffer.from(JSON.stringify(mock)).toString('base64');
      });

      const resp = KinesisFirehoseEnvelope.parse(testEvent, TestSchema);
      expect(resp).toEqual([mock, mock]);
    });
    it('should throw if record is not base64 encoded', () => {
      const testEvent = TestEvents.kinesisFirehosePutEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = 'not base64 encoded';
      });

      expect(() => {
        KinesisFirehoseEnvelope.parse(testEvent, TestSchema);
      }).toThrow();
    });
    it('should throw if envelope is invalid', () => {
      expect(() => {
        KinesisFirehoseEnvelope.parse({ foo: 'bar' }, TestSchema);
      }).toThrow();
    });
    it('should throw when schema does not match record', () => {
      const testEvent = TestEvents.kinesisFirehosePutEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = Buffer.from('not a valid json').toString('base64');
      });

      expect(() => {
        KinesisFirehoseEnvelope.parse(testEvent, TestSchema);
      }).toThrow();
    });
  });
  describe('safeParse', () => {
    it('should parse records for PutEvent', () => {
      const mock = generateMock(TestSchema);
      const testEvent = TestEvents.kinesisFirehosePutEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = Buffer.from(JSON.stringify(mock)).toString('base64');
      });

      const resp = KinesisFirehoseEnvelope.safeParse(testEvent, TestSchema);
      expect(resp).toEqual({ success: true, data: [mock, mock] });
    });

    it('should parse a single record for SQS event', () => {
      const mock = generateMock(TestSchema);
      const testEvent = TestEvents.kinesisFirehoseSQSEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = Buffer.from(JSON.stringify(mock)).toString('base64');
      });

      const resp = KinesisFirehoseEnvelope.safeParse(testEvent, TestSchema);
      expect(resp).toEqual({ success: true, data: [mock] });
    });

    it('should parse records for kinesis event', () => {
      const mock = generateMock(TestSchema);
      const testEvent = TestEvents.kinesisFirehoseKinesisEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = Buffer.from(JSON.stringify(mock)).toString('base64');
      });

      const resp = KinesisFirehoseEnvelope.safeParse(testEvent, TestSchema);
      expect(resp).toEqual({ success: true, data: [mock, mock] });
    });
    it('should return original event if envelope is invalid', () => {
      expect(
        KinesisFirehoseEnvelope.safeParse({ foo: 'bar' }, TestSchema)
      ).toEqual({
        success: false,
        error: expect.any(Error),
        originalEvent: { foo: 'bar' },
      });
    });
    it('should return original event if record is not base64 encoded', () => {
      const testEvent = TestEvents.kinesisFirehosePutEvent as z.infer<
        typeof KinesisFirehoseSchema
      >;

      testEvent.records.map((record) => {
        record.data = 'not base64 encoded';
      });

      expect(KinesisFirehoseEnvelope.safeParse(testEvent, TestSchema)).toEqual({
        success: false,
        error: expect.any(Error),
        originalEvent: testEvent,
      });
    });
    it('should return original event envelope is invalid', () => {
      expect(
        KinesisFirehoseEnvelope.safeParse({ foo: 'bar' }, TestSchema)
      ).toEqual({
        success: false,
        error: expect.any(Error),
        originalEvent: { foo: 'bar' },
      });
    });
  });
});
