const s3Service = require('./s3.service');

/**
 * Get a presigned URL for uploading a file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getPresignedUrl(req, res) {
    try {
        const { fileName, contentType, folder } = req.body;

        if (!fileName || !contentType) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: fileName or contentType' 
            });
        }
        
        const result = await s3Service.getPresignedUrl({
            fileName,
            contentType,
            folder
        });
        
        res.json({
            success: true,
            data: {
                url: result.url,
                key: result.key,
                presignedUrl: result.presignedUrl
            }
        });
    } catch (error) {
        console.error('Presigned URL error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate presigned URL'
        });
    }
}

/**
 * Upload a file to S3
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function uploadFile(req, res) {
    try {
        const { file, fileName, contentType, folder } = req.body;

        if (!file || !fileName || !contentType) {
            return res.status(400).json({ 
                success: false,
                error: 'Missing required fields: file, fileName, or contentType' 
            });
        }

        // Convert base64 to buffer if needed
        let fileContent;
        if (file.startsWith('data:')) {
            // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
            const base64Data = file.split(',')[1];
            fileContent = Buffer.from(base64Data, 'base64');
        } else {
            fileContent = Buffer.from(file, 'base64');
        }
        
        const result = await s3Service.uploadFile({
            fileContent,
            fileName,
            contentType,
            folder
        });
        
        res.json({
            success: true,
            data: {
                url: result.url,
                key: result.key
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload file'
        });
    }
}

module.exports = {
    uploadFile,
    getPresignedUrl
}; 