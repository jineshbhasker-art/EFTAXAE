/**
 * API Endpoints Test Reference & Documentation
 * 
 * This file documents all API endpoints for testing and integration.
 * Base URL: http://localhost:5000 (local development)
 */

// ============================================
// AUTHENTICATION ENDPOINTS
// ============================================

export const AUTH_ENDPOINTS = {
  // Register new user
  register: {
    method: 'POST',
    path: '/api/auth/register',
    auth: false,
    body: {
      username: 'string',
      email: 'string',
      password: 'string',
      displayName: 'string',
      role: 'person | corporate | admin'
    },
    response: {
      id: 'string',
      username: 'string',
      email: 'string',
      displayName: 'string',
      role: 'string',
      createdAt: 'ISO-8601 timestamp'
    }
  },

  // Login user
  login: {
    method: 'POST',
    path: '/api/auth/login',
    auth: false,
    body: {
      username: 'string',
      password: 'string'
    },
    response: {
      id: 'string',
      username: 'string',
      email: 'string',
      displayName: 'string',
      role: 'string'
    },
    notes: 'Sets JWT in httpOnly cookie'
  },

  // Logout user
  logout: {
    method: 'POST',
    path: '/api/auth/logout',
    auth: true,
    response: { message: 'Logged out successfully' }
  },

  // Get current user
  getCurrentUser: {
    method: 'GET',
    path: '/api/auth/me',
    auth: true,
    response: {
      id: 'string',
      username: 'string',
      email: 'string',
      displayName: 'string',
      role: 'string'
    }
  },

  // Health check
  health: {
    method: 'GET',
    path: '/api/health',
    auth: false,
    response: {
      status: 'ok',
      timestamp: 'ISO-8601'
    }
  }
};

// ============================================
// VAT RETURNS ENDPOINTS
// ============================================

export const VAT_ENDPOINTS = {
  // List all VAT returns for user
  list: {
    method: 'GET',
    path: '/api/vat_returns',
    auth: true,
    queryParams: [],
    response: [
      {
        id: 'string (UUID)',
        userId: 'string',
        status: 'Draft | Submitted | Overdue',
        period: 'string (e.g., "01/12/2025 - 28/02/2026")',
        vatRef: 'string (UAE VAT Reference Number)',
        periodFrom: 'ISO-8601',
        periodTo: 'ISO-8601',
        taxYearEnd: 'ISO-8601',
        totalSales: 'number (AED)',
        totalVAT: 'number (AED)',
        totalExpenses: 'number (AED)',
        totalRecoverableVAT: 'number (AED)',
        netVAT: 'number (AED)',
        dueDate: 'ISO-8601',
        filedAt: 'ISO-8601 | null',
        createdAt: 'ISO-8601',
        updatedAt: 'ISO-8601',
        formData: 'JSON string'
      }
    ]
  },

  // Get single VAT return
  getById: {
    method: 'GET',
    path: '/api/vat_returns/:id',
    auth: true,
    params: {
      id: 'string (UUID)'
    },
    response: {
      id: 'string',
      userId: 'string',
      status: 'Draft | Submitted | Overdue',
      period: 'string',
      vatRef: 'string',
      periodFrom: 'ISO-8601',
      periodTo: 'ISO-8601',
      taxYearEnd: 'ISO-8601',
      totalSales: 'number',
      totalVAT: 'number',
      totalExpenses: 'number',
      totalRecoverableVAT: 'number',
      netVAT: 'number',
      dueDate: 'ISO-8601',
      filedAt: 'ISO-8601 | null',
      createdAt: 'ISO-8601',
      updatedAt: 'ISO-8601',
      formData: {
        sales: {
          standardRated: {
            abuDhabi: { amount: 'number', vat: 'number', adjustment: 'number' },
            dubai: { amount: 'number', vat: 'number', adjustment: 'number' },
            sharjah: { amount: 'number', vat: 'number', adjustment: 'number' },
            ajman: { amount: 'number', vat: 'number', adjustment: 'number' },
            ummAlQuwain: { amount: 'number', vat: 'number', adjustment: 'number' },
            rasAlKhaimah: { amount: 'number', vat: 'number', adjustment: 'number' },
            fujairah: { amount: 'number', vat: 'number', adjustment: 'number' }
          },
          touristRefunds: { amount: 'number', vat: 'number', adjustment: 'number' },
          reverseCharge: { amount: 'number', vat: 'number' },
          zeroRated: { amount: 'number' },
          exempt: { amount: 'number' },
          goodsImported: { amount: 'number', vat: 'number' },
          adjustmentsImports: { amount: 'number', vat: 'number' }
        },
        expenses: {
          standardRated: { amount: 'number', vat: 'number', adjustment: 'number' },
          reverseCharge: { amount: 'number', vat: 'number', adjustment: 'number' }
        },
        refundRequest: 'Yes | No',
        profitMarginScheme: 'Yes | No'
      }
    },
    notes: 'formData is automatically parsed from JSON string'
  },

  // Create new VAT return
  create: {
    method: 'POST',
    path: '/api/vat_returns',
    auth: true,
    body: {
      status: 'Draft | Submitted',
      period: 'string',
      vatRef: 'string',
      periodFrom: 'ISO-8601',
      periodTo: 'ISO-8601',
      taxYearEnd: 'ISO-8601',
      totalSales: 'number',
      totalVAT: 'number',
      totalExpenses: 'number',
      totalRecoverableVAT: 'number',
      netVAT: 'number',
      dueDate: 'ISO-8601',
      formData: 'object (automatically stringified)'
    },
    response: {
      id: 'string (new UUID)',
      createdAt: 'ISO-8601'
    },
    notes: 'If status is "Submitted", filedAt is auto-set to current date'
  },

  // Update VAT return
  update: {
    method: 'PUT',
    path: '/api/vat_returns/:id',
    auth: true,
    params: {
      id: 'string (UUID)'
    },
    body: {
      status: 'Draft | Submitted',
      period: 'string',
      totalSales: 'number',
      totalVAT: 'number',
      totalExpenses: 'number',
      totalRecoverableVAT: 'number',
      netVAT: 'number',
      formData: 'object'
    },
    response: {
      message: 'VAT return updated successfully',
      id: 'string'
    }
  },

  // Delete VAT return
  delete: {
    method: 'DELETE',
    path: '/api/vat_returns/:id',
    auth: true,
    params: {
      id: 'string (UUID)'
    },
    response: {
      message: 'VAT return deleted successfully'
    }
  }
};

// ============================================
// PAYMENTS ENDPOINTS
// ============================================

export const PAYMENT_ENDPOINTS = {
  // List all payments
  list: {
    method: 'GET',
    path: '/api/payments',
    auth: true,
    response: [
      {
        id: 'string (UUID)',
        userId: 'string',
        type: 'VAT Payment | Corporate Tax',
        amount: 'number (AED)',
        status: 'Paid | Outstanding | Overdue',
        dueDate: 'ISO-8601',
        paidAt: 'ISO-8601 | null',
        createdAt: 'ISO-8601'
      }
    ]
  },

  // Create payment
  create: {
    method: 'POST',
    path: '/api/payments',
    auth: true,
    body: {
      type: 'VAT Payment | Corporate Tax',
      amount: 'number (AED)',
      status: 'Paid | Outstanding',
      dueDate: 'ISO-8601'
    },
    response: {
      id: 'string (new UUID)',
      createdAt: 'ISO-8601'
    },
    notes: 'If status is "Paid", paidAt is auto-set to current date'
  },

  // Update payment status
  updateStatus: {
    method: 'PUT',
    path: '/api/payments/:id',
    auth: true,
    params: {
      id: 'string (UUID)'
    },
    body: {
      status: 'Paid | Outstanding'
    },
    response: {
      message: 'Payment status updated successfully'
    }
  }
};

// ============================================
// CORPORATE TAX ENDPOINTS
// ============================================

export const CORPORATE_TAX_ENDPOINTS = {
  // List all corporate tax returns
  list: {
    method: 'GET',
    path: '/api/corporate_tax_returns',
    auth: true,
    response: [
      {
        id: 'string (UUID)',
        userId: 'string',
        status: 'Draft | Submitted',
        period: 'string (e.g., "2024")',
        netTax: 'number (AED)',
        dueDate: 'ISO-8601',
        filedAt: 'ISO-8601 | null',
        createdAt: 'ISO-8601',
        updatedAt: 'ISO-8601',
        formData: 'JSON string'
      }
    ]
  },

  // Create corporate tax return
  create: {
    method: 'POST',
    path: '/api/corporate_tax_returns',
    auth: true,
    body: {
      status: 'Draft | Submitted',
      period: 'string',
      netTax: 'number',
      dueDate: 'ISO-8601',
      formData: 'object'
    },
    response: {
      id: 'string (new UUID)',
      createdAt: 'ISO-8601'
    }
  },

  // Delete corporate tax return
  delete: {
    method: 'DELETE',
    path: '/api/corporate_tax_returns/:id',
    auth: true,
    params: {
      id: 'string (UUID)'
    },
    response: {
      message: 'Corporate tax return deleted successfully'
    }
  }
};

// ============================================
// CORRESPONDENCE ENDPOINTS
// ============================================

export const CORRESPONDENCE_ENDPOINTS = {
  // Get all correspondence (messages/inbox)
  list: {
    method: 'GET',
    path: '/api/correspondence',
    auth: true,
    response: [
      {
        id: 'string (UUID)',
        userId: 'string',
        subject: 'string',
        fromName: 'string',
        date: 'ISO-8601',
        status: 'Read | Unread',
        content: 'string',
        createdAt: 'ISO-8601'
      }
    ]
  }
};

// ============================================
// REGISTRATIONS ENDPOINTS
// ============================================

export const REGISTRATION_ENDPOINTS = {
  // Get all tax registrations
  list: {
    method: 'GET',
    path: '/api/registrations',
    auth: true,
    response: [
      {
        id: 'string (UUID)',
        userId: 'string',
        taxType: 'VAT | Corporate Tax',
        trn: 'string (Tax Reference Number)',
        status: 'Active | Inactive',
        effectiveDate: 'ISO-8601',
        entityName: 'string',
        createdAt: 'ISO-8601'
      }
    ]
  }
};

// ============================================
// DOCUMENTS ENDPOINTS
// ============================================

export const DOCUMENT_ENDPOINTS = {
  // Get all documents
  list: {
    method: 'GET',
    path: '/api/documents',
    auth: true,
    response: [
      {
        id: 'string (UUID)',
        userId: 'string',
        vatReturnId: 'string (UUID)',
        fileName: 'string',
        fileType: 'string (mime type)',
        fileData: 'string (base64)',
        createdAt: 'ISO-8601'
      }
    ]
  },

  // Get documents for specific VAT return
  getByVatReturn: {
    method: 'GET',
    path: '/api/documents/:vatReturnId',
    auth: true,
    params: {
      vatReturnId: 'string (UUID)'
    },
    response: 'Array of document objects'
  },

  // Download document
  download: {
    method: 'GET',
    path: '/api/documents/download/:id',
    auth: true,
    params: {
      id: 'string (UUID)'
    },
    response: 'File metadata with base64 data'
  },

  // Upload document
  upload: {
    method: 'POST',
    path: '/api/documents/upload',
    auth: true,
    body: {
      vatReturnId: 'string (UUID)',
      fileName: 'string',
      fileType: 'string (mime type)',
      fileData: 'string (base64 encoded)'
    },
    response: {
      id: 'string (new UUID)',
      createdAt: 'ISO-8601'
    }
  }
};

// ============================================
// SPECIAL ENDPOINTS
// ============================================

export const SPECIAL_ENDPOINTS = {
  // Send payment receipt
  sendReceipt: {
    method: 'POST',
    path: '/api/send-receipt',
    auth: true,
    body: {
      amount: 'number (AED)',
      reference: 'string (payment reference)',
      email: 'string'
    },
    response: {
      id: 'string (correspondence ID)',
      message: 'Receipt sent successfully'
    },
    notes: 'Adds message to correspondence table and logs to console'
  }
};

// ============================================
// ERROR RESPONSES
// ============================================

export const ERROR_RESPONSES = {
  notAuthenticated: {
    status: 401,
    body: { error: 'Not authenticated' }
  },
  unauthorized: {
    status: 403,
    body: { error: 'Unauthorized' }
  },
  notFound: {
    status: 404,
    body: { error: 'Not found' }
  },
  badRequest: {
    status: 400,
    body: { error: 'Bad request', message: 'string' }
  },
  internalError: {
    status: 500,
    body: { error: 'Internal Server Error', message: 'string' }
  },
  apiNotFound: {
    status: 404,
    body: { error: 'API route not found' }
  }
};

// ============================================
// TEST CREDENTIALS
// ============================================

export const TEST_CREDENTIALS = {
  admin: {
    username: 'admin',
    password: 'admin',
    notes: 'Auto-creates on first login if not exists'
  },
  corporate: {
    username: 'corporate_user',
    password: 'password123',
    role: 'corporate'
  },
  person: {
    username: 'person_user',
    password: 'password123',
    role: 'person'
  }
};

// ============================================
// DATABASE SCHEMA
// ============================================

export const DATABASE_SCHEMA = {
  users: {
    id: 'TEXT PRIMARY KEY',
    username: 'TEXT UNIQUE',
    email: 'TEXT UNIQUE',
    password: 'TEXT (bcrypted)',
    displayName: 'TEXT',
    role: "TEXT ('admin', 'corporate', 'person')",
    createdAt: 'TEXT'
  },
  vat_returns: {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT FOREIGN KEY',
    status: "TEXT ('Draft', 'Submitted', 'Overdue')",
    period: 'TEXT',
    vatRef: 'TEXT',
    periodFrom: 'TEXT',
    periodTo: 'TEXT',
    taxYearEnd: 'TEXT',
    totalSales: 'REAL',
    totalVAT: 'REAL',
    totalExpenses: 'REAL',
    totalRecoverableVAT: 'REAL',
    netVAT: 'REAL',
    dueDate: 'TEXT',
    filedAt: 'TEXT',
    updatedAt: 'TEXT',
    createdAt: 'TEXT',
    formData: 'TEXT (JSON string)'
  },
  payments: {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT FOREIGN KEY',
    type: "TEXT ('VAT Payment', 'Corporate Tax')",
    amount: 'REAL',
    status: "TEXT ('Paid', 'Outstanding')",
    dueDate: 'TEXT',
    paidAt: 'TEXT',
    createdAt: 'TEXT'
  },
  corporate_tax_returns: {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT FOREIGN KEY',
    status: "TEXT ('Draft', 'Submitted')",
    period: 'TEXT',
    netTax: 'REAL',
    dueDate: 'TEXT',
    filedAt: 'TEXT',
    updatedAt: 'TEXT',
    createdAt: 'TEXT',
    formData: 'TEXT (JSON string)'
  },
  correspondence: {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT FOREIGN KEY',
    subject: 'TEXT',
    fromName: 'TEXT',
    date: 'TEXT',
    status: "TEXT ('Read', 'Unread')",
    content: 'TEXT',
    createdAt: 'TEXT'
  },
  registrations: {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT FOREIGN KEY',
    taxType: "TEXT ('VAT', 'Corporate Tax')",
    trn: 'TEXT',
    status: "TEXT ('Active', 'Inactive')",
    effectiveDate: 'TEXT',
    entityName: 'TEXT',
    createdAt: 'TEXT'
  },
  documents: {
    id: 'TEXT PRIMARY KEY',
    userId: 'TEXT FOREIGN KEY',
    vatReturnId: 'TEXT FOREIGN KEY',
    fileName: 'TEXT',
    fileType: 'TEXT',
    fileData: 'TEXT (base64)',
    createdAt: 'TEXT'
  }
};

// ============================================
// CURL EXAMPLES FOR TESTING
// ============================================

export const CURL_EXAMPLES = `
# 1. LOGIN
curl -X POST http://localhost:5000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"person_user","password":"password123"}' \\
  -c cookies.txt

# 2. GET CURRENT USER
curl -X GET http://localhost:5000/api/auth/me \\
  -b cookies.txt

# 3. LIST VAT RETURNS
curl -X GET http://localhost:5000/api/vat_returns \\
  -b cookies.txt

# 4. CREATE NEW VAT RETURN
curl -X POST http://localhost:5000/api/vat_returns \\
  -b cookies.txt \\
  -H "Content-Type: application/json" \\
  -d '{
    "status": "Draft",
    "period": "Q1 2026",
    "vatRef": "100354945600003",
    "periodFrom": "2026-01-01T00:00:00Z",
    "periodTo": "2026-03-31T23:59:59Z",
    "taxYearEnd": "2026-03-31T00:00:00Z",
    "totalSales": 2601836.65,
    "totalVAT": 130091.83,
    "totalExpenses": 2039361.00,
    "totalRecoverableVAT": 101968.05,
    "netVAT": 28123.78,
    "dueDate": "2026-04-30T00:00:00Z",
    "formData": {}
  }'

# 5. LIST PAYMENTS
curl -X GET http://localhost:5000/api/payments \\
  -b cookies.txt

# 6. CREATE PAYMENT
curl -X POST http://localhost:5000/api/payments \\
  -b cookies.txt \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "VAT Payment",
    "amount": 28123.78,
    "status": "Outstanding",
    "dueDate": "2026-04-30T00:00:00Z"
  }'

# 7. LOGOUT
curl -X POST http://localhost:5000/api/auth/logout \\
  -b cookies.txt
`;
