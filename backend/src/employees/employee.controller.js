const employeeService = require('./employee.service');
const { Prisma } = require('@prisma/client');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

// Input validation middleware
const validateEmployeeInput = (req, res, next) => {
  const { 
    name, 
    email, 
    role, 
    designation, 
    status, 
    joinDate, 
    gender, 
    employeeType,
    // Personal data fields
    phone,
    address,
    personalEmail,
    city,
    documents,
    bankDetails,
    // Secondary data fields
    currentPosition,
    currentRemuneration
  } = req.body;
  
  // Required fields validation
  if (!name || !email || !role || !designation || !status || !joinDate || !gender || !employeeType) {
    return res.status(400).json({ 
      error: 'Missing required fields',
      required: ['name', 'email', 'role', 'designation', 'status', 'joinDate', 'gender', 'employeeType']
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate personal email if provided
  if (personalEmail && !emailRegex.test(personalEmail)) {
    return res.status(400).json({ error: 'Invalid personal email format' });
  }

  // Validate phone number if provided
  if (phone && !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ error: 'Phone number must be 10 digits' });
  }

  // Validate date format
  if (isNaN(new Date(joinDate).getTime())) {
    return res.status(400).json({ error: 'Invalid join date format' });
  }

  // Validate bank details if provided
  if (bankDetails) {
    if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.bankName) {
      return res.status(400).json({ 
        error: 'Missing required bank details',
        required: ['accountHolderName', 'accountNumber', 'ifsc', 'bankName']
      });
    }
  }

  // Validate documents if provided
  if (documents && Array.isArray(documents)) {
    for (const doc of documents) {
      if (doc.number) {
        try {
          validateDocumentNumber(doc.name, doc.number);
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      }
    }
  }

  next();
};

// Get all employees
async function getEmployees(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pagination parameters',
        error: 'Page must be greater than 0 and limit must be between 1 and 100'
      });
    }

    const result = await employeeService.getEmployees(req.user, page, limit);
    
    if (!result.success) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch employees',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

// Get employee by ID (UUID)
async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const result = await employeeService.getEmployeeById(id, req.user);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
}

// Create employee
async function createEmployee(req, res) {
  try {
    const emp = await employeeService.createEmployee(req.body);
    res.status(201).json({
      message: 'Employee created successfully',
      data: emp
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ 
          error: 'Email or employeeCode already exists',
          field: 'email or employeeCode'
        });
      }
    }
    console.error('Error creating employee:', err);
    res.status(400).json({ 
      error: 'Failed to create employee',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }
}

// Update employee (by UUID)
async function updateEmployee(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    const emp = await employeeService.updateEmployee(id, req.body);
    if (!emp) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json({
      message: 'Employee updated successfully',
      data: emp
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === 'P2002') {
        return res.status(409).json({ 
          error: 'Email or employeeCode already exists',
          field: 'email or employeeCode'
        });
      }
    }
    console.error('Error updating employee:', err);
    res.status(400).json({ 
      error: 'Failed to update employee',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }
}

// Delete employee (by UUID)
async function deleteEmployee(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }
    await employeeService.deleteEmployee(id);
    res.json({ 
      message: 'Employee deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting employee:', err);
    res.status(400).json({ 
      error: 'Failed to delete employee',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }
}

// Personal Information Controllers
async function createPersonalInfo(req, res) {
  try {
    const { id } = req.params;
    const result = await employeeService.createPersonalInfo(id, req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating personal information:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create personal information',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

async function updatePersonalInfo(req, res) {
  try {
    const { id } = req.params;
    const result = await employeeService.updatePersonalInfo(id, req.body);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (err) {
    console.error('Error updating personal information:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update personal information',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

async function getPersonalInfo(req, res) {
  try {
    const { id } = req.params;
    const result = await employeeService.getPersonalInfo(id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching personal info:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch personal information',
      error: error.message
    });
  }
}

// Secondary Data Controllers
async function createSecondaryData(req, res) {
  try {
    const { id } = req.params;
    const secondaryData = await employeeService.createSecondaryData(id, req.body);
    res.status(201).json({
      message: 'Secondary data created successfully',
      data: secondaryData
    });
  } catch (err) {
    console.error('Error creating secondary data:', err);
    res.status(400).json({ 
      error: 'Failed to create secondary data',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }
}

async function updateSecondaryData(req, res) {
  try {
    const { id } = req.params;
    const secondaryData = await employeeService.updateSecondaryData(id, req.body);
    if (!secondaryData) {
      return res.status(404).json({ error: 'Secondary data not found' });
    }
    res.json({
      message: 'Secondary data updated successfully',
      data: secondaryData
    });
  } catch (err) {
    console.error('Error updating secondary data:', err);
    res.status(400).json({ 
      error: 'Failed to update secondary data',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Invalid input data'
    });
  }
}

async function getSecondaryData(req, res) {
  try {
    const { id } = req.params;
    const result = await employeeService.getSecondaryData(id);
    res.json(result);
  } catch (error) {
    console.error('Error fetching secondary data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch secondary data',
      error: error.message
    });
  }
}

// Document Status Update Controller
async function updateDocumentStatus(req, res) {
  try {
    const { id } = req.params;
    const { documentId, status, remarks } = req.body;
    const { id: approverId, name: approverName } = req.user;

    console.log('Received verification request:', {
      employeeId: id,
      documentId,
      status,
      remarks,
      approverId,
      approverName
    });

    // Validate required fields
    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: 'Document ID is required'
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['PENDING', 'VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validStatuses
      });
    }

    // Validate remarks for REJECTED status
    if (status === 'REJECTED' && (!remarks || remarks.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Remarks are required when rejecting a document'
      });
    }

    // Set default remarks based on status if not provided
    let finalRemarks = remarks;
    if (!finalRemarks) {
      switch (status) {
        case 'VERIFIED':
          finalRemarks = 'Document verified successfully';
          break;
        case 'REJECTED':
          finalRemarks = 'Document rejected';
          break;
        default:
          finalRemarks = 'Status updated';
      }
    }

    const result = await employeeService.updateDocumentStatus(
      id, 
      documentId, 
      status, 
      finalRemarks,
      approverId,
      approverName
    );
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: `Document ${status.toLowerCase()} successfully`,
      data: result.data
    });
  } catch (err) {
    console.error('Error updating document status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update document status',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Profile Upload
async function uploadProfile(req, res) {
  try {
    const { id } = req.params;
    const file = req.body.file; // Base64 encoded file
    const fileType = req.body.fileType; // e.g., 'image/jpeg', 'image/png'

    if (!file || !fileType) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file.split(',')[1], 'base64');
    const fileExtension = fileType.split('/')[1];
    const fileName = `profiles/${id}/${uuidv4()}.${fileExtension}`;

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: fileType,
    }));

    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    // Update employee profile in database
    const employee = await employeeService.updateEmployee(id, { avatarUrl: fileUrl });

    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Employee not found'
      });
    }

    res.json({
      success: true,
      data: {
        avatarUrl: fileUrl
      }
    });
  } catch (error) {
    console.error('Error uploading profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload profile'
    });
  }
}

// Bank Details
async function getBankDetails(req, res) {
  try {
    const { id } = req.params;
    const personalInfo = await employeeService.getPersonalInfo(id);
    
    if (!personalInfo) {
      return res.status(404).json({
        success: false,
        error: 'Bank details not found'
      });
    }

    res.json({
      success: true,
      data: personalInfo.bankDetails
    });
  } catch (error) {
    console.error('Error fetching bank details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bank details'
    });
  }
}

async function updateBankDetails(req, res) {
  try {
    const { id } = req.params;
    const bankDetails = req.body;

    // Validate bank details
    if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifsc || !bankDetails.bankName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required bank details'
      });
    }

    // Validate IFSC code format
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankDetails.ifsc)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid IFSC code format'
      });
    }

    const personalInfo = await employeeService.updatePersonalInfo(id, { bankDetails });

    res.json({
      success: true,
      data: personalInfo.bankDetails
    });
  } catch (error) {
    console.error('Error updating bank details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update bank details'
    });
  }
}

// Document Management
async function getDocuments(req, res) {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id);
    
    if (!employee.success) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get documents from personal info
    const documents = employee.data?.personalInfo?.documents || [];
    
    res.json({
      success: true,
      message: 'Documents fetched successfully',
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message
    });
  }
}

// Document Upload
async function uploadDocument(req, res) {
  try {
    const { id } = req.params;
    const { name, number, url, fileType, fileName, remarks } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        success: false,
        message: 'Document name and URL are required'
      });
    }

    const documentData = {
      name,
      number,
      url,
      fileType,
      fileName,
      remarks,
      uploadedBy: {
        id: req.user.id,
        name: req.user.name
      }
    };

    const document = await employeeService.addDocument(id, documentData);
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload document'
    });
  }
}

async function updateDocument(req, res) {
  try {
    const { id, documentId } = req.params;
    const { name, number, url, fileType, status, remarks } = req.body;
    const { id: approverId, name: approverName } = req.user;
    console.log(req.user, 'req.user',approverId, approverName);

    if (!name || !url) {
      return res.status(400).json({ 
        success: false,
        error: 'Document name and URL are required' 
      });
    }

    const result = await employeeService.updateDocument(id, documentId, {
      name,
      number,
      url,
      fileType,
      status: status || 'PENDING',
      remarks: remarks || 'Document updated',
      uploadedBy: {
        id: approverId,
        name: approverName
      }
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to update document'
    });
  }
}

async function deleteDocument(req, res) {
  try {
    const { id, documentId } = req.params;
    const approverId = req.user.id;
    const approverName = req.user.name;

    const personalInfo = await employeeService.getPersonalInfo(id);
    if (!personalInfo) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const document = personalInfo.documents.id(documentId);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Delete file from S3
    const key = document.url.split('/').pop();
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `documents/${id}/${key}`
    }));

    // Remove document from array with deletion metadata
    const deletionInfo = {
      deletedAt: new Date(),
      deletedBy: approverId,
      deletedByName: approverName,
      reason: req.body.reason || 'Document deleted by user'
    };

    personalInfo.documents.pull(documentId);
    await employeeService.updatePersonalInfo(id, {
      documents: personalInfo.documents,
      documentDeletionHistory: [...(personalInfo.documentDeletionHistory || []), deletionInfo]
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
      data: deletionInfo
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
}

module.exports = {
  validateEmployeeInput,
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  createPersonalInfo,
  updatePersonalInfo,
  getPersonalInfo,
  createSecondaryData,
  updateSecondaryData,
  getSecondaryData,
  updateDocumentStatus,
  uploadProfile,
  getBankDetails,
  updateBankDetails,
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument
};
