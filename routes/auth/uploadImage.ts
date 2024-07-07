import { event, getMimeExtension, isStaging } from "#src/utils";
import { randomUUID } from 'crypto'
import { S3 } from "@aws-sdk/client-s3";
const s3 = new S3();

export const uploadImage = async () => {
    const ContentType = event.body.base64.split(';')[0].split('data:')[1];
    const key = `${randomUUID().replaceAll('-', '')}.${getMimeExtension(ContentType)}`;
    await s3.putObject({
        Bucket: `place4pals-files${isStaging ? '-staging' : ''}`,
        Key: `${key}`,
        ContentEncoding: 'base64',
        ContentType,
        Body: Buffer.from(event.body.base64.replace(/^data:.+;base64,/, ""), 'base64'),
    });
    return JSON.stringify(key);
}