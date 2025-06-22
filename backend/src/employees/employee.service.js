const prisma = require('../prisma/client');
const { encrypt, decrypt } = require('../utils/encryption');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

// Roles allowed to view decrypted salary
const ALLOWED_SALARY_ROLES = ['SUPERADMIN', 'ADMIN', 'ACCOUNTS'];

// Generate the next employeeCode (EMPVL###)
async function getNextEmployeeCode() {
  // Find the max employeeCode in the format EMPVL###
  const last = await prisma.employee.findFirst({
    where: { employeeCode: { startsWith: 'EMPVL' } },
    orderBy: { employeeCode: 'desc' },
    select: { employeeCode: true },
  });
  let nextNum = 1;
  if (last && last.employeeCode) {
    const match = last.employeeCode.match(/EMPVL(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }
  return `EMPVL${String(nextNum).padStart(3, '0')}`;
}

async function getEmployees(currentUser, page = 1, limit = 50) {
  try {
    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.employee.count();

    // Get paginated employees with optimized query
    const employees = await prisma.employee.findMany({
      skip: offset,
      take: limit,
      orderBy: { employeeCode: 'asc' },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        role: true,
        designation: true,
        departmentId: true,
        department: {
          select: {
            id: true,
            name: true
          }
        },
        employeeType: true,
        gender: true,
        joinDate: true,
        status: true,
        salary: true,
        avatarUrl: true,
        reportingManager: {
          select: {
            id: true,
            name: true
          }
        },
        reportingManagerId: true,
        joiningLetterHtml: true,
        baseRole: true,
        currentRole: true
      }
    });

    // Transform the data
    const transformedEmployees = employees.map(emp => ({
      ...emp,
      designation: emp.designation.toUpperCase(),
      joinDate: moment(emp.joinDate).format('YYYY-MM-DD'),
      reportingManager: emp.reportingManager
        ? { id: emp.reportingManager.id, name: emp.reportingManager.name }
        : null,
      salary: canViewSalary(currentUser, emp) ? (emp.salary ? decrypt(emp.salary) : null) : '#####',
    }));

    return {
      success: true,
      data: transformedEmployees,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return {
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    };
  }
}

async function getEmployeeById(id, user) {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        reportingManager: {
          select: { id: true, name: true }
        },
        department: {
          select: { id: true, name: true }
        },
        personalInformation: true,
        secondaryData: true
      }
    });

    if (!employee) {
      return {
        success: false,
        message: 'Employee not found'
      };
    }

    // Ensure documents array exists
    if (!employee.personalInformation?.documents) {
      employee.personalInformation = {
        ...employee.personalInformation,
        documents: []
      };
    }

    return {
      success: true,
      data: {
        ...employee,
        reportingManager: employee.reportingManager
          ? { id: employee.reportingManager.id, name: employee.reportingManager.name }
          : null,
        salary: canViewSalary(user, employee) ? (employee.salary ? decrypt(employee.salary) : null) : '#####',
      }
    };
  } catch (error) {
    console.error('Error fetching employee:', error);
    return {
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    };
  }
}

async function createEmployee(data) {
  let toCreate = { ...data };
  
  // Handle salary encryption if present
  if (toCreate.salary) {
    toCreate.salary = encrypt(toCreate.salary);
  }

  // Ensure joinDate is in ISO format
  if (toCreate.joinDate) {
    toCreate.joinDate = moment(toCreate.joinDate).toISOString();
  }

  // Ensure designation type is uppercase
  if (toCreate.designation) {
    toCreate.designation = toCreate.designation.toUpperCase();
  }

  // Generate next employeeCode
  toCreate.employeeCode = await getNextEmployeeCode();
  const hashedPassword = await bcrypt.hash(toCreate.email, 10);
  
  // Handle relations
  const reportingManagerId = toCreate.reportingManagerId;
  const departmentId = toCreate.departmentId;
  delete toCreate.reportingManagerId;
  delete toCreate.departmentId;

  // Extract personal and secondary data
  const personalData = {
    phone: toCreate.phone || '',
    address: toCreate.address || '',
    personalEmail: toCreate.personalEmail || '',
    city: toCreate.city || '',
    documents: toCreate.documents || [],
    bankDetails: toCreate.bankDetails || {}
  };

  const secondaryData = {
    currentPosition: toCreate.designation || '',
    currentRemuneration: toCreate.salary || '',
    annualLeaveBalance: 20, // Default annual leave balance
    sickLeaveBalance: 10,   // Default sick leave balance
    totalAnnualLeave: 20,   // Default total annual leave
    totalSickLeave: 10      // Default total sick leave
  };

  // Remove personal and secondary data from main employee data
  delete toCreate.phone;
  delete toCreate.address;
  delete toCreate.personalEmail;
  delete toCreate.city;
  delete toCreate.documents;
  delete toCreate.bankDetails;
  
  // Create employee with personal and secondary data in a transaction
  const employee = await prisma.$transaction(async (prisma) => {
    // Create main employee record
    const newEmployee = await prisma.employee.create({ 
    data: {
      ...toCreate,
      passwordHash: hashedPassword,
      reportingManager: reportingManagerId ? {
        connect: { id: reportingManagerId }
      } : undefined,
      department: departmentId ? {
        connect: { id: departmentId }
      } : undefined
    }
    });

    // Create personal information
    await prisma.personalInformation.create({
      data: {
        ...personalData,
        employee: {
          connect: { id: newEmployee.id }
        }
      }
    });

    // Create secondary data
    await prisma.secondaryData.create({
      data: {
        ...secondaryData,
        employee: {
          connect: { id: newEmployee.id }
        }
      }
    });

    return newEmployee;
  });
  
  // Create notification
  await prisma.notification.create({
    data: {
      type: 'EMPLOYEE_CREATED',
      message: `New employee created: ${employee.name}`,
      employeeId: employee.id
    }
  });
  
  return employee;
}

async function updateEmployee(id, data) {
  let toUpdate = { ...data };
  
  // Handle salary encryption if present
  if (toUpdate.salary) {
    toUpdate.salary = encrypt(toUpdate.salary);
  }

  // Ensure joinDate is in ISO format
  if (toUpdate.joinDate) {
    toUpdate.joinDate = moment(toUpdate.joinDate).toISOString();
  }

  // Ensure designation is uppercase
  if (toUpdate.designation) {
    toUpdate.designation = toUpdate.designation.toUpperCase();
  }

  // Handle relations
  const reportingManagerId = toUpdate.reportingManagerId;
  const departmentId = toUpdate.departmentId;
  delete toUpdate.reportingManagerId;
  delete toUpdate.departmentId;

  return prisma.employee.update({ 
    where: { id }, 
    data: {
      ...toUpdate,
      reportingManager: reportingManagerId ? {
        connect: { id: reportingManagerId }
      } : undefined,
      department: departmentId ? {
        connect: { id: departmentId }
      } : undefined
    }
  });
}

async function deleteEmployee(id) {
  return prisma.employee.delete({ where: { id } });
}

function canViewSalary(currentUser, employee) {
  if (!currentUser) return false;
  if (ALLOWED_SALARY_ROLES.includes(currentUser.role)) return true;
  if (currentUser.id === employee.id) return true;
  return false;
}

// Document status enum
const DocumentStatus = {
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

// Personal Information Services
async function createPersonalInfo(employeeId, data) {
  // Check if employee exists
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });
  
  if (!employee) {
    return {
      success: false,
      message: 'Employee not found',
      data: null
    };
  }

  // Check if personal info already exists
  const existingInfo = await prisma.personalInformation.findUnique({
    where: { employeeId }
  });

  if (existingInfo) {
    return {
      success: false,
      message: 'Personal information already exists for this employee',
      data: null
    };
  }

  // Ensure required fields are present
  if (!data.phone || !data.address) {
    return {
      success: false,
      message: 'Phone and address are required fields',
      data: null
    };
  }

  // Create personal information with default values for documents and bank details
  const personalInfo = await prisma.personalInformation.create({
    data: {
      phone: data.phone,
      address: data.address,
      personalEmail: data.personalEmail || '',
      city: data.city || '',
      documents: data.documents || [],
      bankDetails: data.bankDetails || {
        accountHolderName: '',
        accountNumber: '',
        ifsc: '',
        bankName: '',
        branch: ''
      },
      employee: {
        connect: { id: employeeId }
      }
    }
  });

  return {
    success: true,
    message: 'Personal information created successfully',
    data: personalInfo
  };
}

async function updatePersonalInfo(employeeId, data) {
  // Check if personal info exists
  const existingInfo = await prisma.personalInformation.findUnique({
    where: { employeeId }
  });

  if (!existingInfo) {
    return {
      success: false,
      message: 'Personal information not found',
      data: null
    };
  }

  // Ensure required fields are present
  if (!data.phone || !data.address) {
    return {
      success: false,
      message: 'Phone and address are required fields',
      data: null
    };
  }

  // Update personal information
  const personalInfo = await prisma.personalInformation.update({
    where: { employeeId },
    data: {
      phone: data.phone,
      address: data.address,
      personalEmail: data.personalEmail || existingInfo.personalEmail,
      city: data.city || existingInfo.city,
      documents: data.documents || existingInfo.documents,
      bankDetails: data.bankDetails || existingInfo.bankDetails
    }
  });

  return {
    success: true,
    message: 'Personal information updated successfully',
    data: personalInfo
  };
}

async function getPersonalInfo(employeeId) {
  const personalInfo = await prisma.personalInformation.findUnique({
    where: { employeeId }
  });

  if (!personalInfo) {
    return {
      success: true,
      message: "No personal information found",
      data: {
        phone: '',
        address: '',
        personalEmail: '',
        city: '',
        documents: JSON.parse('[{"name":"Aadhaar","url":"","status":"PENDING","required":true,"number":""},{"name":"PAN Card","url":"","status":"PENDING","required":true,"number":""},{"name":"Address Proof","url":"","status":"PENDING","required":true},{"name":"Passport","url":"","status":"PENDING","required":false,"number":""},{"name":"Voter ID","url":"","status":"PENDING","required":false,"number":""},{"name":"Driving License","url":"","status":"PENDING","required":false,"number":""},{"name":"Educational Certificates","url":"","status":"PENDING","required":true},{"name":"Previous Employment Documents","url":"","status":"PENDING","required":true},{"name":"Bank Statement","url":"","status":"PENDING","required":true},{"name":"Salary Slips","url":"","status":"PENDING","required":true},{"name":"Form 16","url":"","status":"PENDING","required":true},{"name":"Medical Insurance","url":"","status":"PENDING","required":false,"number":""},{"name":"Professional Certifications","url":"","status":"PENDING","required":false}]'),
        bankDetails: {
          accountHolderName: '',
          accountNumber: '',
          bankName: '',
          ifsc: '',
          branch: ''
        }
      }
    };
  }

  // Parse the documents JSON if it's a string
  const documents = typeof personalInfo.documents === 'string' 
    ? JSON.parse(personalInfo.documents)
    : personalInfo.documents || [];

  // Parse the bankDetails JSON if it's a string
  const bankDetails = typeof personalInfo.bankDetails === 'string'
    ? JSON.parse(personalInfo.bankDetails)
    : personalInfo.bankDetails || {};

  return {
    success: true,
    data: {
      ...personalInfo,
      documents,
      bankDetails
    }
  };
}

// Document validation helper
function validateDocuments(documents) {
  if (!Array.isArray(documents)) {
    throw new Error('Documents must be an array');
  }

  const requiredDocs = documents.filter(doc => doc.required);
  const missingRequired = requiredDocs.filter(doc => !doc.url || doc.url.trim() === '');

  if (missingRequired.length > 0) {
    throw new Error(`Missing required documents: ${missingRequired.map(doc => doc.name).join(', ')}`);
  }

  // Validate document status
  documents.forEach(doc => {
    if (!Object.values(DocumentStatus).includes(doc.status)) {
      throw new Error(`Invalid status for document ${doc.name}`);
    }

    // Validate document numbers for specific documents
    if (doc.number !== undefined) {
      validateDocumentNumber(doc.name, doc.number);
    }
  });
}

// Document number validation helper
function validateDocumentNumber(docName, number) {
  if (!number) return; // Skip validation if number is empty

  switch (docName) {
    case 'Aadhaar':
      if (!/^\d{12}$/.test(number)) {
        throw new Error('Aadhaar number must be 12 digits');
      }
      break;
    case 'PAN Card':
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(number)) {
        throw new Error('PAN number must be in format: ABCDE1234F');
      }
      break;
    case 'Passport':
      if (!/^[A-Z]{1}[0-9]{7}$/.test(number)) {
        throw new Error('Passport number must be in format: A1234567');
      }
      break;
    case 'Driving License':
      if (!/^[A-Z]{2}[0-9]{2}[0-9]{11}$/.test(number)) {
        throw new Error('Driving License number must be in format: AB12345678901');
      }
      break;
    case 'Voter ID':
      if (!/^[A-Z]{3}[0-9]{7}$/.test(number)) {
        throw new Error('Voter ID must be in format: ABC1234567');
      }
      break;
  }
}

// Document update helper
async function updateDocumentStatus(employeeId, documentId, status, remarks, approverId, approverName) {
  try {
    const personalInfo = await prisma.personalInformation.findUnique({
      where: { employeeId }
    });

    if (!personalInfo) {
      return {
        success: false,
        error: 'Personal information not found'
      };
    }

    // Parse existing documents if they're stored as a string
    const documents = typeof personalInfo.documents === 'string' 
      ? JSON.parse(personalInfo.documents)
      : personalInfo.documents || [];

    // Find the document
    const documentIndex = documents.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
      return {
        success: false,
        error: 'Document not found'
      };
    }

    // Update document status with verification info
    documents[documentIndex] = {
      ...documents[documentIndex],
      status,
      remarks,
      verifiedAt: status === 'VERIFIED' ? new Date() : documents[documentIndex].verifiedAt,
      lastUpdatedAt: new Date(),
      approverId: status === 'VERIFIED' ? approverId : documents[documentIndex].approverId,
      approverName: status === 'VERIFIED' ? approverName : documents[documentIndex].approverName,
      verificationHistory: [
        ...(documents[documentIndex].verificationHistory || []),
        {
          status,
          remarks,
          approverId,
          approverName,
          timestamp: new Date()
        }
      ]
    };

    // Update personal information
    const updatedPersonalInfo = await prisma.personalInformation.update({
      where: { employeeId },
      data: { documents }
    });

    return {
      success: true,
      data: documents[documentIndex]
    };
  } catch (error) {
    console.error('Error in updateDocumentStatus service:', error);
    return {
      success: false,
      error: 'Failed to update document status'
    };
  }
}

// Secondary Data Services
async function createSecondaryData(employeeId, data) {
  // Check if employee exists
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });
  
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Check if secondary data already exists
  const existingData = await prisma.secondaryData.findUnique({
    where: { employeeId }
  });

  if (existingData) {
    throw new Error('Secondary data already exists for this employee');
  }

  return prisma.secondaryData.create({
    data: {
      ...data,
      employee: {
        connect: { id: employeeId }
      }
    }
  });
}

async function updateSecondaryData(employeeId, data) {
  return prisma.secondaryData.update({
    where: { employeeId },
    data
  });
}

async function getSecondaryData(employeeId) {
  const secondaryData = await prisma.secondaryData.findUnique({
    where: { employeeId }
  });

  if (!secondaryData) {
    return {
      success: true,
      message: "No secondary data found",
      data: {
        currentPosition: '',
        currentRemuneration: '',
        annualLeaveBalance: 0,
        sickLeaveBalance: 0,
        totalAnnualLeave: 20,  // Default values
        totalSickLeave: 10     // Default values
      }
    };
  }

  return {
    success: true,
    data: secondaryData
  };
}

// Profile Upload
async function uploadProfile(employeeId, avatarUrl) {
  try {
    const employee = await prisma.employee.update({
      where: { id: employeeId },
      data: { avatarUrl }
    });
    return employee;
  } catch (error) {
    console.error('Error in uploadProfile service:', error);
    throw error;
  }
}

// Bank Details
async function getBankDetails(employeeId) {
  try {
    const personalInfo = await prisma.personalInformation.findUnique({
      where: { employeeId }
    });
    return personalInfo?.bankDetails;
  } catch (error) {
    console.error('Error in getBankDetails service:', error);
    throw error;
  }
}

async function updateBankDetails(employeeId, bankDetails) {
  try {
    const personalInfo = await prisma.personalInformation.upsert({
      where: { employeeId },
      update: { bankDetails },
      create: {
        employeeId,
        bankDetails
      }
    });
    return personalInfo.bankDetails;
  } catch (error) {
    console.error('Error in updateBankDetails service:', error);
    throw error;
  }
}

// Document Management
async function getDocuments(employeeId) {
  try {
    const personalInfo = await prisma.personalInformation.findUnique({
      where: { employeeId }
    });
    return personalInfo?.documents || [];
  } catch (error) {
    console.error('Error in getDocuments service:', error);
    throw error;
  }
}

const addDocument = async (employeeId, document) => {
  try {
    const personalInfo = await prisma.personalInformation.findFirst({
      where: { employeeId }
    });

    if (!personalInfo) {
      throw new Error('Personal information not found');
    }

    // Parse existing documents if they're stored as a string
    const documents = typeof personalInfo.documents === 'string' 
      ? JSON.parse(personalInfo.documents)
      : personalInfo.documents || [];

    // Check if document type already exists
    const existingDoc = documents.find(doc => doc.name === document.name);
    if (existingDoc) {
      throw new Error(`Document of type ${document.name} already exists`);
    }

    const newDocument = {
      id: uuidv4(),
      ...document,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [{
        action: 'UPLOAD',
        status: document.status || 'PENDING',
        remarks: document.remarks || 'Document uploaded',
        timestamp: new Date(),
        user: document.uploadedBy
      }]
    };

    documents.push(newDocument);

    const updatedPersonalInfo = await prisma.personalInformation.update({
      where: { id: personalInfo.id },
      data: {
        documents: JSON.stringify(documents)
      }
    });

    return {
      success: true,
      data: newDocument
    };
  } catch (error) {
    console.error('Error adding document:', error);
    throw new Error(error.message || 'Failed to add document');
  }
};

async function updateDocument(employeeId, documentId, updates) {
  try {
    const personalInfo = await prisma.personalInformation.findFirst({
      where: { employeeId }
    });

    if (!personalInfo) {
      throw new Error('Personal information not found');
    }

    // Parse existing documents if they're stored as a string
    const documents = typeof personalInfo.documents === 'string' 
      ? JSON.parse(personalInfo.documents)
      : personalInfo.documents || [];

    const documentIndex = documents.findIndex(doc => doc.id === documentId);
    if (documentIndex === -1) {
      throw new Error('Document not found');
    }

    const existingDoc = documents[documentIndex];
    const updatedDoc = {
      ...existingDoc,
      ...updates,
      updatedAt: new Date(),
      history: [
        ...(existingDoc.history || []),
        {
          action: 'UPDATE',
          status: updates.status || existingDoc.status,
          remarks: updates.remarks || 'Document updated',
          timestamp: new Date(),
          user: updates.uploadedBy || existingDoc.uploadedBy
        }
      ]
    };

    documents[documentIndex] = updatedDoc;

    const updatedPersonalInfo = await prisma.personalInformation.update({
      where: { id: personalInfo.id },
      data: {
        documents: JSON.stringify(documents)
      }
    });

    return {
      success: true,
      data: updatedDoc
    };
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error(error.message || 'Failed to update document');
  }
}

async function deleteDocument(employeeId, documentId) {
  try {
    const personalInfo = await prisma.personalInformation.findUnique({
      where: { employeeId }
    });

    if (!personalInfo) {
      throw new Error('Personal info not found');
    }

    const documents = personalInfo.documents.filter(doc => doc.id !== documentId);

    await prisma.personalInformation.update({
      where: { employeeId },
      data: { documents }
    });

    return true;
  } catch (error) {
    console.error('Error in deleteDocument service:', error);
    throw error;
  }
}

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getNextEmployeeCode,
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
  addDocument,
  updateDocument,
  deleteDocument
};
