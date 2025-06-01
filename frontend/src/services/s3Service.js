import api from './api';

export const s3Service = {
    // Get presigned URL for direct upload
    getPresignedUrl: async (fileName, contentType, folder = 'resumes') => {
        try {
            const response = await api.post('/s3/presigned-url', {
                fileName,
                contentType,
                folder
            });
            console.log("response", response.data);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to get upload URL');
        }
    },

    // Upload file directly to S3 using presigned URL
    uploadFileDirectly: async (file, presignedUrl) => {
        try {
            const response = await fetch(presignedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to upload file to S3');
            }
            
            return true;
        } catch (error) {
            console.error('S3 upload error:', error);
            throw new Error('Failed to upload file');
        }
    },

    // Upload file through server (for smaller files)
    uploadFileThroughServer: async (file, folder = 'resumes') => {
        try {
            const response = await api.post('/s3/upload', {
                file: await convertFileToBase64(file),
                fileName: file.name,
                contentType: file.type,
                folder
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.error || 'Failed to upload file');
        }
    }
};

// Helper function to convert File to base64
const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}; 