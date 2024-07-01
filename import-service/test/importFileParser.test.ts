import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { handler } from '../lambda/importFileParser';
import type { StreamingBlobPayloadOutputTypes } from "@smithy/types";

const s3Mock = mockClient(S3Client);

describe('S3 lambda', () => {
  afterEach(() => {
    s3Mock.reset();
  });

  it('should handle S3 event successfully', async () => {
    const mockRecord = { Records: [{ s3: { bucket: { name: 'mockBucket' }, object: { key: 'mockKey' } } }] };
    const mockReadstream = new Readable();
    mockReadstream.push("asdfasdfadsfas");
    mockReadstream.push(null);

    s3Mock.on(GetObjectCommand).resolves({
        Body: mockReadstream as StreamingBlobPayloadOutputTypes,
    });
    s3Mock.on(CopyObjectCommand).resolves({});
    s3Mock.on(DeleteObjectCommand).resolves({});

    await handler(mockRecord as any);

    expect(s3Mock.calls()).toEqual([
      [expect.objectContaining({ input: { Bucket: 'mockBucket', Key: 'mockKey' } })],
      [expect.objectContaining({ input: { Bucket: 'mockBucket', CopySource: 'mockBucket/mockKey', Key: 'parsed/mockKey' } })],
      [expect.objectContaining({ input: { Bucket: 'mockBucket', Key: 'mockKey' } })],
    ]);
  });

  it('should throw an error if GetObjectCommand fails', async () => {
    const mockRecord = { Records: [{ s3: { bucket: { name: 'mockBucket' }, object: { key: 'mockKey' } } }] };

    s3Mock.on(GetObjectCommand).rejects(new Error('Test error'));

    await expect(handler(mockRecord as any)).rejects.toThrow('Error getting object mockKey from bucket mockBucket.');
  });
});