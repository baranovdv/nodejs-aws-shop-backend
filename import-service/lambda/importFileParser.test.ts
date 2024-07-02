
import { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { S3Event } from 'aws-lambda';
import { Readable } from 'stream';
import { mockClient } from 'aws-sdk-client-mock'; 
import { handler } from "./importFileParser";

describe('Handler', () => {
    let s3ClientMock: any;

    const s3Event = { 
        Records: [
            {
                s3: {
                    bucket: {
                        name: 'bucket-name-test'
                    },
                    object: {
                        key: 'uploaded/file.csv'
                    }
                } 
            }
        ]
    };

    beforeEach(() => {
        s3ClientMock = mockClient(S3Client);

        s3ClientMock.on(GetObjectCommand).resolves({
            Body: Readable.from(['id,name\n1,Product1']),
        });

        s3ClientMock.on(CopyObjectCommand).resolves({}); 

        s3ClientMock.on(DeleteObjectCommand).resolves({});
    });

    afterEach(() => {
        s3ClientMock.reset();
    });

    test('should process s3 event correctly', async () => {
        await expect(handler(s3Event as unknown as S3Event)).resolves.toBeUndefined();
        expect(s3ClientMock.calls()).toHaveLength(3);
    });
});