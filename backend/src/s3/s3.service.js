const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
require('dotenv').config();

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const BUCKET_URL = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

/**
 * Get a presigned URL for uploading a file
 * @param {Object} data - The file data object containing fileName, contentType, and folder
 * @returns {Promise<{url: string, key: string, presignedUrl: string}>} - The presigned URL and file details
 */
async function getPresignedUrl(data) {
    try {
        const { fileName, contentType, folder = 'documents' } = data;
        const key = `${folder}/${fileName}`;
        
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
            ACL: 'public-read'
        });

        // Generate presigned URL that expires in 15 minutes
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

        return {
            url: `${BUCKET_URL}/${key}`,
            key,
            presignedUrl
        };
    } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw new Error('Failed to generate presigned URL');
    }
}

/**
 * Upload a file to S3
 * @param {Object} data - The file data object containing fileContent, fileName, contentType, and folder
 * @returns {Promise<{url: string, key: string}>} - The complete URL and key of the uploaded file
 */
async function uploadFile(data) {
    try {
        const { fileContent, fileName, contentType, folder = 'documents' } = data;
        const key = `${folder}/${fileName}`;
        
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: fileContent,
            ContentType: contentType,
            ACL: 'public-read'
        });

        await s3Client.send(command);

        return {
            url: `${BUCKET_URL}/${key}`,
            key
        };
    } catch (error) {
        console.error('Error uploading to S3:', error);
        throw new Error('Failed to upload file to S3');
    }
}

module.exports = {
    uploadFile,
    getPresignedUrl
}; 