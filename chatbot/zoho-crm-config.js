// ZOHO CRM Integration Configuration
export const ZOHO_CRM_CONFIG = {
  // ZOHO CRM API Configuration
  API_BASE_URL: 'https://www.zohoapis.com/crm/v3',
  AUTH_URL: 'https://accounts.zoho.com/oauth/v2/auth',
  TOKEN_URL: 'https://accounts.zoho.com/oauth/v2/token',
  
  // OAuth 2.0 Configuration
  CLIENT_ID: '1000.AZW5CJNSQ6SGGPL3QXCZX2K2XIOUPR',
  CLIENT_SECRET: 'b0642d2fd80c3b0fe530c9ccd9e3e7d38c53fa07df',
  REDIRECT_URI: 'http://localhost:5500/oauth/callback',
  
  // CRM Module IDs (for different entity types)
  MODULES: {
    LEADS: 'Leads',
    CONTACTS: 'Contacts',
    ACCOUNTS: 'Accounts',
    DEALS: 'Deals',
    TASKS: 'Tasks',
    CALLS: 'Calls',
    MEETINGS: 'Meetings'
  },
  
  // Healthcare-specific custom fields
  HEALTHCARE_FIELDS: {
    PATIENT_ID: 'Patient_ID',
    MEDICAL_HISTORY: 'Medical_History',
    APPOINTMENT_STATUS: 'Appointment_Status',
    DOCTOR_SPECIALTY: 'Doctor_Specialty',
    INSURANCE_INFO: 'Insurance_Information',
    EMERGENCY_CONTACT: 'Emergency_Contact'
  },
  
  // API Endpoints
  ENDPOINTS: {
    LEADS: '/Leads',
    CONTACTS: '/Contacts',
    ACCOUNTS: '/Accounts',
    DEALS: '/Deals',
    TASKS: '/Tasks',
    SEARCH: '/search',
    BULK_READ: '/bulk_read',
    BULK_WRITE: '/bulk_write'
  }
};

// ZOHO CRM Authentication Helper
export class ZohoCRMAuth {
  constructor() {
    this.accessToken = localStorage.getItem('zoho_access_token');
    this.refreshToken = localStorage.getItem('zoho_refresh_token');
    this.tokenExpiry = localStorage.getItem('zoho_token_expiry');
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.accessToken && this.tokenExpiry && new Date() < new Date(this.tokenExpiry);
  }

  // Get authorization URL
  getAuthUrl() {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: ZOHO_CRM_CONFIG.CLIENT_ID,
      redirect_uri: ZOHO_CRM_CONFIG.REDIRECT_URI,
      scope: 'ZohoCRM.modules.ALL,ZohoCRM.settings.ALL',
      access_type: 'offline'
    });
    return `${ZOHO_CRM_CONFIG.AUTH_URL}?${params.toString()}`;
  }

  // Store tokens
  storeTokens(accessToken, refreshToken, expiresIn) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    
    localStorage.setItem('zoho_access_token', accessToken);
    localStorage.setItem('zoho_refresh_token', refreshToken);
    localStorage.setItem('zoho_token_expiry', this.tokenExpiry.toISOString());
  }

  // Get access token for API calls
  getAccessToken() {
    return this.accessToken;
  }
}

// ZOHO CRM API Helper
export class ZohoCRMAPI {
  constructor(auth) {
    this.auth = auth;
  }

  // Make authenticated API request
  async makeRequest(endpoint, method = 'GET', data = null) {
    if (!this.auth.isAuthenticated()) {
      throw new Error('Not authenticated with ZOHO CRM');
    }

    const headers = {
      'Authorization': `Zoho-oauthtoken ${this.auth.getAccessToken()}`,
      'Content-Type': 'application/json'
    };

    const config = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined
    };

    try {
      const response = await fetch(`${ZOHO_CRM_CONFIG.API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`ZOHO CRM API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ZOHO CRM API Request Failed:', error);
      throw error;
    }
  }

  // Create a new lead
  async createLead(leadData) {
    const data = {
      data: [{
        ...leadData,
        Lead_Source: 'Website',
        Status: 'New'
      }]
    };
    
    return await this.makeRequest(ZOHO_CRM_CONFIG.ENDPOINTS.LEADS, 'POST', data);
  }

  // Create a new contact
  async createContact(contactData) {
    const data = {
      data: [{
        ...contactData,
        Lead_Source: 'Website'
      }]
    };
    
    return await this.makeRequest(ZOHO_CRM_CONFIG.ENDPOINTS.CONTACTS, 'POST', data);
  }

  // Search for records
  async searchRecords(module, searchCriteria) {
    const data = {
      module: module,
      search_criteria: searchCriteria
    };
    
    return await this.makeRequest(ZOHO_CRM_CONFIG.ENDPOINTS.SEARCH, 'POST', data);
  }

  // Update record
  async updateRecord(module, recordId, updateData) {
    const data = {
      data: [{
        id: recordId,
        ...updateData
      }]
    };
    
    return await this.makeRequest(`${ZOHO_CRM_CONFIG.ENDPOINTS[module]}/${recordId}`, 'PUT', data);
  }
}

// Healthcare-specific CRM operations
export class HealthcareCRM {
  constructor(crmAPI) {
    this.crmAPI = crmAPI;
  }

  // Create patient lead
  async createPatientLead(patientData) {
    const leadData = {
      First_Name: patientData.firstName,
      Last_Name: patientData.lastName,
      Email: patientData.email,
      Phone: patientData.phone,
      Company: 'Healthcare Patient',
      [ZOHO_CRM_CONFIG.HEALTHCARE_FIELDS.PATIENT_ID]: patientData.patientId,
      [ZOHO_CRM_CONFIG.HEALTHCARE_FIELDS.DOCTOR_SPECIALTY]: patientData.specialty,
      Description: `Patient seeking ${patientData.specialty} consultation`
    };

    return await this.crmAPI.createLead(leadData);
  }

  // Create doctor contact
  async createDoctorContact(doctorData) {
    const contactData = {
      First_Name: doctorData.firstName,
      Last_Name: doctorData.lastName,
      Email: doctorData.email,
      Phone: doctorData.phone,
      Title: 'Doctor',
      Department: doctorData.specialty,
      [ZOHO_CRM_CONFIG.HEALTHCARE_FIELDS.DOCTOR_SPECIALTY]: doctorData.specialty
    };

    return await this.crmAPI.createContact(contactData);
  }

  // Log appointment interaction
  async logAppointment(appointmentData) {
    const taskData = {
      Subject: `Appointment: ${appointmentData.specialty}`,
      Description: `Appointment scheduled with ${appointmentData.doctor} on ${appointmentData.date} at ${appointmentData.time}`,
      Status: 'Completed',
      Priority: 'High',
      Due_Date: appointmentData.date
    };

    return await this.crmAPI.makeRequest(ZOHO_CRM_CONFIG.ENDPOINTS.TASKS, 'POST', { data: [taskData] });
  }

  // Search patients by specialty
  async searchPatientsBySpecialty(specialty) {
    const searchCriteria = {
      module: ZOHO_CRM_CONFIG.MODULES.LEADS,
      search_criteria: {
        field: ZOHO_CRM_CONFIG.HEALTHCARE_FIELDS.DOCTOR_SPECIALTY,
        value: specialty,
        operator: 'is'
      }
    };

    return await this.crmAPI.searchRecords(ZOHO_CRM_CONFIG.MODULES.LEADS, searchCriteria);
  }
}
