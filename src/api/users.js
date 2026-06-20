import api from './auth';

export const getUsers = async () => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('Error getUsers:', error);
        throw error;
    }
};

export const createUser = async (userData) => {
    try {
        const formData = new FormData();
        formData.append('name', userData.name);
        formData.append('email', userData.email);
        formData.append('password', userData.password);
        formData.append('role', userData.role);
        if (userData.curp) formData.append('curp', userData.curp);
        if (userData.rfc) formData.append('rfc', userData.rfc);
        
        // Archivos - Formato correcto para React Native
        if (userData.ine) {
            formData.append('ine', {
                uri: userData.ine.uri,
                type: userData.ine.type || 'image/jpeg',
                name: userData.ine.name || 'ine.jpg'
            });
        }
        if (userData.cedula) {
            formData.append('cedula', {
                uri: userData.cedula.uri,
                type: userData.cedula.type || 'image/jpeg',
                name: userData.cedula.name || 'cedula.jpg'
            });
        }
        if (userData.certifications) {
            formData.append('certifications', {
                uri: userData.certifications.uri,
                type: userData.certifications.type || 'image/jpeg',
                name: userData.certifications.name || 'certificacion.jpg'
            });
        }
        
        const response = await api.post('/admin/users', formData, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error createUser:', error);
        throw error;
    }
};

export const approveUser = async (userId) => {
    try {
        const response = await api.put(`/admin/users/${userId}/approve`);
        return response.data;
    } catch (error) {
        console.error('Error approveUser:', error);
        throw error;
    }
};

export const rejectUser = async (userId, rejectionReason) => {
    try {
        const response = await api.put(`/admin/users/${userId}/reject`, { rejection_reason: rejectionReason });
        return response.data;
    } catch (error) {
        console.error('Error rejectUser:', error);
        throw error;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleteUser:', error);
        throw error;
    }
};

export const updateUserRole = async (userId, role) => {
    try {
        const response = await api.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    } catch (error) {
        console.error('Error updateUserRole:', error);
        throw error;
    }
};

export const getRiskScore = async () => {
    try {
        const response = await api.get('/admin/risk-score');
        return response.data;
    } catch (error) {
        console.error('Error getRiskScore:', error);
        throw error;
    }
};

export const getRolesPermissions = async () => {
    try {
        const response = await api.get('/admin/roles-permissions');
        return response.data;
    } catch (error) {
        console.error('Error getRolesPermissions:', error);
        throw error;
    }
};

export const togglePermission = async (role, moduleKey) => {
    try {
        const response = await api.post('/admin/toggle-permission', { role, module_key: moduleKey });
        return response.data;
    } catch (error) {
        console.error('Error togglePermission:', error);
        throw error;
    }
};

export const getPatients = async () => {
    try {
        const response = await api.get('/admin/patients');
        return response.data;
    } catch (error) {
        console.error('Error getPatients:', error);
        throw error;
    }
};

export const updatePatientStatus = async (patientId, status) => {
    try {
        const response = await api.put(`/admin/patients/${patientId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updatePatientStatus:', error);
        throw error;
    }
};

export const getEmergencyDashboard = async () => {
    try {
        const response = await api.get('/admin/emergency/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error getEmergencyDashboard:', error);
        throw error;
    }
};

export const storeTriagePatient = async (patientData) => {
    try {
        const response = await api.post('/admin/emergency/patient', patientData);
        return response.data;
    } catch (error) {
        console.error('Error storeTriagePatient:', error);
        throw error;
    }
};

export const updateVitals = async (patientId, vitalsData) => {
    try {
        const response = await api.put(`/admin/emergency/patient/${patientId}/vitals`, vitalsData);
        return response.data;
    } catch (error) {
        console.error('Error updateVitals:', error);
        throw error;
    }
};

export const derivePatient = async (patientId, hospital) => {
    try {
        const response = await api.put(`/admin/emergency/patient/${patientId}/derive`, { derivation_hospital: hospital });
        return response.data;
    } catch (error) {
        console.error('Error derivePatient:', error);
        throw error;
    }
};

export const dischargePatient = async (patientId) => {
    try {
        const response = await api.put(`/admin/emergency/patient/${patientId}/discharge`);
        return response.data;
    } catch (error) {
        console.error('Error dischargePatient:', error);
        throw error;
    }
};

export const getPharmacyDashboard = async (params = {}) => {
    try {
        // Construir query string
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page);
        if (params.per_page) queryParams.append('per_page', params.per_page);
        if (params.search) queryParams.append('search', params.search);
        
        const queryString = queryParams.toString();
        const url = `/pharmacy/dashboard${queryString ? '?' + queryString : ''}`;
        
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error getPharmacyDashboard:', error);
        throw error;
    }
};

export const getPharmacyInventory = async () => {
    try {
        const response = await api.get('/pharmacy/inventory');
        return response.data;
    } catch (error) {
        console.error('Error getPharmacyInventory:', error);
        throw error;
    }
};

export const prescribeMedication = async (data) => {
    try {
        const response = await api.post('/pharmacy/prescribe', data);
        return response.data;
    } catch (error) {
        console.error('Error prescribeMedication:', error);
        throw error;
    }
};
export const getBeds = async () => {
    try {
        const response = await api.get('/admin/beds');
        return response.data;
    } catch (error) {
        console.error('Error getBeds:', error);
        throw error;
    }
};

export const createBed = async (bedData) => {
    try {
        const response = await api.post('/admin/beds', bedData);
        return response.data;
    } catch (error) {
        console.error('Error createBed:', error);
        throw error;
    }
};

export const updateBedStatus = async (bedId, status) => {
    try {
        const response = await api.put(`/admin/beds/${bedId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updateBedStatus:', error);
        throw error;
    }
};

export const deleteBed = async (bedId) => {
    try {
        const response = await api.delete(`/admin/beds/${bedId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleteBed:', error);
        throw error;
    }
};
export const getAmbulances = async () => {
    try {
        const response = await api.get('/admin/ambulances');
        return response.data;
    } catch (error) {
        console.error('Error getAmbulances:', error);
        throw error;
    }
};

export const createAmbulance = async (ambulanceData) => {
    try {
        const response = await api.post('/admin/ambulances', ambulanceData);
        return response.data;
    } catch (error) {
        console.error('Error createAmbulance:', error);
        throw error;
    }
};

export const updateAmbulanceStatus = async (ambulanceId, status) => {
    try {
        const response = await api.put(`/admin/ambulances/${ambulanceId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error('Error updateAmbulanceStatus:', error);
        throw error;
    }
};

export const deleteAmbulance = async (ambulanceId) => {
    try {
        const response = await api.delete(`/admin/ambulances/${ambulanceId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleteAmbulance:', error);
        throw error;
    }
    
};
export const getHospitalLive = async () => {
    try {
        const response = await api.get('/admin/hospital-live');
        return response.data;
    } catch (error) {
        console.error('Error getHospitalLive:', error);
        throw error;
    }
};
export const verifyFinancePin = async (pin) => {
    try {
        const response = await api.post('/admin/finanzas/verify-pin', { pin });
        return response.data;
    } catch (error) {
        console.error('Error verifyFinancePin:', error);
        throw error;
    }
};

export const getFinanzasDashboard = async (financeToken) => {
    try {
        const response = await api.get('/admin/finanzas/dashboard', {
            headers: {
                'X-Finance-Token': financeToken || ''
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error getFinanzasDashboard:', error);
        throw error;
    }
};

export const getAuditoriaDashboard = async () => {
    try {
        const response = await api.get('/admin/auditoria/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error getAuditoriaDashboard:', error);
        throw error;
    }
};